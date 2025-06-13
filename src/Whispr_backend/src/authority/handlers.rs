use crate::authority::store;
use crate::authority::types::*;
use candid::{Principal, Nat};
use ic_cdk::{api, storage, caller, trap};

// Authentication helper function
fn ensure_authority() -> Result<Principal, String> {
    let caller = caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous callers are not allowed".to_string());
    }
    
    if !store::is_authority(caller) {
        return Err("Caller is not an authorized authority".to_string());
    }
    
    Ok(caller)
}

// Initialize system and create mock data
#[ic_cdk::init]
fn init() {
    store::initialize_mock_data();
}

// Submit a new report (for users)
#[ic_cdk::update]
fn submit_report(
    title: String,
    description: String,
    category: String,
    location: Option<Location>,
    incident_date: Option<String>,
    stake_amount: u64,
    evidence_count: u32,
) -> Result<u64, String> {
    let caller = caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous callers cannot submit reports".to_string());
    }
    
    // Get or create user
    let user = match store::get_user(caller) {
        Some(user) => user,
        None => {
            // New user, create with default balance for testing
            let new_user = User {
                id: caller,
                token_balance: 100, // Default balance for new users
                reports_submitted: Vec::new(),
                rewards_earned: 0,
                stakes_active: 0,
                stakes_lost: 0,
            };
            store::create_or_update_user(new_user);
            store::get_user(caller).unwrap()
        }
    };
    
    // Check stake amount
    if stake_amount < 5 {
        return Err("Minimum stake amount is 5 tokens".to_string());
    }
    
    // Check user balance
    if user.token_balance < stake_amount {
        return Err("Insufficient token balance for staking".to_string());
    }
    
    // Create report
    let report = Report {
        id: 0, // Will be assigned by create_report
        title,
        description,
        category,
        date_submitted: api::time(),
        incident_date,
        location,
        submitter_id: caller,
        evidence_count,
        evidence_files: Vec::new(),
        stake_amount,
        reward_amount: 0,
        status: ReportStatus::Pending,
        reviewer: None,
        review_date: None,
        review_notes: None,
    };
    
    let report_id = store::create_report(&report);
    
    // Update user's balance and active stakes
    let mut updated_user = user;
    updated_user.token_balance -= stake_amount;
    updated_user.stakes_active += stake_amount;
    updated_user.reports_submitted.push(report_id);
    store::create_or_update_user(updated_user);
    
    // Add a system message
    let system_message = Message {
        id: 0,
        report_id,
        sender: MessageSender::System,
        content: format!("Report submitted with a stake of {} tokens", stake_amount),
        timestamp: api::time(),
        attachment: None,
    };
    
    store::create_message(&system_message);
    
    Ok(report_id)
}

// Get all reports (for authority)
#[ic_cdk::query]
fn get_all_reports() -> Result<Vec<Report>, String> {
    ensure_authority()?;
    Ok(store::get_all_reports())
}

// Get reports by status (for authority)
#[ic_cdk::query]
fn get_reports_by_status(status: ReportStatus) -> Result<Vec<Report>, String> {
    ensure_authority()?;
    Ok(store::get_reports_by_status(status))
}

// Get a single report by ID (for both users and authority)
#[ic_cdk::query]
fn get_report(id: u64) -> Vec<Report> {
    match store::get_report(id) {
        Some(report) => {
            let caller = caller();
            
            // Check if caller is report submitter or an authority
            if report.submitter_id == caller || store::is_authority(caller) {
                vec![report]
            } else {
                // Return empty if not authorized
                vec![]
            }
        },
        None => vec![]
    }
}

// Get user's reports (for users)
#[ic_cdk::query]
fn get_user_reports() -> Vec<Report> {
    let caller = caller();
    
    if caller == Principal::anonymous() {
        return vec![];
    }
    
    store::get_user_reports(caller)
}

// Verify a report (for authority)
#[ic_cdk::update]
fn verify_report(report_id: u64, notes: Option<String>) -> Result<(), String> {
    let authority_id = ensure_authority()?;
    
    // Get the report
    let report = match store::get_report(report_id) {
        Some(report) => report,
        None => return Err("Report not found".to_string()),
    };
    
    // Check if report is pending
    if report.status != ReportStatus::Pending {
        return Err(format!("Report is already in {:?} state", report.status));
    }
    
    let submitter_id = report.submitter_id;
    let stake_amount = report.stake_amount;
    
    // Calculate reward
    let reward_amount = stake_amount * 10; // 10x reward multiplier
    
    // Update report status
    let mut updated_report = report;
    updated_report.status = ReportStatus::Approved;
    updated_report.reviewer = Some(authority_id);
    updated_report.review_date = Some(api::time());
    updated_report.review_notes = notes;
    updated_report.reward_amount = reward_amount;
    
    store::update_report(updated_report)?;
    
    // Get submitter
    let submitter = match store::get_user(submitter_id) {
        Some(user) => user,
        None => return Err("Report submitter not found".to_string()),
    };
    
    // Update submitter's token balance (return stake + add reward)
    let mut updated_submitter = submitter;
    updated_submitter.token_balance += stake_amount + reward_amount;
    updated_submitter.stakes_active -= stake_amount;
    updated_submitter.rewards_earned += reward_amount;
    
    store::create_or_update_user(updated_submitter);
    
    // Add system message
    let message = Message {
        id: 0,
        report_id,
        sender: MessageSender::System,
        content: format!("This report has been verified. {} tokens have been awarded as a reward.", reward_amount),
        timestamp: api::time(),
        attachment: None,
    };
    
    store::create_message(&message);
    
    // Update authority stats
    let mut stats = store::get_authority_stats();
    stats.total_rewards_distributed += reward_amount;
    store::update_authority_stats(stats);
    
    Ok(())
}

