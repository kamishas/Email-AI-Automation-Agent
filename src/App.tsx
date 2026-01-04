import React, { useState } from 'react';
import { CampaignProvider } from './context/CampaignContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ContactsPage } from './pages/ContactsPage';
import { Import } from './pages/Import';
import { Composer } from './pages/Composer';
import { Launchpad } from './pages/Launchpad';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'contacts':
        return <ContactsPage />;
      case 'import':
        return <Import onNavigate={setCurrentPage} />;
      case 'composer':
        return <Composer onNavigate={setCurrentPage} />;
      case 'launchpad':
        return <Launchpad onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <CampaignProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        {renderPage()}
      </div>
    </CampaignProvider>
  );
}
