import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Submit = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    crimeSubcategory: '',
    description: '',
    personallyWitnessed: false,
    location: '',
    tokenStake: 10,
    evidenceFiles: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      evidenceFiles: e.target.files,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // For development, we can just simulate a successful submission
      // In production, replace with actual API call to your blockchain backend
      
      console.log('Submitting report:', formData);
      
      // Mock submission delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated success - would be replaced with actual API call
      /*
      const response = await fetch('/api/report/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crimeSubcategory: formData.crimeSubcategory,
          description: formData.description,
          personallyWitnessed: formData.personallyWitnessed,
          location: formData.location,
          tokenStake: formData.tokenStake,
          occurrenceDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }
      */
      
      // Redirect to report page after successful submission
      navigate('/report');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border-t-4 border-indigo-600">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Submit Anonymous Report</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Crime Subcategory</label>
            <select
              name="crimeSubcategory"
              value={formData.crimeSubcategory}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors"
              required
            >
              <option value="">Select category</option>
              <option value="Murder">Murder</option>
              <option value="Assault">Assault</option>
              <option value="Theft">Theft</option>
              <option value="Fraud">Fraud</option>
              <option value="Narcotics">Narcotics</option>
              <option value="Cybercrime">Cybercrime</option>
              <option value="Vandalism">Vandalism</option>
              <option value="Corruption">Corruption</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors"
              rows={5}
              required
              placeholder="Provide detailed information about the incident"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors"
              required
              placeholder="Where did this incident occur?"
            />
          </div>
          
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              name="personallyWitnessed"
              checked={formData.personallyWitnessed}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              id="personallyWitnessed"
            />
            <label htmlFor="personallyWitnessed" className="ml-3 text-gray-700">
              I personally witnessed this incident
            </label>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Token Stake (minimum 10 tokens)
            </label>
            <input
              type="number"
              name="tokenStake"
              value={formData.tokenStake}
              onChange={handleChange}
              min="10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Staking tokens helps prevent false reports. You'll receive 10x your stake as a reward if your report is verified as genuine.
            </p>
          </div>
          
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2">Upload Evidence (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                multiple
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-700 mb-1">Drag and drop files here, or click to browse</p>
                  <p className="text-xs text-gray-500">Supports images, videos (max 10MB)</p>
                </div>
              </label>
              {formData.evidenceFiles && formData.evidenceFiles.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="font-medium text-indigo-600">{formData.evidenceFiles.length} files selected</p>
                  <ul className="mt-2">
                    {Array.from(formData.evidenceFiles).map((file, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-indigo-50 p-5 rounded-lg mb-8 border-l-4 border-indigo-500">
            <h3 className="font-bold text-indigo-800 mb-2">Privacy Notice</h3>
            <p className="text-indigo-700">
              Your report will be submitted anonymously using blockchain technology. 
              No personal identification information will be collected or stored.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-indigo-600 text-white py-3 px-8 rounded-lg font-medium ${
                isSubmitting 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-1'
              } transition-all duration-300`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span>Submitting...</span>
                </div>
              ) : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Submit;