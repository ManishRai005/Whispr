import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className="border-b border-gray-700/30 py-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <motion.button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <h3 className="text-lg font-semibold text-white">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-dark-300 p-1 rounded-full"
        >
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-primary-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 text-primary-400 flex-shrink-0" />
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 text-gray-300 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "How do I connect my wallet?",
      answer: "Click \"Connect Wallet\" on the homepage. Approve the connection in the Plug popup; once connected, you'll be assigned a principal ID and can start reporting or reviewing."
    },
    {
      question: "How is my identity protected?",
      answer: "We never collect personal info. All reports are recorded on the Internet Computer blockchain under a one-time, randomized report ID. Your real identity is never stored or linked to your submission."
    },
    {
      question: "Why do I need to stake tokens when submitting a report?",
      answer: "Staking a small amount of tokens discourages false reports by creating a financial commitment. If your report is verified as genuine, you get your stake back plus a reward. If it's false, the stake is burned."
    },
    {
      question: "What happens if my report is deemed false?",
      answer: "Your staked tokens are forfeited (`slashed`) and added to a community escrow fund. This penalty helps ensure only serious, honest reports are submitted."
    },
    {
      question: "Who reviews and verifies reports?",
      answer: "Only verified authorities (e.g., police or anti-fraud units) have access to the Authority Panel. They examine your evidence and mark the report genuine or false—without ever seeing your identity."
    },
    {
      question: "How do I receive my reward?",
      answer: "Once an authority confirms your report is genuine, our smart contract automatically sends you a tip equal to 10× your staked tokens directly to your connected Plug wallet."
    },
    {
      question: "Can authorities identify who filed the report?",
      answer: "No. All evidence and chat communications are tied to the report's anonymous blockchain ID. Authorities never see any personal or wallet data."
    },
    {
      question: "What types of illegal activities can I report?",
      answer: "You can report crimes such as Murder, Assault, Fraud, Cybercrime, Drug Crimes, Human Trafficking, Terrorism, and more—using clear, everyday categories."
    },
    {
      question: "Where is my report data stored?",
      answer: "Your summary, photos, and videos are stored in decentralized ICP canisters. The blockchain ledger ensures your data is tamper-proof and fully transparent to authorized reviewers."
    },
    {
      question: "What if I lose my wallet or private key?",
      answer: "Reports are tied to your principal ID. Losing your wallet keys means you can no longer claim rewards or interact with your reports, so always back up your seed phrase securely."
    }
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-500/30 to-dark-900" />
      <div className="absolute top-40 -right-40 w-80 h-80 bg-purple-900/20 rounded-full filter blur-3xl" />
      <div className="absolute bottom-20 -left-20 w-64 h-64 bg-secondary-900/20 rounded-full filter blur-3xl" />

      <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-6 text-gradient"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "100px" }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl text-gray-300"
          >
            Everything you need to know about our anonymous reporting platform.
          </motion.p>
        </div>

        <motion.div 
          className="glass-card rounded-2xl p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;