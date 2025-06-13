import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, AlertCircle, Clock, MessageSquare, 
  Search, Filter, ChevronDown, Eye
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
// Update this line:
import { getUserReports, getTokenBalance } from '../api/whisprBackend';
// Keep mockReports as fallback data
const mockReports = [
    {
        id: '0x7f9b4d8a1e2c3b4d',
        title: 'Environmental Dumping Near River',
        category: 'environmental',
        date: '2025-04-21',
        status: 'verified',
        stake: 15,
        reward: 150,
        hasMessages: true
      },
      {
        id: '0x3a4b5c6d7e8f9a0b',
        title: 'Suspicious Financial Activity',
        category: 'fraud',
        date: '2025-04-22',
        status: 'pending',
        stake: 20,
        reward: 0,
        hasMessages: false
      },
      {
        id: '0x1e2f3a4b5c6d7e8f',
        title: 'Cyber Attack Attempt',
        category: 'cybercrime',
        date: '2025-04-23',
        status: 'verified',
        stake: 10,
        reward: 100,
        hasMessages: true
      },
      {
        id: '0x9a0b1c2d3e4f5a6b',
        title: 'Counterfeit Products Distribution',
        category: 'fraud',
        date: '2025-03-24',
        status: 'rejected',
        stake: 5,
        reward: 0,
        hasMessages: true
      },
      {
        id: '0x5a6b7c8d9e0f1a2b',
        title: 'Illegal Waste Disposal',
        category: 'environmental',
        date: '2025-03-23',
        status: 'verified',
        stake: 25,
        reward: 250,
        hasMessages: false
      }
    ];
