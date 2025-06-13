use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk::export::candid;
use ic_cdk::storage;
use ic_cdk_macros::*;
use std::collections::BTreeMap;
use std::convert::TryFrom;
use std::string::ToString;

// Report data structures
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct LocationData {
    address: String,
    coordinates: Option<Coordinates>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Coordinates {
    lat: f64,
    lng: f64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct EvidenceFile {
    name: String,
    file_type: String,
    size: u64,
    content: Vec<u8>, // Binary content
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ReportStatus {
    Pending,
    Verified,
    Rejected,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Report {
    id: String,
    reporter: Principal,
    title: String,
    description: String,
    location: LocationData,
    date: Option<String>,
    time: Option<String>,
    category: String,
    evidence_files: Vec<EvidenceFile>,
    stake_amount: u64,
    status: ReportStatus,
    created_at: u64,
    reward: u64,
    has_messages: bool,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ReportSubmission {
    title: String,
    description: String,
    location: LocationData,
    date: Option<String>,
    time: Option<String>,
    category: String,
    evidence_files: Vec<EvidenceFile>,
    stake_amount: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ReportSummary {
    id: String,
    title: String,
    category: String,
    date: String,
    status: String,
    stake: u64,
    reward: u64,
    has_messages: bool,
}

// Storage management using thread_local
thread_local! {
    static REPORTS: storage::Storage<BTreeMap<String, Report>> = storage::Storage::init(BTreeMap::new());
    static USER_REPORTS: storage::Storage<BTreeMap<Principal, Vec<String>>> = storage::Storage::init(BTreeMap::new());
    static USER_BALANCES: storage::Storage<BTreeMap<Principal, u64>> = storage::Storage::init(BTreeMap::new());
}

// Utility function to generate a unique report ID
fn generate_report_id() -> String {
    let timestamp = time();
    format!("0x{:x}", timestamp)
}

fn map_status_to_string(status: &ReportStatus) -> String {
    match status {
        ReportStatus::Pending => "pending".to_string(),
        ReportStatus::Verified => "verified".to_string(),
        ReportStatus::Rejected => "rejected".to_string(),
    }
}

// QUERY: Get a specific report by ID
#[query]
fn get_report(report_id: String) -> Option<Report> {
    REPORTS.with(|reports| {
        let reports_map = reports.borrow();
        reports_map.get(&report_id).cloned()
    })
}

// QUERY: Get all reports for the caller
#[query]
fn get_my_reports() -> Vec<ReportSummary> {
    let caller = ic_cdk::caller();
    USER_REPORTS.with(|user_reports| {
        let user_reports_map = user_reports.borrow();
        if let Some(report_ids) = user_reports_map.get(&caller) {
            REPORTS.with(|reports| {
                let reports_map = reports.borrow();
                report_ids
                    .iter()
                    .filter_map(|id| reports_map.get(id))
                    .map(|report| ReportSummary {
                        id: report.id.clone(),
                        title: report.title.clone(),
                        category: report.category.clone(),
                        date: report.date.clone().unwrap_or_else(|| "N/A".to_string()),
                        status: map_status_to_string(&report.status),
                        stake: report.stake_amount,
                        reward: report.reward,
                        has_messages: report.has_messages,
                    })
                    .collect()
            })
        } else {
            Vec::new()
        }
    })
}

// UPDATE: Submit a new report
#[update]
fn submit_report(submission: ReportSubmission) -> String {
    let caller = ic_cdk::caller();
    let report_id = generate_report_id();
    
    let report = Report {
        id: report_id.clone(),
        reporter: caller,
        title: submission.title,
        description: submission.description,
        location: submission.location,
        date: submission.date,
        time: submission.time,
        category: submission.category,
        evidence_files: submission.evidence_files,
        stake_amount: submission.stake_amount,
        status: ReportStatus::Pending,
        created_at: time(),
        reward: 0,
        has_messages: false,
    };
    
    // Save the report
    REPORTS.with(|reports| {
        let mut reports_map = reports.borrow_mut();
        reports_map.insert(report_id.clone(), report);
    });
    
    // Update the user's reports list
    USER_REPORTS.with(|user_reports| {
        let mut user_reports_map = user_reports.borrow_mut();
        let user_report_ids = user_reports_map.entry(caller).or_insert_with(Vec::new);
        user_report_ids.push(report_id.clone());
    });
    
    // Deduct tokens from user balance
    USER_BALANCES.with(|balances| {
        let mut balances_map = balances.borrow_mut();
        let current_balance = balances_map.entry(caller).or_insert(250);
        if *current_balance >= submission.stake_amount {
            *current_balance -= submission.stake_amount;
        }
    });
    
    report_id
}

// UPDATE: Verify a report (for authorities)
#[update]
fn verify_report(report_id: String, reward_amount: u64) -> bool {
    REPORTS.with(|reports| {
        let mut reports_map = reports.borrow_mut();
        if let Some(report) = reports_map.get_mut(&report_id) {
            report.status = ReportStatus::Verified;
            report.reward = reward_amount;
            
            // Add reward to user balance
            let reporter = report.reporter;
            USER_BALANCES.with(|balances| {
                let mut balances_map = balances.borrow_mut();
                let current_balance = balances_map.entry(reporter).or_insert(250);
                *current_balance += reward_amount;
            });
            
            true
        } else {
            false
        }
    })
}

// UPDATE: Reject a report (for authorities)
#[update]
fn reject_report(report_id: String) -> bool {
    REPORTS.with(|reports| {
        let mut reports_map = reports.borrow_mut();
        if let Some(report) = reports_map.get_mut(&report_id) {
            report.status = ReportStatus::Rejected;
            true
        } else {
            false
        }
    })
}

// Get user token balance
#[query]
fn get_token_balance() -> u64 {
    let caller = ic_cdk::caller();
    USER_BALANCES.with(|balances| {
        let balances_map = balances.borrow();
        *balances_map.get(&caller).unwrap_or(&250)
    })
}

// For testing: get the original greeting function
#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

// Generate Candid interface
ic_cdk::export_candid!();