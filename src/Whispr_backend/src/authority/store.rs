use crate::authority::types::*;
use candid::Principal;
use ic_stable_structures::{memory_manager::{MemoryId, MemoryManager, VirtualMemory}, 
                          DefaultMemoryImpl, StableBTreeMap};
use std::cell::RefCell;
use std::collections::HashMap;

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    // Memory manager for stable storage
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = 
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // Reports storage
    static REPORTS: RefCell<StableBTreeMap<u64, Report, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(0))),
        )
    );
    
    // Users storage
    static USERS: RefCell<StableBTreeMap<Principal, User, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(1))),
        )
    );
    
    // Authorities storage
    static AUTHORITIES: RefCell<StableBTreeMap<Principal, Authority, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(2))),
        )
    );
    
    // Messages storage
    static MESSAGES: RefCell<StableBTreeMap<u64, Message, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(3))),
        )
    );
    
    // Evidence files storage
    static EVIDENCE_FILES: RefCell<StableBTreeMap<u64, EvidenceFile, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(4))),
        )
    );
    
    // Counters for IDs
    static NEXT_REPORT_ID: RefCell<u64> = RefCell::new(1);
    static NEXT_MESSAGE_ID: RefCell<u64> = RefCell::new(1);
    static NEXT_EVIDENCE_ID: RefCell<u64> = RefCell::new(1);
    
    // Global configuration
    static REWARD_CONFIG: RefCell<RewardConfig> = RefCell::new(RewardConfig {
        reward_multiplier: 10,
        min_stake_amount: 5,
        max_stake_amount: 100,
    });
    
    // Authority stats
    static AUTHORITY_STATS: RefCell<AuthorityStats> = RefCell::new(AuthorityStats {
        reports_pending: 0,
        reports_verified: 0,
        reports_rejected: 0,
        total_rewards_distributed: 0,
    });
    
    // Report messages mapping (report_id -> message_ids)
    static REPORT_MESSAGES: RefCell<HashMap<u64, Vec<u64>>> = RefCell::new(HashMap::new());
}

// Reports operations
pub fn create_report(report: &Report) -> u64 {
    let id = NEXT_REPORT_ID.with(|counter| {
        let id = *counter.borrow();
        *counter.borrow_mut() = id + 1;
        id
    });
    
    let mut new_report = report.clone();
    new_report.id = id;
    
    REPORTS.with(|reports| {
        reports.borrow_mut().insert(id, new_report);
    });
    
    // Update stats
    AUTHORITY_STATS.with(|stats| {
        stats.borrow_mut().reports_pending += 1;
    });
    
    id
}

pub fn get_report(id: u64) -> Option<Report> {
    REPORTS.with(|reports| {
        reports.borrow().get(&id)
    })
}

pub fn get_all_reports() -> Vec<Report> {
    REPORTS.with(|reports| {
        let reports_map = reports.borrow();
        reports_map.iter().map(|(_, report)| report).collect()
    })
}

pub fn get_reports_by_status(status: ReportStatus) -> Vec<Report> {
    REPORTS.with(|reports| {
        let reports_map = reports.borrow();
        reports_map.iter()
            .filter(|(_, r)| r.status == status)
            .map(|(_, report)| report)
            .collect()
    })
}

pub fn update_report(report: Report) -> Result<(), String> {
    let report_id = report.id;
    
    let old_report = REPORTS.with(|reports| reports.borrow().get(&report_id));
    
    if old_report.is_none() {
        return Err("Report not found".to_string());
    }
    
    let old_report = old_report.unwrap();
    
    // Update stats if status changed
    if old_report.status != report.status {
        AUTHORITY_STATS.with(|stats| {
            let mut stats = stats.borrow_mut();
            match old_report.status {
                ReportStatus::Pending => stats.reports_pending -= 1,
                ReportStatus::Approved => stats.reports_verified -= 1,
                ReportStatus::Rejected => stats.reports_rejected -= 1,
                _ => {}
            }
            
            match report.status {
                ReportStatus::Pending => stats.reports_pending += 1,
                ReportStatus::Approved => stats.reports_verified += 1,
                ReportStatus::Rejected => stats.reports_rejected += 1,
                _ => {}
            }
        });
    }
    
    REPORTS.with(|reports| {
        reports.borrow_mut().insert(report_id, report);
    });
    
    Ok(())
}

