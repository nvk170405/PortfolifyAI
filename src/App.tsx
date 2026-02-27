import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import PortfolioBuilder from './pages/PortfolioBuilder';
import CaseStudyBuilder from './pages/CaseStudyBuilder';
import JDAnalyzer from './pages/JDAnalyzer';
import Recommendations from './pages/Recommendations';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import CoverLetter from './pages/CoverLetter';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout with Navbar and Footer (Public pages)
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="grow pt-32">{children}</main>
    <Footer />
  </div>
);

// Auth Layout (No Navbar/Footer)
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-light-200">
    {children}
  </div>
);

// Wrap dashboard routes with auth guard
const Protected = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout><Landing /></MainLayout>} />
          <Route path="/pricing" element={<MainLayout><Pricing /></MainLayout>} />
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/resume-builder" element={<Protected><ResumeBuilder /></Protected>} />
          <Route path="/portfolio-builder" element={<Protected><PortfolioBuilder /></Protected>} />
          <Route path="/case-studies" element={<Protected><CaseStudyBuilder /></Protected>} />
          <Route path="/jd-analyzer" element={<Protected><JDAnalyzer /></Protected>} />
          <Route path="/recommendations" element={<Protected><Recommendations /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="/cover-letter" element={<Protected><CoverLetter /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
