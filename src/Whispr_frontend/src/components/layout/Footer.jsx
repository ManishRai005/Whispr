import React from 'react';
import { Shield, Github, Linkedin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-800/50 backdrop-blur-sm py-10 border-t border-dark-700 relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* First column - takes 5/12 width */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary-500" />
              <span className="font-bold text-xl text-white">Whispr</span>
            </div>
            <p className="text-gray-400 text-sm">
              Secure, anonymous reporting powered by Internet Computer blockchain technology.
              Your identity remains private while making the world safer.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/AR21SM/Whispr"
                className="text-gray-400 hover:text-primary-400 transform hover:-translate-y-1 transition-all"
              >
                <Github size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/21ashishmahajan/"
                className="text-gray-400 hover:text-primary-400 transform hover:-translate-y-1 transition-all"
              >
                <Linkedin size={20}  />
              </a>
              <a
                href="https://aoicy-vyaaa-aaaag-aua4a-cai.icp0.io/"
                className="text-gray-400 hover:text-primary-400 transform hover:-translate-y-1 transition-all"
              >
                <ExternalLink size={20} />
              </a>
            </div>
          </div>

          {/* Added spacing - leave 1/12 empty */}
          <div className="hidden md:block md:col-span-1"></div>

          {/* Quick Links - takes 3/12 width */}
          <div className="md:col-span-3">
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/report" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Report Activity
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/authority" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Authority Access
                </a>
              </li>
            </ul>
          </div>

          {/* Resources - takes 3/12 width */}
          <div className="md:col-span-3">
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/AR21SM/Whispr" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="terms-of-service" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
              <a 
                  href="/#faq" 
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  onClick={(e) => {
                    // If we're already on the homepage, use smooth scrolling
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      const element = document.getElementById('faq');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }
                    // Otherwise, the browser will navigate to /#faq
                  }}
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-dark-600 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2025 Whispr. All rights reserved.
          </p>
          <div className="flex items-center mt-4 md:mt-0">
            <span className="text-gray-500 text-sm flex items-center">
              Powered by 
              <span 
                className="ml-2 text-gray-300 flex items-center hover:opacity-100 opacity-80 transition-opacity"
              >
                Internet Computer
                <span className="ml-2 inline-block w-2 h-2 bg-secondary-500 rounded-full"></span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}