// Reject a report (for authority)
#[ic_cdk::update]
fn reject_report(report_id: u64, notes: Option<String>) -> Result<(), String> {
    let authority_id = ensure_authority()?;
    
    // Get the report
    let report = match store::get_report(report_id) {
        Some(report) => report,
        None => return Err("Report not found".to_string()),
    };
    
    // Check if report is pending
    if report.status != ReportStatus::Pending {
        return Err(format!("Report is already in {:?} state", report.status));
    }
    
    let submitter_id = report.submitter_id;
    let stake_amount = report.stake_amount;
    
    // Update report status
    let mut updated_report = report;
    updated_report.status = ReportStatus::Rejected;
    updated_report.reviewer = Some(authority_id);
    updated_report.review_date = Some(api::time());
    updated_report.review_notes = notes;
    
    store::update_report(updated_report)?;
    
    // Get submitter
    let submitter = match store::get_user(submitter_id) {
        Some(user) => user,
        None => return Err("Report submitter not found".to_string()),
    };
    
    // Update submitter's stakes (stake is lost)
    let mut updated_submitter = submitter;
    updated_submitter.stakes_active -= stake_amount;
    updated_submitter.stakes_lost += stake_amount;
    
    store::create_or_update_user(updated_submitter);
    
    // Add system message
    let message = Message {
        id: 0,
        report_id,
        sender: MessageSender::System,
        content: format!("This report has been rejected. The staked {} tokens have been lost.", stake_amount),
        timestamp: api::time(),
        attachment: None,
    };
    
    store::create_message(&message);
    
    Ok(())
}

// Send a message as authority
#[ic_cdk::update]
fn send_message_as_authority(report_id: u64, content: String) -> Result<(), String> {
    let authority_id = ensure_authority()?;
    
    // Check if report exists
    if store::get_report(report_id).is_none() {
        return Err("Report not found".to_string());
    }
    
    // Create message
    let message = Message {
        id: 0,
        report_id,
        sender: MessageSender::Authority(authority_id),
        content,
        timestamp: api::time(),
        attachment: None,
    };
    
    store::create_message(&message);
    
    Ok(())
}

// Send a message as informer
#[ic_cdk::update]
fn send_message_as_reporter(report_id: u64, content: String) -> Result<(), String> {
    let caller = caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous callers cannot send messages".to_string());
    }
    
    // Check if report exists and caller is the submitter
    let report = match store::get_report(report_id) {
        Some(report) => report,
        None => return Err("Report not found".to_string()),
    };
    
    if report.submitter_id != caller {
        return Err("You can only send messages for your own reports".to_string());
    }
    
    // Create message
    let message = Message {
        id: 0,
        report_id,
        sender: MessageSender::Reporter(caller),
        content,
        timestamp: api::time(),
        attachment: None,
    };
    
    store::create_message(&message);
    
    Ok(())
}

// Get messages for a report
#[ic_cdk::query]
fn get_messages(report_id: u64) -> Vec<Message> {
    let caller = caller();
    
    // Check if report exists
    let report = match store::get_report(report_id) {
        Some(report) => report,
        None => return vec![],
    };
    
    // Check if caller is authorized to see messages
    if report.submitter_id != caller && !store::is_authority(caller) {
        return vec![];
    }
    
    store::get_report_messages(report_id)
}

// Get user token balance
#[ic_cdk::query]
fn get_user_balance() -> u64 {
    let caller = caller();
    
    if caller == Principal::anonymous() {
        return 0;
    }
    
    match store::get_user(caller) {
        Some(user) => user.token_balance,
        None => 0
    }
}

// Get authority stats
#[ic_cdk::query]
fn get_authority_statistics() -> Result<AuthorityStats, String> {
    ensure_authority()?;
    Ok(store::get_authority_stats())
}

// Add a new authority (only for existing authorities)
#[ic_cdk::update]
fn add_new_authority(id: Principal) -> Result<(), String> {
    ensure_authority()?;
    
    if store::is_authority(id) {
        return Err("Principal is already an authority".to_string());
    }
    
    let authority = Authority {
        id,
        reports_reviewed: Vec::new(),
        approval_rate: 0.0,
    };
    
    store::add_authority(authority);
    
    Ok(())
}

// For development: Reset to initial state with mock data
#[ic_cdk::update]
fn reset_to_mock_data() -> Result<(), String> {
    ensure_authority()?;
    
    // This would be implemented to clear existing data and reinitialize mock data
    // For brevity, we'll just call initialize again
    store::initialize_mock_data();
    
    Ok(())
}