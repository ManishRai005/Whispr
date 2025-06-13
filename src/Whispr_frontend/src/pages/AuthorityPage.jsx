import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Filter, ChevronDown, ArrowUpDown, 
  CheckCircle, XCircle, Eye, MessageSquare,
  Lock, Shield, AlertCircle, Clock, Plus, Minus,
  Activity, Award, AlertTriangle, Wallet
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  getAuthorityStatistics, 
  getReportsByStatus, 
  verifyReport, 
  rejectReport, 
  getAllReports,
  getTokenBalance
} from '../api/whisprBackend';

const AuthorityPage = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    reports_pending: 0,
    reports_verified: 0,
    reports_rejected: 0,
    total_rewards_distributed: 0
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rewardMultiplier, setRewardMultiplier] = useState(10);
  const [userTokenBalance, setUserTokenBalance] = useState(0);
  
  // For scroll position memory
  const listContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Fetch reports and stats when component mounts or status filter changes
  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Separate function for data fetching to make it easier to reuse
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Fetching complete report data with status: ${statusFilter}`);
      
      // First, fetch all detailed reports to ensure we have complete data
      const detailedReports = JSON.parse(localStorage.getItem('whispr_reports_details') || '[]');
      
      const [statsData, reportsData, tokenBalance] = await Promise.all([
        getAuthorityStatistics(),
        statusFilter === 'all' ? getAllReports() : getReportsByStatus(statusFilter),
        getTokenBalance()
      ]);
      
      console.log("Authority statistics:", statsData);
      console.log("Fetched reports:", reportsData);
      
      // Enhance reports with any additional details from localStorage
      const enhancedReports = reportsData.map(report => {
        const detailedReport = detailedReports.find(r => String(r.id) === String(report.id));
        if (detailedReport) {
          return {
            ...report,
            description: detailedReport.description || report.description || "",
            evidenceFiles: detailedReport.evidenceFiles || report.evidenceFiles || [],
            evidenceCount: detailedReport.evidenceCount || report.evidenceCount || 0
          };
        }
        return report;
      });
      
      console.log("Enhanced reports with complete details:", enhancedReports);
      
      setStats(statsData);
      setReports(enhancedReports);
      setUserTokenBalance(tokenBalance);
    } catch (err) {
      console.error("Failed to fetch authority data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Store scroll position when selecting a report
  const handleSelectReport = (id) => {
    setScrollPosition(window.scrollY);
    setSelectedReport(id);
    // Scroll to top for report details (important for mobile)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restore scroll position when going back to list
  const handleBackToList = () => {
    setSelectedReport(null);
    
    // Use setTimeout to ensure state has updated before scrolling
    setTimeout(() => {
      // Using the stored scroll position
      window.scrollTo({ top: scrollPosition, behavior: 'auto' });
    }, 100);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    
    return reports.filter(report => {
      // Safety check for null fields
      const reportTitle = report.title?.toLowerCase() || '';
      const reportId = report.id?.toLowerCase() || '';
      const reportCategory = report.category?.toLowerCase() || '';
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = reportTitle.includes(searchLower) || reportId.includes(searchLower);
      const matchesCategory = categoryFilter === 'all' || reportCategory === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [reports, searchQuery, categoryFilter]);

  const sortedReports = useMemo(() => {
    if (!filteredReports) return [];
    
    // Create a copy to avoid mutating the original array
    return [...filteredReports].sort((a, b) => {
      let comparison = 0;
      
      // Handle potential invalid date formats
      const getValidDate = (dateStr) => {
        try {
          if (!dateStr) return new Date(0);
          return new Date(dateStr);
        } catch (e) {
          console.warn(`Invalid date: ${dateStr}`, e);
          return new Date(0);
        }
      };
      
      if (sortBy === 'date') {
        comparison = getValidDate(a.date).getTime() - getValidDate(b.date).getTime();
      } else if (sortBy === 'stake') {
        comparison = (a.stakeAmount || 0) - (b.stakeAmount || 0);
      } else if (sortBy === 'evidence') {
        comparison = (a.evidenceCount || 0) - (b.evidenceCount || 0);
      } else if (sortBy === 'title') {
        comparison = (a.title || '').localeCompare(b.title || '');
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredReports, sortBy, sortDirection]);

  const getCategoryBadgeColor = (category) => {
    if (!category) return 'bg-gray-800 text-gray-400';
    
    const categoryLower = category.toLowerCase();
    switch (categoryLower) {
      case 'environmental':
      case 'environment':
        return 'bg-emerald-900 bg-opacity-40 text-emerald-400';
      case 'fraud':
        return 'bg-amber-900 bg-opacity-40 text-amber-400';
      case 'cybercrime':
        return 'bg-blue-900 bg-opacity-40 text-blue-400';
      case 'corruption':
        return 'bg-purple-900 bg-opacity-40 text-purple-400';
      case 'violence':
      case 'domestic_violence':
        return 'bg-red-900 bg-opacity-40 text-red-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };
  
  // FIXED: handleReportAction now updates local data immediately
  const handleReportAction = async (id, action) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log(`Processing ${action} for report ID: ${id} with multiplier: ${rewardMultiplier}`);
      
      // Find the report to update
      const reportToUpdate = reports.find(r => r.id === id);
      if (!reportToUpdate) {
        throw new Error(`Report with ID ${id} not found`);
      }
      
      // Calculate reward for verification
      const stakeAmount = reportToUpdate?.stakeAmount || 0;
      const rewardAmount = action === 'verify' ? stakeAmount * rewardMultiplier : 0;
      
      // Update status in UI immediately for better user experience
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === id 
            ? { 
                ...report, 
                status: action === 'verify' ? 'verified' : 'rejected',
                rewardAmount: action === 'verify' ? rewardAmount : 0,
              }
            : report
        )
      );
      
      let result;
      if (action === 'verify') {
        // Add reward multiplier info to notes
        const notesWithReward = reviewNotes ? 
          `${reviewNotes}\n\nReward multiplier: ${rewardMultiplier}x` : 
          `Verified with ${rewardMultiplier}x reward multiplier`;
          
        result = await verifyReport(id, notesWithReward);
        if (result.success) {
          setSuccess(`Report ${id} has been successfully verified! Reward of ${rewardAmount} tokens issued.`);
          
          // Update statistics locally for immediate UI response
          setStats(prev => ({
            ...prev,
            reports_pending: Math.max(0, prev.reports_pending - 1),
            reports_verified: prev.reports_verified + 1,
            total_rewards_distributed: prev.total_rewards_distributed + rewardAmount
          }));
        }
      } else {
        result = await rejectReport(id, reviewNotes || "Report rejected");
        if (result.success) {
          setSuccess(`Report ${id} has been rejected. Stake has been forfeited.`);
          
          // Update statistics locally
          setStats(prev => ({
            ...prev,
            reports_pending: Math.max(0, prev.reports_pending - 1),
            reports_rejected: prev.reports_rejected + 1
          }));
        }
      }
      
      if (!result.success) {
        setError(result.error || "Failed to process report");
        // If failed, revert the optimistic UI update
        fetchData();
      } else {
        // Return to list view
        setSelectedReport(null);
        setReviewNotes('');
        
        // We already updated the UI, so we don't need the full fetch
        // But we'll refresh statistics and token balance
        const [statsData, tokenBalance] = await Promise.all([
          getAuthorityStatistics(),
          getTokenBalance()
        ]);
        
        setStats(statsData);
        setUserTokenBalance(tokenBalance);
        
        // Use setTimeout to ensure we scroll to top on mobile after successful action
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      setError(err.message || "An error occurred while processing the report");
      console.error("Error processing report:", err);
      
      // Refresh data to ensure consistency
      fetchData();
    } finally {
      setIsLoading(false);
    }
  };

  const selectedReportData = useMemo(() => {
    return selectedReport ? reports.find(report => report.id === selectedReport) : null;
  }, [selectedReport, reports]);

  const formattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // If invalid, return original
      return date.toLocaleDateString();
    } catch (e) {
      console.warn("Date format error:", e);
      return dateString;
    }
  };

  const renderReportsList = () => (
    <div className="w-full" ref={listContainerRef}>
      <Card>
        <Card.Header className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <Card.Title>Reports for Review</Card.Title>
            <Card.Description>
              Review and verify anonymous reports
            </Card.Description>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm"
              />
            </div>
            
            <div className="relative min-w-[130px]">
              <div className="flex items-center">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none pl-10 pr-8 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm"
                >
                  <option value="all">All Reports</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
              </div>
            </div>
            
            <div className="relative min-w-[130px]">
              <div className="flex items-center">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full appearance-none pl-10 pr-8 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="environmental">Environmental</option>
                  <option value="fraud">Fraud</option>
                  <option value="cybercrime">Cybercrime</option>
                  <option value="corruption">Corruption</option>
                  <option value="violence">Violence</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          {error && (
            <div className="bg-red-900/30 text-red-300 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/30 text-green-300 p-4 rounded-lg mb-4">
              {success}
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer"
                    onClick={() => toggleSort('title')}
                  >
                    <div className="flex items-center">
                      <span>Report</span>
                      {sortBy === 'title' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer"
                    onClick={() => toggleSort('date')}
                  >
                    <div className="flex items-center">
                      <span>Date</span>
                      {sortBy === 'date' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer"
                    onClick={() => toggleSort('evidence')}
                  >
                    <div className="flex items-center">
                      <span>Evidence</span>
                      {sortBy === 'evidence' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer"
                    onClick={() => toggleSort('stake')}
                  >
                    <div className="flex items-center">
                      <span>Stake</span>
                      {sortBy === 'stake' && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : sortedReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                      No reports found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  sortedReports.map(report => (
                    <tr 
                      key={report.id} 
                      className={`border-b border-gray-800 hover:bg-slate-800/50 cursor-pointer ${
                        selectedReport === report.id ? 'bg-slate-800' : ''
                      }`}
                      onClick={() => handleSelectReport(report.id)}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">{report.title}</p>
                          {report.description && (
                            <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                              {report.description.substring(0, 60)}{report.description.length > 60 ? '...' : ''}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 font-mono mt-1">{report.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryBadgeColor(report.category)}`}>
                          {report.category ? (report.category.charAt(0).toUpperCase() + report.category.slice(1)) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">{formattedDate(report.date)}</td>
                      <td className="px-4 py-4 text-sm">{report.evidenceCount || 0} files</td>
                      <td className="px-4 py-4 text-sm text-purple-400">{report.stakeAmount || 0} tokens</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {report.status === 'verified' ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          ) : report.status === 'rejected' ? (
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          ) : report.status === 'under_review' ? (
                            <AlertCircle className="h-4 w-4 text-blue-500 mr-1" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500 mr-1" />
                          )}
                          <span className="text-sm">
                            {report.status === 'verified' ? 'Verified' :
                             report.status === 'rejected' ? 'Rejected' :
                             report.status === 'under_review' ? 'Under Review' :
                             'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectReport(report.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderReportDetail = () => {
    if (!selectedReportData) return null;
    
    // Calculate potential reward
    const stakeAmount = selectedReportData.stakeAmount || 0;
    const potentialReward = stakeAmount * rewardMultiplier;
    
    // Try to get evidence files from selectedReportData
    const evidenceFiles = selectedReportData.evidenceFiles || [];
    
    return (
      <Card>
        <Card.Header className="flex justify-between items-start">
          <div>
            <Card.Title>{selectedReportData.title || "Untitled Report"}</Card.Title>
            <Card.Description className="font-mono">
              {selectedReportData.id || "No ID"}
            </Card.Description>
          </div>
          <button 
            onClick={handleBackToList}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <XCircle className="h-5 w-5 text-gray-400" />
          </button>
        </Card.Header>
        <Card.Content>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className={`px-3 py-1 text-sm rounded-full ${getCategoryBadgeColor(selectedReportData.category)}`}>
                {selectedReportData.category ? 
                  (selectedReportData.category.charAt(0).toUpperCase() + selectedReportData.category.slice(1)) : 
                  'Unknown'}
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-purple-900 bg-opacity-30 text-purple-400">
                Stake: {selectedReportData.stakeAmount || 0} tokens
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-blue-900 bg-opacity-30 text-blue-400">
                {formattedDate(selectedReportData.date)}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full ${
                selectedReportData.status === 'verified' ? 'bg-green-900 bg-opacity-30 text-green-400' :
                selectedReportData.status === 'rejected' ? 'bg-red-900 bg-opacity-30 text-red-400' :
                selectedReportData.status === 'under_review' ? 'bg-blue-900 bg-opacity-30 text-blue-400' :
                'bg-amber-900 bg-opacity-30 text-amber-400'
              }`}>
                {selectedReportData.status ? 
                  (selectedReportData.status.charAt(0).toUpperCase() + selectedReportData.status.slice(1)) : 
                  'Pending'}
              </span>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Report Description</h3>
              <p className="bg-slate-800 p-4 rounded-lg whitespace-pre-line">
                {selectedReportData.description || "No description provided"}
              </p>
            </div>
            
            {selectedReportData.location && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Location</h3>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <p>{selectedReportData.location.address || 'Address not provided'}</p>
                  {selectedReportData.location.coordinates && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {selectedReportData.location.coordinates.lat?.toFixed(6)}, 
                      {selectedReportData.location.coordinates.lng?.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Evidence Files ({selectedReportData.evidenceCount || 0})
              </h3>
              
              {selectedReportData.evidenceCount > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Try to display evidence files if available */}
                  {evidenceFiles.length > 0 ? (
                    evidenceFiles.map((file, index) => (
                      <div key={index} className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
                        {file.base64Data ? (
                          <img 
                            src={file.base64Data} 
                            alt={file.name || `Evidence-${index+1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                            <Lock className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 px-2">
                          <p className="text-xs text-gray-300 truncate">{file.name || `Evidence-${index+1}`}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback for when we know there are files but don't have the data
                    [...Array(selectedReportData.evidenceCount)].map((_, i) => (
                      <div key={i} className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                          <Lock className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 px-2">
                          <p className="text-xs text-gray-300 truncate">Evidence-{i+1}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-gray-400 bg-slate-800 p-4 rounded-lg">No evidence files attached</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Informer</h3>
              <div className="flex items-center bg-slate-800 p-4 rounded-lg">
                <div className="mr-4 p-2 bg-slate-700 rounded-full">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">Anonymous Informer</p>
                  <p className="text-sm text-gray-400 font-mono">
                    ID: {selectedReportData.submitterId ? 
                         (selectedReportData.submitterId.length > 10 ? 
                          `${selectedReportData.submitterId.substring(0, 8)}...${selectedReportData.submitterId.substring(selectedReportData.submitterId.length - 4)}` : 
                          selectedReportData.submitterId) : 
                         'Unknown'}
                  </p>
                </div>
              </div>
            </div>
            
            {(selectedReportData.status === 'pending' || selectedReportData.status === 'under_review') && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Review Notes (Optional)</h3>
                  <textarea 
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder="Add notes about this report..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Reward Multiplier</h3>
                  <div className="flex items-center space-x-2 bg-slate-800 p-4 rounded-lg">
                    <button 
                      onClick={() => setRewardMultiplier(Math.max(1, rewardMultiplier - 1))}
                      className="p-1 bg-slate-700 rounded hover:bg-slate-600 text-gray-300"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    
                    <input
                      type="number"
                      value={rewardMultiplier}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setRewardMultiplier(isNaN(value) ? 1 : Math.max(1, value));
                      }}
                      className="w-16 bg-slate-700 border border-slate-600 rounded text-center px-2 py-1 text-white"
                      min="1"
                    />
                    
                    <button 
                      onClick={() => setRewardMultiplier(rewardMultiplier + 1)}
                      className="p-1 bg-slate-700 rounded hover:bg-slate-600 text-gray-300"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    
                    <span className="ml-2 text-gray-400">
                      × Stake ({selectedReportData.stakeAmount || 0}) 
                      = <span className="text-green-400">{potentialReward} tokens</span> reward
                    </span>
                  </div>
                </div>
              </>
            )}
            
            {(selectedReportData.status === 'verified' || selectedReportData.status === 'rejected') && selectedReportData.reviewNotes && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Review Notes</h3>
                <div className="bg-slate-800 p-4 rounded-lg whitespace-pre-line">
                  <p>{selectedReportData.reviewNotes}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
              <Button variant="secondary" onClick={handleBackToList}>
                Back to List
              </Button>
              
              {(selectedReportData.status === 'pending' || selectedReportData.status === 'under_review') && (
                <div className="flex space-x-3">
                  <Button 
                    variant="danger" 
                    onClick={() => handleReportAction(selectedReportData.id, 'reject')}
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => handleReportAction(selectedReportData.id, 'verify')}
                    disabled={isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify ({potentialReward} tokens)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Authority Dashboard</h1>
        <p className="text-gray-400">
          Review and verify anonymous reports from informers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
  <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30">
    <div className="flex items-center">
      <div className="p-3 bg-blue-900 bg-opacity-50 rounded-lg mr-4">
        <Clock className="h-6 w-6 text-blue-400" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">Pending Review</p>
        <p className="text-2xl font-bold">{stats.reports_pending}</p>
      </div>
    </div>
  </Card>
  
  <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30">
    <div className="flex items-center">
      <div className="p-3 bg-green-900 bg-opacity-50 rounded-lg mr-4">
        <CheckCircle className="h-6 w-6 text-green-400" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">Verified Reports</p>
        <p className="text-2xl font-bold">{stats.reports_verified}</p>
      </div>
    </div>
  </Card>
  
  <Card className="bg-gradient-to-br from-red-900/30 to-rose-900/30">
    <div className="flex items-center">
      <div className="p-3 bg-red-900 bg-opacity-50 rounded-lg mr-4">
        <XCircle className="h-6 w-6 text-red-400" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">Rejected Reports</p>
        <p className="text-2xl font-bold">{stats.reports_rejected}</p>
      </div>
    </div>
  </Card>
  
  <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30">
    <div className="flex items-center">
      <div className="p-3 bg-amber-900 bg-opacity-50 rounded-lg mr-4">
        <Award className="h-6 w-6 text-amber-400" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">Rewards Distributed</p>
        <p className="text-2xl font-bold">{stats.total_rewards_distributed}</p>
      </div>
    </div>
  </Card>
</div>

      <div className="space-y-6">
        {selectedReport ? renderReportDetail() : renderReportsList()}
      </div>
    </div>
  );
};

export default AuthorityPage;