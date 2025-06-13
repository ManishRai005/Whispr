
import React from 'react';

const FeatureCard = ({ icon, title, description, color }) => {
  return (
    <div className={`bg-white p-8 rounded-xl shadow-lg border-t-4 border-${color}-500 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}>
      <div className={`h-16 w-16 bg-${color}-100 rounded-full flex items-center justify-center mb-6 mx-auto`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-center mb-4 text-gray-800">{title}</h3>
      <p className="text-center text-gray-600">{description}</p>
    </div>
  );
};

const FeatureHighlights = () => {
  const features = [
    {
      title: "Anonymous Reporting",
      description: "Submit evidence securely with your identity protected by advanced blockchain technology.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "teal"
    },
    {
      title: "Token Staking System",
      description: "Stake tokens when reporting to ensure credibility. Receive 10x rewards for verified reports.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "indigo"
    },
    {
      title: "Secure Communication",
      description: "Chat with authorities while maintaining your anonymity through encrypted channels.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: "teal"
    }
  ];

  return (
    <div className="px-8 py-20 bg-gray-50">
      <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">How It Works</h2>
      <p className="text-xl text-center mb-12 text-gray-600 max-w-3xl mx-auto">
        Our blockchain-based platform ensures complete anonymity while fighting crime
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <FeatureCard 
            key={index}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            color={feature.color}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureHighlights;