import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Search, Filter, ChevronDown, ArrowUpDown, 
  CheckCircle, XCircle, Eye, MessageSquare,
  Lock, Shield
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// Mock data for reports
const mockReports = [
  {
    id: '0x7f9b4d8a1e2c3b4d',
    title: 'Environmental Dumping Near River',
    category: 'environmental',
    date: '2025-04-21',
    informerId: '0x3fc7...a921',
    status: 'pending',
    description: 'Multiple industrial containers being dumped in the river near...',
    evidenceCount: 3,
    stakeAmount: 15
  },
  {
    id: '0x3a4b5c6d7e8f9a0b',
    title: 'Suspicious Financial Activity',
    category: 'fraud',
    date: '2025-04-22',
    informerId: '0x7d2e...f914',
    status: 'pending',
    description: 'Unusual pattern of transactions from multiple accounts...',
    evidenceCount: 1,
    stakeAmount: 20
  },
  {
    id: '0x1e2f3a4b5c6d7e8f',
    title: 'Cyber Attack Attempt',
    category: 'cybercrime',
    date: '2025-04-23',
    informerId: '0x9e5d...c102',
    status: 'pending',
    description: 'Multiple unauthorized access attempts to government database...',
    evidenceCount: 5,
    stakeAmount: 10
  },
  {
    id: '0x9a0b1c2d3e4f5a6b',
    title: 'Counterfeit Products Distribution',
    category: 'fraud',
    date: '2025-03-24',
    informerId: '0x2b5c...d837',
    status: 'pending',
    description: 'Large scale counterfeit luxury goods being sold in...',
    evidenceCount: 2,
    stakeAmount: 5
  },
  {
    id: '0x5a6b7c8d9e0f1a2b',
    title: 'Illegal Waste Disposal',
    category: 'environmental',
    date: '2025-03-23',
    informerId: '0x8a4c...b291',
    status: 'pending',
    description: 'Company disposing hazardous waste in protected area...',
    evidenceCount: 4,
    stakeAmount: 25
  }
];

const AuthorityPage = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          report.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'stake') {
      comparison = a.stakeAmount - b.stakeAmount;
    } else if (sortBy === 'evidence') {
      comparison = a.evidenceCount - b.evidenceCount;
    } else if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

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
  
  const handleReportAction = (id, action) => {
    // In a real application, this would send the verification to the blockchain
    alert(`Report ${id} ${action === 'verify' ? 'verified' : 'rejected'}`);
    setSelectedReport(null);
  };

  const selectedReportData = selectedReport 
    ? mockReports.find(report => report.id === selectedReport) 
    : null;

  const renderReportsList = () => (
    <div className="w-full">
      <Card>
        <Card.Header className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <Card.Title>Pending Reports</Card.Title>
            <Card.Description>
              Review and verify anonymous reports
            </Card.Description>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
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
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm text-gray-400 font-mono mt-1">{report.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryBadgeColor(report.category)}`}>
                          {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">{report.date}</td>
                      <td className="px-4 py-4 text-sm">{report.evidenceCount} files</td>
                      <td className="px-4 py-4 text-sm text-purple-400">{report.stakeAmount} tokens</td>
                      <td className="px-4 py-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReport(report.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/authority/chat/${report.id}`);
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
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
    
    return (
      <Card>
        <Card.Header className="flex justify-between items-start">
          <div>
            <Card.Title>{selectedReportData.title}</Card.Title>
            <Card.Description className="font-mono">
              {selectedReportData.id}
            </Card.Description>
          </div>
          <button 
            onClick={() => setSelectedReport(null)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <XCircle className="h-5 w-5 text-gray-400" />
          </button>
        </Card.Header>
        <Card.Content>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className={`px-3 py-1 text-sm rounded-full ${getCategoryBadgeColor(selectedReportData.category)}`}>
                {selectedReportData.category.charAt(0).toUpperCase() + selectedReportData.category.slice(1)}
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-purple-900 bg-opacity-30 text-purple-400">
                Stake: {selectedReportData.stakeAmount} tokens
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-blue-900 bg-opacity-30 text-blue-400">
                {selectedReportData.date}
              </span>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Report Description</h3>
              <p className="bg-slate-800 p-4 rounded-lg">{selectedReportData.description}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Evidence Files ({selectedReportData.evidenceCount})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(selectedReportData.evidenceCount)].map((_, i) => (
                  <div key={i} className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                      <Lock className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 px-2">
                      <p className="text-xs text-gray-300 truncate">Evidence-{i+1}.jpg</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Click on evidence files to view them in full size
              </p>
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
                    ID: {selectedReportData.informerId}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
              <Button variant="secondary" onClick={() => setSelectedReport(null)}>
                Back to List
              </Button>
              <div className="flex space-x-3">
                <Button 
                  variant="danger" 
                  onClick={() => handleReportAction(selectedReportData.id, 'reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => handleReportAction(selectedReportData.id, 'verify')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30">
          <div className="flex items-center">
            <div className="p-3 bg-blue-900 bg-opacity-50 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <path d="M12 3v18" />
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Review</p>
              <p className="text-2xl font-bold">{mockReports.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30">
          <div className="flex items-center">
            <div className="p-3 bg-green-900 bg-opacity-50 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Verified Reports</p>
              <p className="text-2xl font-bold">156</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30">
          <div className="flex items-center">
            <div className="p-3 bg-amber-900 bg-opacity-50 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Rewards Distributed</p>
              <p className="text-2xl font-bold">4,350</p>
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