// Users operations
pub fn get_user(id: Principal) -> Option<User> {
    USERS.with(|users| {
        users.borrow().get(&id)
    })
}

pub fn create_or_update_user(user: User) {
    USERS.with(|users| {
        users.borrow_mut().insert(user.id, user);
    });
}

pub fn get_user_reports(user_id: Principal) -> Vec<Report> {
    REPORTS.with(|reports| {
        let reports_map = reports.borrow();
        reports_map.iter()
            .filter(|(_, r)| r.submitter_id == user_id)
            .map(|(_, report)| report)
            .collect()
    })
}

// Token operations
pub fn transfer_tokens(from: Principal, to: Principal, amount: u64) -> Result<(), String> {
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        
        // Get source account
        let source = match users.get(&from) {
            Some(user) => user,
            None => return Err("Source user not found".to_string()),
        };
        
        // Check balance
        if source.token_balance < amount {
            return Err("Insufficient token balance".to_string());
        }
        
        // Get or create destination account
        let destination = match users.get(&to) {
            Some(user) => user,
            None => User {
                id: to,
                token_balance: 0,
                reports_submitted: Vec::new(),
                rewards_earned: 0,
                stakes_active: 0,
                stakes_lost: 0,
            },
        };
        
        // Update balances
        let mut source_updated = source.clone();
        source_updated.token_balance -= amount;
        
        let mut dest_updated = destination.clone();
        dest_updated.token_balance += amount;
        
        // Save updated accounts
        users.insert(from, source_updated);
        users.insert(to, dest_updated);
        
        Ok(())
    })
}

// Authority operations
pub fn is_authority(id: Principal) -> bool {
    AUTHORITIES.with(|authorities| {
        authorities.borrow().contains_key(&id)
    })
}

pub fn add_authority(authority: Authority) {
    AUTHORITIES.with(|authorities| {
        authorities.borrow_mut().insert(authority.id, authority);
    });
}

// Message operations
pub fn create_message(message: &Message) -> u64 {
    let id = NEXT_MESSAGE_ID.with(|counter| {
        let id = *counter.borrow();
        *counter.borrow_mut() = id + 1;
        id
    });
    
    let mut new_message = message.clone();
    new_message.id = id;
    
    MESSAGES.with(|messages| {
        messages.borrow_mut().insert(id, new_message.clone());
    });
    
    // Add to report messages mapping
    REPORT_MESSAGES.with(|report_messages| {
        let mut map = report_messages.borrow_mut();
        map.entry(new_message.report_id)
           .or_insert_with(Vec::new)
           .push(id);
    });
    
    id
}

pub fn get_report_messages(report_id: u64) -> Vec<Message> {
    let message_ids = REPORT_MESSAGES.with(|report_messages| {
        report_messages.borrow().get(&report_id).cloned().unwrap_or_default()
    });
    
    MESSAGES.with(|messages| {
        let messages_map = messages.borrow();
        message_ids.iter()
            .filter_map(|id| messages_map.get(id))
            .collect()
    })
}

// Evidence operations
pub fn add_evidence_file(file: &EvidenceFile) -> u64 {
    let id = NEXT_EVIDENCE_ID.with(|counter| {
        let id = *counter.borrow();
        *counter.borrow_mut() = id + 1;
        id
    });
    
    let mut new_file = file.clone();
    new_file.id = id;
    
    EVIDENCE_FILES.with(|files| {
        files.borrow_mut().insert(id, new_file);
    });
    
    id
}

pub fn get_evidence_file(id: u64) -> Option<EvidenceFile> {
    EVIDENCE_FILES.with(|files| {
        files.borrow().get(&id)
    })
}

// Statistics
pub fn get_authority_stats() -> AuthorityStats {
    AUTHORITY_STATS.with(|stats| stats.borrow().clone())
}

pub fn update_authority_stats(stats: AuthorityStats) {
    AUTHORITY_STATS.with(|s| {
        *s.borrow_mut() = stats;
    });
}

