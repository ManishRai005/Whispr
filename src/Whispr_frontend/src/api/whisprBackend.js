import { Actor, HttpAgent } from '@dfinity/agent';

// Try different import paths until one works
let idlFactory;
try {
  idlFactory = require('../../../declarations/Whispr_backend/Whispr_backend.did.js').idlFactory;
} catch (e) {
  try {
    idlFactory = require('../../../../declarations/Whispr_backend/Whispr_backend.did.js').idlFactory;
  } catch (e) {
    try {
      idlFactory = require('../../../src/declarations/Whispr_backend/Whispr_backend.did.js').idlFactory;
    } catch (e) {
      console.error("Could not find Whispr_backend declarations:", e);
      idlFactory = null;
    }
  }
}

// Use the correct canister ID from your deployment
const CANISTER_ID = "vizcg-th777-77774-qaaea-cai";
const HOST = "http://localhost:4943";

// Initialize agent
const agent = new HttpAgent({ host: HOST });

// In local development, we need to fetch the root key
if (process.env.NODE_ENV !== 'production') {
  try {
    agent.fetchRootKey().catch(err => {
      console.warn('Unable to fetch root key:', err);
    });
  } catch (e) {
    console.warn('Could not fetch root key:', e);
  }
}

// Create actor for backend canister
let whisprBackend;
try {
  if (idlFactory) {
    whisprBackend = Actor.createActor(idlFactory, {
      agent,
      canisterId: CANISTER_ID,
    });
    console.log("Successfully connected to Whispr_backend canister");
  } else {
    throw new Error("IDL factory not found");
  }
} catch (error) {
  console.error("Failed to create actor:", error);
  whisprBackend = createMockBackend();
}

