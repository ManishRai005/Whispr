import React from 'react';
import Navbar from '../layout/Navbar';
import HeroSection from './HeroSection';
import AnimatedBands from './AnimatedBands';
import HowItWorks from '../ui/HowItWorks';
import Features from '../ui/Features';
import FeatureHighlights from './FeatureHighlights';
import FAQ from '../ui/FAQ';
import BackgroundEffects from '../ui/BackgroundEffects';
import useWalletConnect from '../wallet/WalletConnect';
import Notification from '../ui/Notification';

const Home = () => {
  const { error, successMessage, setError, setSuccessMessage } = useWalletConnect();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Notifications */}
      {successMessage && (
        <Notification 
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      
      {error && (
        <Notification 
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      
      {/* Background Elements */}
      <BackgroundEffects />
      
      {/* Hero Section - First impression */}
      <HeroSection />
      
      {/* Animated Bands - Visual separator */}
      <AnimatedBands />
      
      {/* How It Works - Process explanation */}
      <HowItWorks />
      
      {/* Features - Detailed capabilities */}
      <Features />
      
      {/* Feature Highlights - Additional visual showcase */}
      <div className="py-16">
        <FeatureHighlights />
      </div>

      {/* FAQ Section - Answer common questions */}
      <section className="w-full py-16">
        <FAQ key="faq-section" />
      </section>
    </div>
  );
};

export default Home;