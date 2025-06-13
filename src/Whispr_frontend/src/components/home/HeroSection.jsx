import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, Lock, FileText } from 'lucide-react';

const HeroSection = () => {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const iconVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.2,
        duration: 0.8,
        type: "spring",
        stiffness: 100
      }
    })
  };

  const handleSubmitReport = () => {
    navigate('/report');
  };

  return (
    <section ref={ref} className="relative min-h-screen pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-gray-800/5 to-gray-900 z-0" />

      {/* Floating Circles */}
      <div className="absolute top-1/4 left-10 h-40 w-40 rounded-full bg-purple-500/10 mix-blend-screen filter blur-2xl animate-float" />
      <div className="absolute bottom-1/3 right-20 h-48 w-48 rounded-full bg-blue-500/10 mix-blend-screen filter blur-2xl animate-float" style={{ animationDelay: '-2s' }} />
      <div className="absolute top-1/3 right-1/3 h-32 w-32 rounded-full bg-purple-500/10 mix-blend-screen filter blur-2xl animate-float" style={{ animationDelay: '-4s' }} />

      <motion.div 
        className="container mx-auto px-4 md:px-6 relative z-10 pt-16 md:pt-24 lg:pt-32"
        style={{ y, opacity }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/30"
          >
            <Shield className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium">Powered by Internet Computer</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="block bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">Decentralized Crime</span>
            <span className="block">Reporting Platform</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12"
          >
            Report illegal activities anonymously and earn rewards for verified reports.
            Your identity stays protected through blockchain technology.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              onClick={handleSubmitReport}
              className="px-8 py-4 rounded-full text-lg font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20 flex items-center justify-center"
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(121, 40, 202, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Start Reporting
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.button>
            
            <motion.button
              className="px-8 py-4 rounded-full text-lg font-medium border border-gray-700 hover:bg-gray-800/50 transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>

        {/* Floating Cards */}
        <div className="relative mt-24 md:mt-32 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            custom={0}
            variants={iconVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 overflow-hidden group"
            whileHover={{ y: -10, boxShadow: "0 20px 40px -15px rgba(121, 40, 202, 0.3)" }}
          >
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-purple-400 to-purple-600 opacity-60" />
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-4 bg-purple-500/20 rounded-xl inline-block mb-4"
            >
              <Lock className="h-8 w-8 text-purple-400" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2 text-white">100% Anonymous</h3>
            <p className="text-gray-400">Your identity is fully protected through blockchain technology.</p>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-700" />
          </motion.div>

          <motion.div 
            custom={1}
            variants={iconVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 overflow-hidden group"
            whileHover={{ y: -10, boxShadow: "0 20px 40px -15px rgba(0, 112, 243, 0.3)" }}
          >
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-400 to-blue-600 opacity-60" />
            <motion.div
              whileHover={{ scale: 1.2, rotate: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-4 bg-blue-500/20 rounded-xl inline-block mb-4"
            >
              <FileText className="h-8 w-8 text-blue-400" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2 text-white">Secure Evidence</h3>
            <p className="text-gray-400">Submit text, photos, and videos as evidence securely on the blockchain.</p>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-700" />
          </motion.div>

          <motion.div 
            custom={2}
            variants={iconVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 overflow-hidden group"
            whileHover={{ y: -10, boxShadow: "0 20px 40px -15px rgba(121, 40, 202, 0.3)" }}
          >
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-purple-400 to-blue-600 opacity-60" />
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl inline-block mb-4"
            >
              <Shield className="h-8 w-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2 text-white">Blockchain Powered</h3>
            <p className="text-gray-400">Reports stored on the Internet Computer blockchain for maximum security.</p>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-700" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;