// Mock implementation as fallback
function createMockBackend() {
  console.warn("Using mock backend implementation");
  
  // In-memory storage for our mock implementation to ensure consistency
  const mockStorage = {
    reports: [],
    users: [
      { 
        id: "2vxsx-fae", 
        tokenBalance: 250, 
        reportsSubmitted: [], 
        stakesActive: 0,
        stakesLost: 0,
        rewardsEarned: 0
      }
    ],
    statistics: {
      reports_pending: 5,
      reports_verified: 156,
      reports_rejected: 42,
      total_rewards_distributed: 4350
    },
    nextReportId: 1,
    // Reward multiplier for verified reports
    rewardMultiplier: 10
  };
  
  // Helper function to ensure we correctly convert between string and numeric report IDs
  const findReportIndex = (reportId) => {
    const reportIdStr = String(reportId).replace(/^0x/, '');
    
    return mockStorage.reports.findIndex(r => {
      const currentId = String(r.id).replace(/^0x/, '');
      return currentId === reportIdStr;
    });
  };
  
  return {
    submit_report: async (data) => {
      const reportId = "0x" + Math.floor(Date.now() / 1000).toString(16);
      console.log("Mock submit_report called with:", data);
      console.log("Generated mock report ID:", reportId);
      
      // Add to mock storage
      mockStorage.reports.push({
        id: reportId,
        title: data.title,
        description: data.description,
        category: data.category,
        date_submitted: BigInt(Date.now() * 1000000),
        incident_date: data.date && data.date.length > 0 ? data.date[0] : null,
        incident_time: data.time && data.time.length > 0 ? data.time[0] : null,
        location: data.location,
        submitter_id: "2vxsx-fae",
        evidence_count: 0,
        stake_amount: BigInt(data.stake_amount),
        reward_amount: BigInt(0),
        status: { Pending: null },
        reviewer: null,
        review_date: null,
        review_notes: null
      });
      
      // Update statistics
      mockStorage.statistics.reports_pending++;
      
      // Update user's staked tokens
      const userIndex = mockStorage.users.findIndex(u => u.id === "2vxsx-fae");
      if (userIndex >= 0) {
        mockStorage.users[userIndex].tokenBalance -= Number(data.stake_amount);
        mockStorage.users[userIndex].stakesActive += Number(data.stake_amount);
        mockStorage.users[userIndex].reportsSubmitted.push(reportId);
      }
      
      return reportId;
    },
    
    get_my_reports: async () => {
      return mockStorage.reports.map(report => ({
        id: report.id,
        title: report.title,
        category: report.category,
        date: report.incident_date,
        time: report.incident_time,
        status: getStatusString(report.status),
        stake: Number(report.stake_amount),
        reward: Number(report.reward_amount),
        has_messages: false
      }));
    },
    
    get_token_balance: async () => {
      const user = mockStorage.users.find(u => u.id === "2vxsx-fae");
      return user ? user.tokenBalance : 250;
    },
    
    get_report: async (id) => {
      const reportIdStr = String(id);
      const report = mockStorage.reports.find(r => String(r.id) === reportIdStr);
      return report || null;
    },
    
    // Authority functions with proper statistics updating
    get_authority_statistics: async () => {
      return {
        Ok: mockStorage.statistics
      };
    },
    
    get_reports_by_status: async (status) => {
      const statusKey = Object.keys(status)[0];
      
      // Filter reports based on status
      const filteredReports = mockStorage.reports.filter(r => {
        if (statusKey === 'all') return true;
        
        const reportStatus = Object.keys(r.status)[0];
        return reportStatus.toLowerCase() === statusKey.toLowerCase();
      });
      
      return {
        Ok: filteredReports.map(r => ({
          id: BigInt(parseInt(r.id.replace(/^0x/, ''), 16) || 0),
          title: r.title,
          description: r.description || "",
          category: r.category,
          date_submitted: BigInt(Date.now() * 1000000),
          incident_date: r.incident_date ? [r.incident_date] : [],
          incident_time: r.incident_time ? [r.incident_time] : [],
          location: r.location || { address: "", coordinates: null },
          submitter_id: { toText: () => "2vxsx-fae" },
          evidence_count: r.evidence_count || 0,
          stake_amount: r.stake_amount || BigInt(0),
          reward_amount: r.reward_amount || BigInt(0),
          status: r.status || { Pending: null },
          reviewer: r.reviewer || null,
          review_date: r.review_date ? BigInt(r.review_date) : null,
          review_notes: r.review_notes || []
        }))
      };
    },
    
    verify_report: async (id, notes) => {
      const reportIdStr = String(id);
      const reportIndex = findReportIndex(reportIdStr);
      
      if (reportIndex === -1) {
        return { Err: "Report not found" };
      }
      
      // Get original status for statistics update
      const originalStatus = Object.keys(mockStorage.reports[reportIndex].status)[0];
      
      // Update the report
      const stakeAmount = Number(mockStorage.reports[reportIndex].stake_amount);
      const rewardAmount = stakeAmount * mockStorage.rewardMultiplier; // 10x reward
      
      mockStorage.reports[reportIndex].status = { Approved: null };
      mockStorage.reports[reportIndex].reward_amount = BigInt(rewardAmount);
      mockStorage.reports[reportIndex].review_date = BigInt(Date.now() * 1000000);
      mockStorage.reports[reportIndex].reviewer = "authority";
      mockStorage.reports[reportIndex].review_notes = notes && notes.length > 0 ? notes[0] : null;
      
      // Update user's tokens
      const userIndex = mockStorage.users.findIndex(u => u.id === "2vxsx-fae");
      if (userIndex >= 0) {
        // Return stake and add reward
        mockStorage.users[userIndex].tokenBalance += stakeAmount + rewardAmount;
        mockStorage.users[userIndex].stakesActive -= stakeAmount;
        mockStorage.users[userIndex].rewardsEarned += rewardAmount;
      }
      
      // Update statistics
      if (originalStatus.toLowerCase() === 'pending') {
        mockStorage.statistics.reports_pending--;
      }
      mockStorage.statistics.reports_verified++;
      mockStorage.statistics.total_rewards_distributed += rewardAmount;
      
      // Update localStorage immediately 
      updateLocalReportStatus(reportIdStr, 'verified', notes && notes.length > 0 ? notes[0] : '', stakeAmount, rewardAmount);
      
      console.log(`Mock verify report: ${id} with notes: ${notes}, reward: ${rewardAmount}`);
      return { Ok: null };
    },
    
    reject_report: async (id, notes) => {
      const reportIdStr = String(id);
      const reportIndex = findReportIndex(reportIdStr);
      
      if (reportIndex === -1) {
        return { Err: "Report not found" };
      }
      
      // Get original status for statistics update
      const originalStatus = Object.keys(mockStorage.reports[reportIndex].status)[0];
      
      // Update the report
      const stakeAmount = Number(mockStorage.reports[reportIndex].stake_amount);
      
      mockStorage.reports[reportIndex].status = { Rejected: null };
      mockStorage.reports[reportIndex].review_date = BigInt(Date.now() * 1000000);
      mockStorage.reports[reportIndex].reviewer = "authority";
      mockStorage.reports[reportIndex].review_notes = notes && notes.length > 0 ? notes[0] : null;
      
      // Update user's tokens - loses stake
      const userIndex = mockStorage.users.findIndex(u => u.id === "2vxsx-fae");
      if (userIndex >= 0) {
        mockStorage.users[userIndex].stakesActive -= stakeAmount;
        mockStorage.users[userIndex].stakesLost += stakeAmount;
      }
      
      // Update statistics
      if (originalStatus.toLowerCase() === 'pending') {
        mockStorage.statistics.reports_pending--;
      }
      mockStorage.statistics.reports_rejected++;
      
      // Update localStorage immediately
      updateLocalReportStatus(reportIdStr, 'rejected', notes && notes.length > 0 ? notes[0] : '', 0, 0);
      
      console.log(`Mock reject report: ${id} with notes: ${notes}`);
      return { Ok: null };
    },
    
    get_all_reports: async () => {
      return {
        Ok: mockStorage.reports.map(r => ({
          id: BigInt(parseInt(r.id.replace(/^0x/, ''), 16) || 0),
          title: r.title,
          description: r.description || "",
          category: r.category,
          date_submitted: BigInt(Date.now() * 1000000),
          incident_date: r.incident_date ? [r.incident_date] : [],
          incident_time: r.incident_time ? [r.incident_time] : [],
          location: r.location || { address: "", coordinates: null },
          submitter_id: { toText: () => "2vxsx-fae" },
          evidence_count: r.evidence_count || 0,
          stake_amount: r.stake_amount || BigInt(0),
          reward_amount: r.reward_amount || BigInt(0),
          status: r.status || { Pending: null },
          reviewer: r.reviewer || null,
          review_date: r.review_date ? BigInt(r.review_date) : null,
          review_notes: r.review_notes || []
        }))
      };
    }
  };
}

// Helper function to convert File to Base64 string
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Submit report with improved error handling and file support
export async function submitReport(reportData) {
  try {
    // Process evidence files to save them as Base64 strings
    const evidenceFiles = await Promise.all(
      reportData.evidenceFiles.map(async (file) => {
        // Convert File objects to Base64 format that can be stored persistently
        const base64Data = await convertFileToBase64(file);
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          base64Data: base64Data, // Store file as Base64 instead of URL
          lastModified: file.lastModified
        };
      })
    );
    
    // Format data for backend
    const submission = {
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      location: {
        address: reportData.location.address || "",
        coordinates: reportData.location.coordinates ? {
          lat: reportData.location.coordinates.lat,
          lng: reportData.location.coordinates.lng
        } : null
      },
      date: reportData.date ? [reportData.date] : [],
      time: reportData.time ? [reportData.time] : [],
      stake_amount: BigInt(reportData.stakeAmount)
    };
    
    // Submit to backend
    const reportId = await whisprBackend.submit_report(submission);
    console.log("Report submitted successfully, ID:", reportId);
    
    // Format the report for localStorage - basic version for the dashboard
    const formattedReport = {
      id: String(reportId),
      title: reportData.title,
      category: reportData.category,
      date: reportData.date || new Date().toISOString().split('T')[0],
      time: reportData.time || "",
      status: 'pending',
      stake: reportData.stakeAmount,
      reward: 0,
      hasMessages: false
    };
    
    // Save basic version to localStorage for immediate display in dashboard
    saveReportToLocalStorage(formattedReport);
    
    // Save detailed version with evidence files for viewing
    const detailedReport = {
      id: formattedReport.id,
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      location: reportData.location,
      date: reportData.date || new Date().toISOString().split('T')[0],
      time: reportData.time || "",
      status: 'pending',
      stake: reportData.stakeAmount,
      reward: 0,
      hasMessages: false,
      evidenceFiles: evidenceFiles,
      evidenceCount: evidenceFiles.length
    };
    
    // Save detailed report to separate localStorage item
    saveDetailedReportToLocalStorage(detailedReport);
    
    // Update token balance in localStorage by subtracting stake amount
    updateLocalTokenBalance(-reportData.stakeAmount);
    
    return { success: true, reportId: formattedReport.id };
  } catch (error) {
    // Error handling as before
    console.error('Error submitting report:', error);
    
    // Generate mock ID and create fallback reports
    const mockId = "0x" + Math.floor(Date.now() / 1000).toString(16);
    
    // Process evidence files with Base64
    const evidenceFiles = await Promise.all(
      reportData.evidenceFiles.map(async (file) => {
        const base64Data = await convertFileToBase64(file);
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          base64Data: base64Data, // Store as Base64 instead of URL
          lastModified: file.lastModified
        };
      })
    );
    
    // Basic report for dashboard
    const formattedReport = {
      id: mockId,
      title: reportData.title,
      category: reportData.category,
      date: reportData.date || new Date().toISOString().split('T')[0],
      time: reportData.time || "",
      status: 'pending',
      stake: reportData.stakeAmount,
      reward: 0,
      hasMessages: false
    };
    
    // Save basic report
    saveReportToLocalStorage(formattedReport);
    
    // Save detailed version with evidence files
    const detailedReport = {
      id: mockId,
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      location: reportData.location,
      date: reportData.date || new Date().toISOString().split('T')[0],
      time: reportData.time || "",
      status: 'pending',
      stake: reportData.stakeAmount,
      reward: 0,
      hasMessages: false,
      evidenceFiles: evidenceFiles,
      evidenceCount: evidenceFiles.length
    };
    
    // Save detailed report
    saveDetailedReportToLocalStorage(detailedReport);
    
    // Update token balance in localStorage by subtracting stake amount
    updateLocalTokenBalance(-reportData.stakeAmount);
    
    return { success: true, reportId: mockId };
  }
}