const DashboardPage = () => {
  const [reports, setReports] = useState([]);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reports and balance when component mounts

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch data from backend
        const [reportData, balanceData] = await Promise.all([
          getUserReports(), 
          getTokenBalance()
        ]);
        
        // Deduplicate reports before setting state
        const uniqueReportMap = new Map();
        reportData.forEach(report => {
          uniqueReportMap.set(report.id.toString(), report);
        });
        
        const uniqueReports = Array.from(uniqueReportMap.values());
        console.log("Unique reports for dashboard:", uniqueReports);
        
        setReports(uniqueReports);
        setTokenBalance(balanceData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        
        // Fallback to localStorage if backend fails
        const localReports = JSON.parse(localStorage.getItem('whispr_reports') || '[]');
        
        // Deduplicate local reports too
        const uniqueReportMap = new Map();
        localReports.forEach(report => {
          uniqueReportMap.set(report.id.toString(), report);
        });
        
        setReports(Array.from(uniqueReportMap.values()));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const totalStaked = reports.reduce((sum, report) => sum + report.stake, 0);
  const totalRewards = reports.reduce((sum, report) => sum + report.reward, 0);
  const verifiedReports = reports.filter(report => report.status === 'verified').length;

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         report.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending Review';
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'environmental':
        return 'bg-emerald-900 bg-opacity-40 text-emerald-400';
      case 'fraud':
        return 'bg-amber-900 bg-opacity-40 text-amber-400';
      case 'cybercrime':
        return 'bg-blue-900 bg-opacity-40 text-blue-400';
      case 'corruption':
        return 'bg-purple-900 bg-opacity-40 text-purple-400';
      case 'violence':
        return 'bg-red-900 bg-opacity-40 text-red-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30">
        <div className="flex items-center">
          <div className="p-3 bg-purple-900 bg-opacity-50 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
              <path d="M12 20v-6M6 20V10M18 20V4" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Reports</p>
            <p className="text-2xl font-bold">{reports.length}</p>
          </div>
        </div>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30">
        <div className="flex items-center">
          <div className="p-3 bg-green-900 bg-opacity-50 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Verified Reports</p>
            <p className="text-2xl font-bold">{verifiedReports}</p>
          </div>
        </div>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30">
        <div className="flex items-center">
          <div className="p-3 bg-blue-900 bg-opacity-50 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 18V6" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Rewards</p>
            <p className="text-2xl font-bold">{totalRewards} <span className="text-sm text-gray-400">tokens</span></p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTabs = () => (
    <div className="mb-6">
      <div className="flex space-x-1 p-1 bg-slate-800 rounded-lg">
        <button 
          onClick={() => setActiveTab('reports')} 
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'reports' 
              ? 'bg-slate-700 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Your Reports
        </button>
        <button 
          onClick={() => setActiveTab('rewards')} 
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'rewards' 
              ? 'bg-slate-700 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Rewards
        </button>
        <button 
          onClick={() => setActiveTab('stakes')} 
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'stakes' 
              ? 'bg-slate-700 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Stakes
        </button>
      </div>
    </div>
  );

  const renderSearchAndFilter = () => (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
        />
      </div>
      
      <div className="relative min-w-[180px]">
        <div className="flex items-center">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none pl-10 pr-8 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
        </div>
      </div>
      
      <Link to="/report">
        <Button variant="primary">
          New Report
        </Button>
      </Link>
    </div>
  );

  const renderReportsList = () => (
    <div className="space-y-4">
      {filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No reports found matching your criteria.</p>
        </div>
      ) : (
        filteredReports.map((report) => (
          <Card key={report.id} className="hover:border-gray-700 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  {getStatusIcon(report.status)}
                  <span className={`ml-2 text-sm ${
                    report.status === 'verified' ? 'text-green-400' : 
                    report.status === 'rejected' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {getStatusText(report.status)}
                  </span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getCategoryBadgeColor(report.category)}`}>
                    {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                  </span>
                </div>
                <h3 className="font-medium mb-1">{report.title}</h3>
                <div className="flex items-center text-sm text-gray-400">
                  <span className="font-mono">{report.id}</span>
                  <span className="mx-2">•</span>
                  <span>{report.date}</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-6">
                    Staked: <span className="font-medium text-purple-400">{report.stake} tokens</span>
                  </span>
                  {report.status === 'verified' && (
                    <span className="text-sm">
                      Reward: <span className="font-medium text-green-400">{report.reward} tokens</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {report.hasMessages && (
                  <Link to={`/chat/${report.id}`}>
                    <Button variant="secondary" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Messages
                    </Button>
                  </Link>
                )}
                <Link to={`/report/${report.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const renderRewardsTab = () => (
    <div>
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>Rewards Summary</Card.Title>
          <Card.Description>
            Overview of earnings from verified reports
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col md:flex-row gap-6 py-4">
            <div className="flex-1 text-center p-6 bg-slate-800 rounded-lg">
              <p className="text-gray-400 mb-2">Total Rewards Earned</p>
              <p className="text-3xl font-bold text-green-400">{totalRewards}</p>
              <p className="text-sm text-gray-500">tokens</p>
            </div>
            <div className="flex-1 text-center p-6 bg-slate-800 rounded-lg">
              <p className="text-gray-400 mb-2">Total Staked</p>
              <p className="text-3xl font-bold text-purple-400">{totalStaked}</p>
              <p className="text-sm text-gray-500">tokens</p>
            </div>
            <div className="flex-1 text-center p-6 bg-slate-800 rounded-lg">
              <p className="text-gray-400 mb-2">Net Earnings</p>
              <p className="text-3xl font-bold text-blue-400">{totalRewards - totalStaked}</p>
              <p className="text-sm text-gray-500">tokens</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Reward History</Card.Title>
          <Card.Description>
            Details of rewards received for verified reports
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Report ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date Verified</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Staked</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Reward</th>
                </tr>
              </thead>
              <tbody>
                {reports
                  .filter(report => report.status === 'verified')
                  .map(report => (
                    <tr key={report.id} className="border-b border-gray-800 hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-sm font-mono">{report.id}</td>
                      <td className="px-4 py-3">{report.title}</td>
                      <td className="px-4 py-3 text-sm">{report.date}</td>
                      <td className="px-4 py-3 text-sm text-purple-400">{report.stake} tokens</td>
                      <td className="px-4 py-3 text-sm text-green-400">{report.reward} tokens</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderStakesTab = () => (
    <div>
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>Stakes Overview</Card.Title>
          <Card.Description>
            Summary of your token stakes across all reports
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col md:flex-row gap-6 py-4">
            <div className="flex-1 text-center p-6 bg-slate-800 rounded-lg">
              <p className="text-gray-400 mb-2">Active Stakes</p>
              <p className="text-3xl font-bold text-purple-400">
                {reports.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.stake, 0)}
              </p>
              <p className="text-sm text-gray-500">tokens</p>
            </div>
            <div className="flex-1 text-center p-6 bg-slate-800 rounded-lg">
              <p className="text-gray-400 mb-2">Returned Stakes</p>
              <p className="text-3xl font-bold text-green-400">
                {reports.filter(r => r.status === 'verified').reduce((sum, r) => sum + r.stake, 0)}
              </p>
              <p className="text-sm text-gray-500">tokens</p>
            </div>
            <div className="flex-1 text-center p-6 bg-slate-800 rounded-lg">
              <p className="text-gray-400 mb-2">Lost Stakes</p>
              <p className="text-3xl font-bold text-red-400">
                {reports.filter(r => r.status === 'rejected').reduce((sum, r) => sum + r.stake, 0)}
              </p>
              <p className="text-sm text-gray-500">tokens</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Stake Details</Card.Title>
          <Card.Description>
            All your staked reports and their current status
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Report ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Staked</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className="border-b border-gray-800 hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm font-mono">{report.id}</td>
                    <td className="px-4 py-3">{report.title}</td>
                    <td className="px-4 py-3 text-sm">{report.date}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center">
                        {getStatusIcon(report.status)}
                        <span className="ml-2 text-sm">
                          {getStatusText(report.status)}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-purple-400">{report.stake} tokens</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'rewards':
        return renderRewardsTab();
      case 'stakes':
        return renderStakesTab();
      case 'reports':
      default:
        return (
          <>
            {renderSearchAndFilter()}
            {renderReportsList()}
          </>
        );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <div>
          <div className="flex items-center bg-slate-800 rounded-lg px-4 py-2">
            <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm mr-1">Balance:</span>
            <span className="font-semibold">{tokenBalance} tokens</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {renderStatsCards()}
          {renderTabs()}
          {renderActiveTabContent()}
        </>
      )}
    </div>
  );
};

export default DashboardPage;