// Initialize mock data for testing
pub fn initialize_mock_data() {
    // Only initialize if no data exists
    let report_count = REPORTS.with(|reports| reports.borrow().len());
    
    if report_count > 0 {
        return; // Data already exists
    }
    
    // Create authorities
    let authority1 = Authority {
        id: Principal::from_text("d27x5-vpdgv-xg4ve-woszp-ulej4-4hlq4-xrlwz-nyedm-rtjsa-a2d2z-oqe").unwrap_or_else(|_| Principal::anonymous()),
        reports_reviewed: Vec::new(),
        approval_rate: 0.0,
    };
    
    add_authority(authority1);
    
    // Create users
    let user1 = User {
        id: Principal::from_text("2vxsx-fae").unwrap_or_else(|_| Principal::anonymous()),
        token_balance: 500,
        reports_submitted: Vec::new(),
        rewards_earned: 0,
        stakes_active: 0,
        stakes_lost: 0,
    };
    
    let user2 = User {
        id: Principal::from_text("3dkmc-byamr-3ypol-hgppr-645za-wxgml-ba5t2-a").unwrap_or_else(|_| Principal::anonymous()),
        token_balance: 750,
        reports_submitted: Vec::new(),
        rewards_earned: 0,
        stakes_active: 0,
        stakes_lost: 0,
    };
    
    let user3 = User {
        id: Principal::from_text("2ibo7-dia").unwrap_or_else(|_| Principal::anonymous()),
        token_balance: 1000,
        reports_submitted: Vec::new(),
        rewards_earned: 0,
        stakes_active: 0,
        stakes_lost: 0,
    };
    
    create_or_update_user(user1.clone());
    create_or_update_user(user2.clone());
    create_or_update_user(user3.clone());
    
    // Create reports
    let timestamp_now = ic_cdk::api::time();
    let day_in_ns = 86400_000_000_000;

    // Report 1
    let report1 = Report {
        id: 0,
        title: "Environmental Dumping Near River".to_string(),
        description: "Multiple industrial containers being dumped in the river near manufacturing zone. Activity observed between 2-4 AM with trucks bearing no license plates.".to_string(),
        category: "environmental".to_string(),
        date_submitted: timestamp_now - day_in_ns * 5,
        incident_date: Some("2025-04-21".to_string()),
        location: Some(Location {
            address: Some("Near Industrial Zone, South River Bank".to_string()),
            latitude: 20.5937,
            longitude: 78.9629,
        }),
        submitter_id: user1.id,
        evidence_count: 3,
        evidence_files: Vec::new(),
        stake_amount: 15,
        reward_amount: 0,
        status: ReportStatus::Pending,
        reviewer: None,
        review_date: None,
        review_notes: None,
    };

    // Report 2
    let report2 = Report {
        id: 0,
        title: "Suspicious Financial Activity".to_string(),
        description: "Unusual pattern of transactions from multiple accounts feeding into offshore accounts. Potential money laundering scheme involving local businesses.".to_string(),
        category: "fraud".to_string(),
        date_submitted: timestamp_now - day_in_ns * 4,
        incident_date: Some("2025-04-22".to_string()),
        location: Some(Location {
            address: Some("Financial District, Downtown".to_string()),
            latitude: 19.0760,
            longitude: 72.8777,
        }),
        submitter_id: user2.id,
        evidence_count: 1,
        evidence_files: Vec::new(),
        stake_amount: 20,
        reward_amount: 0,
        status: ReportStatus::Pending,
        reviewer: None,
        review_date: None,
        review_notes: None,
    };

    // Report 3
    let report3 = Report {
        id: 0,
        title: "Cyber Attack Attempt".to_string(),
        description: "Multiple unauthorized access attempts to government database detected. IP addresses traced to foreign servers. Advanced techniques used to bypass security.".to_string(),
        category: "cybercrime".to_string(),
        date_submitted: timestamp_now - day_in_ns * 3,
        incident_date: Some("2025-04-23".to_string()),
        location: Some(Location {
            address: Some("Online - Multiple IP addresses".to_string()),
            latitude: 28.6139,
            longitude: 77.2090,
        }),
        submitter_id: user3.id,
        evidence_count: 5,
        evidence_files: Vec::new(),
        stake_amount: 10,
        reward_amount: 0,
        status: ReportStatus::Pending,
        reviewer: None,
        review_date: None,
        review_notes: None,
    };

    // Report 4
    let report4 = Report {
        id: 0,
        title: "Counterfeit Products Distribution".to_string(),
        description: "Large scale counterfeit luxury goods being sold in local markets. Products have fake authentication certificates and packaging.".to_string(),
        category: "fraud".to_string(),
        date_submitted: timestamp_now - day_in_ns * 30,
        incident_date: Some("2025-03-24".to_string()),
        location: Some(Location {
            address: Some("Main Market Area, City Center".to_string()),
            latitude: 13.0827,
            longitude: 80.2707,
        }),
        submitter_id: user1.id,
        evidence_count: 2,
        evidence_files: Vec::new(),
        stake_amount: 5,
        reward_amount: 0,
        status: ReportStatus::Pending,
        reviewer: None,
        review_date: None,
        review_notes: None,
    };

    // Report 5
    let report5 = Report {
        id: 0,
        title: "Illegal Waste Disposal".to_string(),
        description: "Company disposing hazardous waste in protected area during night hours. Chemical waste being buried in plastic containers.".to_string(),
        category: "environmental".to_string(),
        date_submitted: timestamp_now - day_in_ns * 34,
        incident_date: Some("2025-03-23".to_string()),
        location: Some(Location {
            address: Some("Protected Forest Area, Northern Region".to_string()),
            latitude: 34.0837,
            longitude: 74.7973,
        }),
        submitter_id: user3.id,
        evidence_count: 4,
        evidence_files: Vec::new(),
        stake_amount: 25,
        reward_amount: 0,
        status: ReportStatus::Pending,
        reviewer: None,
        review_date: None,
        review_notes: None,
    };
    
    // Save reports
    let report1_id = create_report(&report1);
    let report2_id = create_report(&report2);
    let report3_id = create_report(&report3);
    let report4_id = create_report(&report4);
    let report5_id = create_report(&report5);
    
    // Update users with their report IDs
    let mut user1 = get_user(user1.id).unwrap();
    let mut user2 = get_user(user2.id).unwrap();
    let mut user3 = get_user(user3.id).unwrap();
    
    user1.reports_submitted.push(report1_id);
    user1.reports_submitted.push(report4_id);
    user1.stakes_active += 20; // 15 + 5
    
    user2.reports_submitted.push(report2_id);
    user2.stakes_active += 20;
    
    user3.reports_submitted.push(report3_id);
    user3.reports_submitted.push(report5_id);
    user3.stakes_active += 35; // 10 + 25
    
    create_or_update_user(user1);
    create_or_update_user(user2);
    create_or_update_user(user3);
    
    // Create some messages for reports
    let message1 = Message {
        id: 0,
        report_id: report1_id,
        sender: MessageSender::Reporter(Principal::from_text("2vxsx-fae").unwrap_or_else(|_| Principal::anonymous())),
        content: "I have submitted additional evidence via email.".to_string(),
        timestamp: timestamp_now - day_in_ns * 1,
        attachment: None,
    };
    
    let message2 = Message {
        id: 0,
        report_id: report1_id,
        sender: MessageSender::Authority(Principal::from_text("d27x5-vpdgv-xg4ve-woszp-ulej4-4hlq4-xrlwz-nyedm-rtjsa-a2d2z-oqe").unwrap_or_else(|_| Principal::anonymous())),
        content: "Thank you for your report. We will investigate this matter.".to_string(),
        timestamp: timestamp_now - day_in_ns / 2,
        attachment: None,
    };
    
    let message3 = Message {
        id: 0,
        report_id: report3_id,
        sender: MessageSender::Reporter(Principal::from_text("2ibo7-dia").unwrap_or_else(|_| Principal::anonymous())),
        content: "I have the server logs available if needed.".to_string(),
        timestamp: timestamp_now - day_in_ns * 2,
        attachment: None,
    };
    
    create_message(&message1);
    create_message(&message2);
    create_message(&message3);
    
    // Update stats
    AUTHORITY_STATS.with(|stats| {
        let mut stats = stats.borrow_mut();
        stats.reports_pending = 5;
        stats.reports_verified = 156; // Mock historical data
        stats.reports_rejected = 42; // Mock historical data
        stats.total_rewards_distributed = 4350; // Mock historical data
    });
}