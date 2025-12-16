import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './i18n';
import { Navigation } from './components/navigation';
import { Sidebar } from './components/sidebar';
import { Dashboard } from './components/dashboard';
import { LiveMap } from './components/live-map';
import { Profile } from './components/profile';
import { AdminPanel } from './components/admin-panel';
import { DisasterInfo } from './components/disaster-info';
import { Reports } from './components/reports';
import { Analytics } from './components/analytics';
import { FAQ } from './components/faq';
import { ReportModal } from './components/report-modal';
import { LoginModal } from './components/login-modal';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation 
          onReportClick={() => setReportModalOpen(true)}
          onLoginClick={() => setLoginModalOpen(true)}
        />
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedState={selectedState}
          onStateChange={setSelectedState}
        />
        
        <main className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard selectedState={selectedState} />} />
              <Route path="/map" element={<LiveMap />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/disaster-info" element={<DisasterInfo />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/faq" element={<FAQ />} />
              {/* Catch-all route - redirects any unmatched routes to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>

        <ReportModal 
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
        />
        
        <LoginModal 
          open={loginModalOpen}
          onOpenChange={setLoginModalOpen}
        />
        
        <Toaster />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="disaster-alert-theme">
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <AnalyticsProvider>
              <AppContent />
            </AnalyticsProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}