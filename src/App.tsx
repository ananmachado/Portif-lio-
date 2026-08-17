import React from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { SkipLink } from './components/common/SkipLink';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/Toast';

import { AboutSection } from './components/public/AboutSection';
import { ProjectsSection } from './components/public/ProjectsSection';
import { ProjectDetail } from './components/public/ProjectDetail';
import { ContactSection } from './components/public/ContactSection';

import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminProjects } from './components/admin/AdminProjects';
import { AdminProjectEditor } from './components/admin/AdminProjectEditor';
import { AdminAppearance } from './components/admin/AdminAppearance';
import { AdminDatabaseSetup } from './components/admin/AdminDatabaseSetup';

const MainContent: React.FC = () => {
  const { currentRoute, isAuthenticated, adminSubView } = usePortfolio();

  // Public Routes
  if (currentRoute.page === 'about') {
    return <AboutSection />;
  }

  if (currentRoute.page === 'projects') {
    return <ProjectsSection />;
  }

  if (currentRoute.page === 'project-detail') {
    return <ProjectDetail projectSlug={currentRoute.projectSlug} />;
  }

  if (currentRoute.page === 'contact') {
    return <ContactSection />;
  }

  // Admin Route
  if (currentRoute.page === 'admin') {
    if (!isAuthenticated) {
      return <AdminLogin />;
    }

    return (
      <AdminLayout>
        {adminSubView === 'overview' && <AdminDashboard />}
        {adminSubView === 'settings' && <AdminSettings />}
        {adminSubView === 'categories' && <AdminCategories />}
        {adminSubView === 'projects' && <AdminProjects />}
        {adminSubView === 'project-edit' && <AdminProjectEditor />}
        {adminSubView === 'appearance' && <AdminAppearance />}
        {adminSubView === 'database-setup' && <AdminDatabaseSetup />}
      </AdminLayout>
    );
  }

  return <ProjectsSection />;
};

export default function App() {
  return (
    <PortfolioProvider>
      <div className="min-h-screen flex flex-col justify-between selection:bg-[var(--theme-primary)] selection:text-white">
        <SkipLink />
        <Header />

        <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
          <MainContent />
        </main>

        <Footer />
        <ToastContainer />
      </div>
    </PortfolioProvider>
  );
}