// FIXED helper function to save to localStorage - Improved deduplication
function saveReportToLocalStorage(report) {
  try {
    // Make sure we have a consistent ID format
    const reportId = String(report.id);
    
    // Get existing reports
    const existingReports = JSON.parse(localStorage.getItem('whispr_reports') || '[]');
    
    // Check if the report already exists (by ID)
    const existingIndex = existingReports.findIndex(r => r.id && String(r.id) === reportId);
    
    // If it exists, update it, otherwise add as new
    if (existingIndex >= 0) {
      existingReports[existingIndex] = { ...existingReports[existingIndex], ...report };
    } else {
      existingReports.unshift(report); // Add to beginning
    }
    
    // Save back to localStorage
    localStorage.setItem('whispr_reports', JSON.stringify(existingReports));
    console.log("Report saved to localStorage:", report);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Function to save detailed reports with evidence files
function saveDetailedReportToLocalStorage(report) {
  try {
    // Make sure we have a consistent ID format
    const reportId = String(report.id);
    
    // Get existing detailed reports
    const existingReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
    
    // Check if the report already exists
    const existingIndex = existingReports.findIndex(r => r.id && String(r.id) === reportId);
    
    if (existingIndex >= 0) {
      existingReports[existingIndex] = { ...existingReports[existingIndex], ...report };
    } else {
      existingReports.unshift(report);
    }
    
    // Save back to localStorage
    localStorage.setItem('whispr_reports_details', JSON.stringify(existingReports));
    console.log("Detailed report saved to localStorage:", report);
  } catch (error) {
    console.error('Error saving detailed report to localStorage:', error);
  }
}

// FIXED Get user reports with improved deduplication
export async function getUserReports() {
  try {
    // Try to get reports from backend
    const backendReports = await whisprBackend.get_my_reports();
    console.log("Retrieved reports from backend:", backendReports);
    
    // Format backend reports for frontend use
    const formattedBackendReports = Array.isArray(backendReports) ? backendReports.map(report => ({
      id: String(report.id),
      title: report.title || "",
      category: report.category || "other",
      date: report.date || new Date().toISOString().split('T')[0],
      time: report.time || "",
      status: report.status || "pending",
      stake: Number(report.stake || 0),
      reward: Number(report.reward || 0),
      hasMessages: Boolean(report.has_messages || false)
    })) : [];
    
    // Get local reports
    const localReports = JSON.parse(localStorage.getItem('whispr_reports') || '[]')
      .map(report => ({
        ...report,
        id: report.id ? String(report.id) : "unknown"
      }));
    
    // Use a Map for deduplication
    const reportMap = new Map();
    
    // Add backend reports first (they take precedence)
    formattedBackendReports.forEach(report => {
      if (report.id) reportMap.set(String(report.id), report);
    });
    
    // Add local reports only if not already in map
    localReports.forEach(report => {
      if (report.id && !reportMap.has(String(report.id))) {
        reportMap.set(String(report.id), report);
      }
    });
    
    // Convert back to array
    const combinedReports = Array.from(reportMap.values());
    console.log("Final combined and deduplicated reports:", combinedReports);
    
    return combinedReports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    
    // Fallback to localStorage
    const localReports = JSON.parse(localStorage.getItem('whispr_reports') || '[]');
    
    // Deduplicate local reports by ID
    const reportMap = new Map();
    localReports.forEach(report => {
      if (report.id) reportMap.set(String(report.id), report);
    });
    
    const dedupedReports = Array.from(reportMap.values());
    console.log("Using deduplicated local reports as fallback:", dedupedReports);
    return dedupedReports;
  }
}

// Get detailed report by ID - combines basic and detailed data with proper date/time formatting
export async function getReportById(reportId) {
  try {
    // First try to get from backend
    const reports = await getUserReports();
    
    // Find the specific report by ID
    const report = reports.find(r => String(r.id) === String(reportId));
    
    if (!report) {
      throw new Error("Report not found");
    }
    
    // Get additional details from localStorage if available
    const localReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
    const detailedReport = localReports.find(r => String(r.id) === String(reportId));
    
    // Merge the basic report with detailed data if available
    const fullReport = {
      ...report,
      ...(detailedReport || {}),
    };
    
    // Ensure date and time are properly formatted
    if (fullReport.date && typeof fullReport.date === 'number') {
      try {
        fullReport.date = new Date(Number(fullReport.date) / 1000000).toISOString().split('T')[0];
      } catch (err) {
        console.warn("Error formatting date, using as-is:", err);
      }
    }
    
    if (fullReport.time && typeof fullReport.time === 'number') {
      try {
        const timeDate = new Date(Number(fullReport.time) / 1000000);
        fullReport.time = `${timeDate.getHours().toString().padStart(2, '0')}:${timeDate.getMinutes().toString().padStart(2, '0')}`;
      } catch (err) {
        console.warn("Error formatting time, using as-is:", err);
      }
    }
    
    return fullReport;
  } catch (error) {
    console.error('Error fetching report by ID:', error);
    
    // Try to get from localStorage as fallback
    const localReports = JSON.parse(localStorage.getItem('whispr_reports') || '[]');
    const localReport = localReports.find(r => String(r.id) === String(reportId));
    
    // Get additional details from localStorage if available
    const localDetailsReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
    const detailedReport = localDetailsReports.find(r => String(r.id) === String(reportId));
    
    if (!localReport && !detailedReport) {
      throw new Error("Report not found in localStorage");
    }
    
    // Merge the basic report with detailed data if available
    const fullReport = {
      ...(localReport || {}),
      ...(detailedReport || {}),
    };
    
    return fullReport;
  }
}

// FIXED: Get token balance with improved error handling and localStorage support
export async function getTokenBalance() {
  try {
    const balance = await whisprBackend.get_token_balance();
    const numericBalance = Number(balance);
    
    // Save to localStorage for offline use
    localStorage.setItem('user_token_balance', numericBalance);
    
    return numericBalance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    
    // Fallback to localStorage if available
    const localBalance = localStorage.getItem('user_token_balance');
    if (localBalance !== null) {
      return parseInt(localBalance, 10);
    }
    
    // Default fallback value
    return 250;
  }
}

// Authority-specific API functions
export async function getAuthorityStatistics() {
  try {
    const result = await whisprBackend.get_authority_statistics();
    if (result && 'Ok' in result) {
      return result.Ok;
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    } else {
      throw new Error("Invalid response format from get_authority_statistics");
    }
  } catch (error) {
    console.error('Error fetching authority statistics:', error);
    // Return mock data as fallback
    return {
      reports_pending: 5,
      reports_verified: 156,
      reports_rejected: 42,
      total_rewards_distributed: 4350
    };
  }
}

// FIXED: Added localStorage fallback for getReportsByStatus
export async function getReportsByStatus(status) {
  try {
    const result = await whisprBackend.get_reports_by_status({ [status]: null });
    if (result && 'Ok' in result) {
      const formattedBackendReports = result.Ok.map(formatReport);
      console.log(`Retrieved ${status} reports from backend:`, formattedBackendReports);
      
      // Also get localStorage reports that match the status
      const localReports = JSON.parse(localStorage.getItem('whispr_reports') || '[]')
        .filter(report => status === 'all' || report.status === status);
      
      // Get detail reports for evidence files
      const detailedReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
      
      // Combine reports with deduplication
      const reportMap = new Map();
      
      // Add backend reports first (they take precedence)
      formattedBackendReports.forEach(report => {
        if (report.id) reportMap.set(String(report.id), report);
      });
      
      // Add local reports only if not already in map
      localReports.forEach(report => {
        if (report.id && !reportMap.has(String(report.id))) {
          // Try to get evidence count from detailed reports
          const detailedReport = detailedReports.find(r => r.id === report.id);
          const evidenceCount = detailedReport?.evidenceCount || 0;
          
          reportMap.set(String(report.id), {
            ...report,
            evidenceCount: evidenceCount,
            stakeAmount: Number(report.stake || 0),
            rewardAmount: Number(report.reward || 0)
          });
        }
      });
      
      // Convert back to array
      const combinedReports = Array.from(reportMap.values());
      console.log(`Final combined and deduplicated ${status} reports:`, combinedReports);
      return combinedReports;
      
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    } else {
      throw new Error("Invalid response format from get_reports_by_status");
    }
  } catch (error) {
    console.error(`Error fetching ${status} reports:`, error);
    
    // Fallback to localStorage filtered by status
    const localReports = JSON.parse(localStorage.getItem('whispr_reports') || '[]')
      .filter(report => status === 'all' || report.status === status);
    
    // Get detail reports for evidence files
    const detailedReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
    
    // Combine with detailed report data where available
    const enhancedReports = localReports.map(report => {
      const detailedReport = detailedReports.find(r => r.id === report.id);
      return {
        ...report,
        evidenceCount: detailedReport?.evidenceCount || detailedReport?.evidenceFiles?.length || 0,
        description: detailedReport?.description || "",
        location: detailedReport?.location || { address: "", coordinates: null },
        stakeAmount: Number(report.stake || 0),
        rewardAmount: Number(report.reward || 0),
        reviewNotes: detailedReport?.reviewNotes || "",
        reviewDate: detailedReport?.reviewDate || null
      };
    });
    
    console.log(`Falling back to local ${status} reports:`, enhancedReports);
    return enhancedReports;
  }
}

// FIXED: Verify report function with direct token updates
export async function verifyReport(reportId, notes) {
  try {
    console.log(`Verifying report ${reportId} with notes:`, notes);
    
    // Get stake amount before verification to calculate rewards
    let stakeAmount = 0;
    try {
      const report = await getReportById(reportId);
      stakeAmount = Number(report.stake || report.stakeAmount || 0);
      console.log(`Found stake amount for report ${reportId}:`, stakeAmount);
    } catch (e) {
      console.warn("Could not get stake amount before verification:", e);
    }
    
    // Ensure reportId is properly formatted for the backend
    let formattedId;
    try {
      formattedId = BigInt(reportId);
    } catch (e) {
      formattedId = reportId;
    }
    
    // Parse multiplier from notes if available
    let multiplier = 10; // Default multiplier
    if (notes) {
      const multiplierMatch = notes.match(/multiplier:\s*(\d+)x/i);
      if (multiplierMatch && multiplierMatch[1]) {
        multiplier = parseInt(multiplierMatch[1], 10);
      }
    }
    
    // Calculate reward
    const rewardAmount = stakeAmount * multiplier;
    console.log(`Calculated reward: ${stakeAmount} × ${multiplier} = ${rewardAmount}`);
    
    // Update local storage FIRST to ensure UI updates even if backend call fails
    updateLocalReportStatus(reportId, 'verified', notes, stakeAmount, rewardAmount);
    
    // Call backend after local update
    const result = await whisprBackend.verify_report(formattedId, notes ? [notes] : []);
    
    if (result && 'Ok' in result) {
      console.log(`Successfully verified report ${reportId} with backend`);
      return { success: true };
    } else if (result && 'Err' in result) {
      console.error(`Backend returned error for verify_report:`, result.Err);
      throw new Error(result.Err);
    } else {
      console.error(`Invalid response format from verify_report:`, result);
      throw new Error("Invalid response format from verify_report");
    }
  } catch (error) {
    console.error('Error verifying report:', error);
    // Keep the local updates even if backend call fails
    return { success: true, warning: error.message };
  }
}

// FIXED: Reject report function
export async function rejectReport(reportId, notes) {
  try {
    console.log(`Rejecting report ${reportId} with notes:`, notes);
    
    // Update local storage FIRST to ensure UI updates even if backend call fails
    updateLocalReportStatus(reportId, 'rejected', notes, 0, 0);
    
    // Ensure reportId is properly formatted for the backend
    let formattedId;
    try {
      formattedId = BigInt(reportId);
    } catch (e) {
      formattedId = reportId;
    }
    
    // Call backend after local update
    const result = await whisprBackend.reject_report(formattedId, notes ? [notes] : []);
    
    if (result && 'Ok' in result) {
      console.log(`Successfully rejected report ${reportId} with backend`);
      return { success: true };
    } else if (result && 'Err' in result) {
      console.error(`Backend returned error for reject_report:`, result.Err);
      throw new Error(result.Err);
    } else {
      console.error(`Invalid response format from reject_report:`, result);
      throw new Error("Invalid response format from reject_report");
    }
  } catch (error) {
    console.error('Error rejecting report:', error);
    // Keep the local updates even if backend call fails
    return { success: true, warning: error.message };
  }
}

// FIXED: Helper function to update local report status AND token balance
function updateLocalReportStatus(reportId, newStatus, notes, stakeAmount = 0, rewardAmount = 0) {
  try {
    // Debug to trace execution path
    console.log(`Updating local report ${reportId} to status ${newStatus}, stake: ${stakeAmount}, reward: ${rewardAmount}`);
    
    // Standardize reportId format
    const reportIdStr = String(reportId);
    
    // Update basic reports
    const reports = JSON.parse(localStorage.getItem('whispr_reports') || '[]');
    const reportIndex = reports.findIndex(r => r.id && String(r.id) === reportIdStr);
    
    if (reportIndex !== -1) {
      // If stakeAmount is not provided, get it from the report
      if (!stakeAmount) {
        stakeAmount = Number(reports[reportIndex].stake || 0);
      }
      
      // Store original status for determining token changes
      const originalStatus = reports[reportIndex].status;
      
      // Update status
      reports[reportIndex].status = newStatus;
      
      // Handle token changes based on status
      if (newStatus === 'verified') {
        // If rewardAmount is not provided, calculate it (10x stake by default)
        if (!rewardAmount) {
          rewardAmount = stakeAmount * 10;
        }
        
        reports[reportIndex].reward = rewardAmount;
        
        // Update user's token balance in localStorage
        // Return stake + add reward
        updateLocalTokenBalance(stakeAmount + rewardAmount);
        
        console.log(`Report verified: Adding ${stakeAmount} (stake) + ${rewardAmount} (reward) tokens`);
      }
      
      localStorage.setItem('whispr_reports', JSON.stringify(reports));
    } else {
      console.warn(`Report ${reportId} not found in basic reports array`);
    }
    
    // Update detailed reports
    const detailedReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
    const detailedIndex = detailedReports.findIndex(r => r.id && String(r.id) === reportIdStr);
    
    if (detailedIndex !== -1) {
      // If stakeAmount is not provided, get it from the detailed report
      if (!stakeAmount) {
        stakeAmount = Number(detailedReports[detailedIndex].stake || 0);
      }
      
      detailedReports[detailedIndex].status = newStatus;
      detailedReports[detailedIndex].reviewNotes = notes || '';
      detailedReports[detailedIndex].reviewDate = new Date().toISOString();
      
      // If verified, calculate and add reward
      if (newStatus === 'verified') {
        // If rewardAmount is not provided, calculate it (10x stake by default)
        if (!rewardAmount) {
          rewardAmount = stakeAmount * 10;
        }
        
        detailedReports[detailedIndex].reward = rewardAmount;
      }
      
      localStorage.setItem('whispr_reports_details', JSON.stringify(detailedReports));
    } else {
      console.warn(`Report ${reportId} not found in detailed reports array`);
    }
    
    console.log(`Updated report ${reportId} status to ${newStatus}`);
  } catch (error) {
    console.error('Error updating local report status:', error);
  }
}

// Helper function to update user's token balance in localStorage
function updateLocalTokenBalance(changeAmount) {
  try {
    // Get current balance
    const currentBalance = localStorage.getItem('user_token_balance');
    const parsedBalance = currentBalance ? parseInt(currentBalance, 10) : 250; // Default if not set
    
    // Update balance
    const newBalance = parsedBalance + changeAmount;
    localStorage.setItem('user_token_balance', newBalance);
    
    console.log(`Token balance updated locally: ${parsedBalance} → ${newBalance} (change: ${changeAmount > 0 ? '+' : ''}${changeAmount})`);
    
    // Dispatch an event so other components can update
    window.dispatchEvent(new CustomEvent('tokenBalanceUpdated', { 
      detail: { newBalance, changeAmount } 
    }));
    
    return newBalance;
  } catch (error) {
    console.error('Error updating local token balance:', error);
    return null;
  }
}

// FIXED: Added localStorage fallback for getAllReports
export async function getAllReports() {
  try {
    const result = await whisprBackend.get_all_reports();
    if (result && 'Ok' in result) {
      const formattedBackendReports = result.Ok.map(formatReport);
      console.log("Retrieved all reports from backend:", formattedBackendReports);
      
      // Also get localStorage reports for completeness
      const localReports = JSON.parse(localStorage.getItem('whispr_reports') || '[]');
      
      // Get detail reports for evidence files
      const detailedReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
      
      // Combine reports with deduplication (backend reports take precedence)
      const reportMap = new Map();
      
      // Add backend reports first
      formattedBackendReports.forEach(report => {
        if (report.id) reportMap.set(String(report.id), report);
      });
      
      // Add local reports only if not already in map
      localReports.forEach(report => {
        if (report.id && !reportMap.has(String(report.id))) {
          // Try to get evidence count and description from detailed reports
          const detailedReport = detailedReports.find(r => r.id === report.id);
          const evidenceCount = detailedReport?.evidenceCount || 0;
          const evidenceFiles = detailedReport?.evidenceFiles || [];
          
          reportMap.set(String(report.id), {
            ...report,
            evidenceCount: evidenceCount,
            evidenceFiles: evidenceFiles,
            description: detailedReport?.description || "",
            location: detailedReport?.location || { address: "", coordinates: null },
            stakeAmount: Number(report.stake || 0),
            rewardAmount: Number(report.reward || 0),
            reviewNotes: detailedReport?.reviewNotes || "",
            reviewDate: detailedReport?.reviewDate || null
          });
        }
      });
      
      // Convert back to array
      const combinedReports = Array.from(reportMap.values());
      console.log("Final combined and deduplicated all reports:", combinedReports);
      return combinedReports;
      
    } else if (result && 'Err' in result) {
      throw new Error(result.Err);
    } else {
      throw new Error("Invalid response format from get_all_reports");
    }
  } catch (error) {
    console.error('Error fetching all reports:', error);
    
    // Fallback to localStorage
    const localReports = JSON.parse(localStorage.getItem('whispr_reports') || '[]');
    
    // Get detail reports for evidence files
    const detailedReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
    
    // Combine with detailed report data where available
    const enhancedReports = localReports.map(report => {
      const detailedReport = detailedReports.find(r => r.id === report.id);
      return {
        ...report,
        evidenceCount: detailedReport?.evidenceCount || detailedReport?.evidenceFiles?.length || 0,
        evidenceFiles: detailedReport?.evidenceFiles || [],
        description: detailedReport?.description || "",
        location: detailedReport?.location || { address: "", coordinates: null },
        stakeAmount: Number(report.stake || 0),
        rewardAmount: Number(report.reward || 0),
        reviewNotes: detailedReport?.reviewNotes || "",
        reviewDate: detailedReport?.reviewDate || null
      };
    });
    
    console.log("Falling back to local reports for getAllReports:", enhancedReports);
    return enhancedReports;
  }
}

// Helper function to format reports from backend with corrected date and time handling
function formatReport(report) {
  try {
    // Safely convert date values
    let dateSubmitted, formattedDate, incidentDate, incidentTime, reviewDate;
    
    // Handle date_submitted - convert nanosecond timestamps to readable format
    try {
      if (report.date_submitted) {
        dateSubmitted = new Date(Number(report.date_submitted) / 1000000);
        formattedDate = dateSubmitted.toISOString().split('T')[0];
      } else {
        formattedDate = new Date().toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn("Error formatting date_submitted:", e);
      formattedDate = new Date().toISOString().split('T')[0];
    }
    
    // Get incident date from array if it exists
    try {
      incidentDate = '';
      if (report.incident_date && Array.isArray(report.incident_date) && report.incident_date.length > 0) {
        incidentDate = report.incident_date[0];
      }
    } catch (e) {
      console.warn("Error extracting incident_date:", e);
    }
    
    // Get time from array if it exists
    try {
      incidentTime = '';
      if (report.incident_time && Array.isArray(report.incident_time) && report.incident_time.length > 0) {
        incidentTime = report.incident_time[0];
      }
    } catch (e) {
      console.warn("Error extracting incident_time:", e);
    }
    
    // Reviews dates if available
    try {
      reviewDate = null;
      if (report.review_date) {
        reviewDate = new Date(Number(report.review_date) / 1000000).toISOString();
      }
    } catch (e) {
      console.warn("Error formatting review_date:", e);
    }
    
    // Handle submitter_id correctly
    let submitterId;
    try {
      if (typeof report.submitter_id === 'object' && report.submitter_id !== null) {
        if ('toText' in report.submitter_id && typeof report.submitter_id.toText === 'function') {
          submitterId = report.submitter_id.toText();
        } else {
          submitterId = JSON.stringify(report.submitter_id);
        }
      } else if (report.submitter_id) {
        submitterId = String(report.submitter_id);
      } else {
        submitterId = "unknown";
      }
    } catch (e) {
      console.warn("Error extracting submitter_id:", e);
      submitterId = "unknown";
    }
    
    // Extract review notes safely
    let reviewNotes = '';
    try {
      if (Array.isArray(report.review_notes) && report.review_notes.length > 0) {
        reviewNotes = report.review_notes[0];
      } else if (report.review_notes) {
        reviewNotes = String(report.review_notes);
      }
    } catch (e) {
      console.warn("Error extracting review notes:", e);
    }
    
    // Get report status
    const status = getStatusString(report.status);
    
    // Check if we have detailed data in localStorage (like evidence files)
    const detailedReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
    const detailedReport = detailedReports.find(r => r.id === String(report.id));
    const evidenceFiles = detailedReport?.evidenceFiles || [];
    
    return {
      id: String(report.id),
      title: report.title || "",
      description: report.description || "",
      category: report.category || "",
      date: incidentDate || formattedDate,
      time: incidentTime || "",
      dateSubmitted: formattedDate, // Keep the submission date separate
      submitterId: submitterId,
      status: status,
      evidenceCount: Number(report.evidence_count || 0),
      stakeAmount: Number(report.stake_amount || 0),
      rewardAmount: Number(report.reward_amount || 0),
      reviewNotes: reviewNotes,
      reviewDate: reviewDate,
      reviewer: report.reviewer,
      location: report.location || { address: "", coordinates: null },
      evidenceFiles: evidenceFiles, // Add evidence files from localStorage if available
      hasMessages: false // Default value
    };
  } catch (error) {
    console.error("Error formatting report:", error, report);
    // Return a minimal valid report object to avoid breaking the UI
    return {
      id: String(report.id || "unknown-" + Date.now()),
      title: report.title || "Error Loading Report",
      description: "Error loading report details",
      category: "unknown",
      date: new Date().toISOString().split('T')[0],
      status: "pending",
      stakeAmount: 0,
      rewardAmount: 0,
      evidenceCount: 0,
      evidenceFiles: [],
      hasMessages: false
    };
  }
}

function getStatusString(status) {
  if (!status) return 'pending';
  
  try {
    if (typeof status === 'string') return status.toLowerCase();
    
    if (typeof status === 'object') {
      if ('Pending' in status) return 'pending';
      if ('UnderReview' in status) return 'under_review';
      if ('Approved' in status) return 'verified';
      if ('Rejected' in status) return 'rejected';
    }
  } catch (e) {
    console.warn("Error determining status:", e);
  }
  
  return 'pending';
}

// Function to migrate existing reports with URL-based images to indicate they need recovery
export function migrateLocalStorage() {
  try {
    // Get all detailed reports
    const detailedReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
    let hasChanges = false;
    
    // Check each report that might have URL-based images
    detailedReports.forEach(report => {
      if (report.evidenceFiles) {
        report.evidenceFiles.forEach(file => {
          // If this is an old-style file with only URL and no base64Data
          if (file.url && !file.base64Data) {
            console.log("Converting URL-based file to placeholder:", file.name);
            // Add a placeholder for backward compatibility
            file.base64Data = null;
            file.recoveryNeeded = true;
            hasChanges = true;
          }
        });
      }
      
      // Ensure evidenceCount is set
      if (!report.evidenceCount && report.evidenceFiles) {
        report.evidenceCount = report.evidenceFiles.length;
        hasChanges = true;
      }
    });
    
    // Save back if changes were made
    if (hasChanges) {
      localStorage.setItem('whispr_reports_details', JSON.stringify(detailedReports));
      console.log("Updated reports with recovery flags and evidence counts");
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run migration when this module loads
migrateLocalStorage();

export default whisprBackend;