import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PoliceDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // For development, we can use mock data until backend is ready
        // In production, replace with actual API call
        
        // Mock API call simulation
        setTimeout(() => {
          const mockReports = [
            {
              id: '1',
              crimeSubcategory: 'Theft',
              description: 'Witnessed a theft at Main Street market on Saturday evening',
              occurrenceDate: '2025-04-15T18:30:00',
              tipScore: 85,
              solved: false,
              tokenStake: 10
            },
            {
              id: '2',
              crimeSubcategory: 'Vandalism',
              description: 'Group of individuals vandalizing public property at Central Park',
              occurrenceDate: '2025-04-10T22:15:00',
              tipScore: 92,
              solved: true,
              tokenStake: 15
            }
          ];
          
          setReports(mockReports);
          setLoading(false);
        }, 1000);
        
        // When backend is ready, uncomment this code:
        /*
        const response = await fetch('/api/report/my-reports');
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        
        const data = await response.json();
        setReports(data.reports);
        setLoading(false);
        */
      } catch (err) {
        setError('Error loading reports. Please try again later.');
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  const handleSubmitReport = () => {
    navigate('/report/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600">My Submitted Reports</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center p-12">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading your reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-gray-100 p-8 text-center rounded-xl shadow-md">
            <p className="text-lg text-gray-700">You haven't submitted any reports yet.</p>
            <button 
              onClick={handleSubmitReport}
              className="mt-4 bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 shadow-md transition-all duration-300"
            >
              Submit a Report
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-xl">
            <table className="min-w-full bg-white border rounded-xl overflow-hidden">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Crime Type</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-left">Date Reported</th>
                  <th className="py-3 px-4 text-left">Tip Score</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Tokens Staked</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-t hover:bg-indigo-50 transition-colors">
                    <td className="py-3 px-4 font-medium">{report.crimeSubcategory}</td>
                    <td className="py-3 px-4">
                      {report.description.length > 50
                        ? `${report.description.substring(0, 50)}...`
                        : report.description}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(report.occurrenceDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="font-medium">{report.tipScore}</span>
                        <div className="w-2 h-2 ml-2 rounded-full bg-teal-500"></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {report.solved ? (
                        <span className="bg-teal-100 text-teal-800 py-1 px-3 rounded-full text-sm font-medium">Solved</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-sm font-medium">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{report.tokenStake}</span> ICP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-6 text-right">
              <button 
                onClick={handleSubmitReport}
                className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 shadow-md transition-all duration-300"
              >
                Submit New Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliceDashboard;