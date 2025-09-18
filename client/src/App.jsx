import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComplaintProvider, useComplaint } from './context/ComplaintContext';
import Landing from './pages/Landing';
import ComplaintFlow from './pages/ComplaintFlow';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';

const AppContent = () => {
  const { userRole, setUserInfo } = useComplaint();
  const [currentView, setCurrentView] = useState('landing');
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const handleRoleSelect = (role) => {
    setUserInfo({ role });
    if (role === 'citizen') {
      setCurrentView('citizen-dashboard');
    } else if (role === 'authority') {
      setCurrentView('authority-dashboard');
    }
  };

  const handleNewComplaint = () => {
    setCurrentView('complaint-flow');
  };

  const handleComplaintComplete = (complaint) => {
    setSubmittedComplaint(complaint);
    setCurrentView('citizen-dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setUserInfo({});
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <Landing onRoleSelect={handleRoleSelect} />;
      
      case 'complaint-flow':
        return (
          <ComplaintFlow 
            onComplete={handleComplaintComplete}
            onBack={() => setCurrentView('citizen-dashboard')}
          />
        );
      
      case 'citizen-dashboard':
        return (
          <CitizenDashboard 
            onNewComplaint={handleNewComplaint}
            onBack={handleBackToLanding}
          />
        );
      
      case 'authority-dashboard':
        return (
          <AuthorityDashboard 
            onBack={handleBackToLanding}
          />
        );
      
      default:
        return <Landing onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentView()}
        </motion.div>
      </AnimatePresence>
      
      {/* Success Message */}
      {submittedComplaint && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-green-500 text-white p-4 rounded-2xl shadow-lg max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold">Complaint Submitted!</h4>
                <p className="text-sm opacity-90">
                  Your {submittedComplaint.type} complaint has been received.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

function App() {
  return (
    <ComplaintProvider>
      <AppContent />
    </ComplaintProvider>
  );
}

export default App;
