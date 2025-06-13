import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Upload, Lock, MessageSquare } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: 'Connect & Verify',
      description: 'Connect your wallet anonymously through zero-knowledge proofs',
      icon: Shield,
      color: 'bg-primary-500'
    },
    {
      id: 2,
      title: 'Submit Evidence',
      description: 'Upload encrypted evidence securely to the blockchain',
      icon: Upload,
      color: 'bg-secondary-500'
    },
    {
      id: 3,
      title: 'Stake Tokens',
      description: 'Stake tokens to validate your report\'s authenticity',
      icon: Lock,
      color: 'bg-primary-400'
    },
    {
      id: 4,
      title: 'Authority Review',
      description: 'Verified authorities review while maintaining your anonymity',
      icon: MessageSquare,
      color: 'bg-secondary-400'
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-dark-800/30" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6 text-white">How It Works</h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "100px" }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6"
          />
          <p className="text-xl text-gray-300">
            Four simple steps to anonymously report and get rewarded
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line connecting steps */}
          <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-primary-500 via-secondary-500 to-primary-500 transform -translate-x-1/2"></div>
          
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'} pb-8 md:pb-0`}>
                  <motion.div 
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 0 15px 2px rgba(101, 75, 228, 0.2)",
                      transition: { 
                        duration: 0.4, 
                        ease: "easeOut" 
                      }
                    }}
                    className={`glass-card p-8 rounded-xl inline-block max-w-md transition-all cursor-pointer`}
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                    <motion.div 
                      initial={{ width: 0 }}
                      className="h-0.5 bg-gradient-to-r from-secondary-400 to-primary-400 mt-4"
                      whileHover={{ 
                        width: "80%", 
                        transition: { 
                          duration: 0.6, 
                          ease: "easeInOut" 
                        }
                      }}
                    />
                  </motion.div>
                </div>
                
                <div className="flex justify-center relative z-10">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    whileHover={{
                      boxShadow: "0 0 15px 2px rgba(101, 75, 228, 0.3)",
                      transition: { duration: 0.4, ease: "easeOut" }
                    }}
                    className={`rounded-full w-16 h-16 ${step.color} flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg transition-all`}
                  >
                    {step.id}
                  </motion.div>
                </div>
                
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-left md:pl-16' : 'md:text-right md:pr-16'} pt-8 md:pt-0`}>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
                    className="flex md:justify-center"
                  >
                    <motion.div 
                      className={`bg-dark-700/50 p-4 rounded-full cursor-pointer transition-all duration-300`}
                      whileHover={{ 
                        scale: 1.1,
                        boxShadow: "0 0 15px 2px rgba(101, 75, 228, 0.3)",
                        backgroundColor: "rgba(101, 75, 228, 0.15)",
                        transition: { 
                          duration: 0.5, 
                          ease: "easeInOut" 
                        } 
                      }}
                    >
                      <motion.div
                        whileHover={{ 
                          rotate: [0, -5, 5, -3, 0],
                          transition: { 
                            duration: 0.8, 
                            ease: "easeInOut",
                            times: [0, 0.2, 0.5, 0.8, 1] 
                          }
                        }}
                      >
                        <step.icon className="w-8 h-8 text-primary-400" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;