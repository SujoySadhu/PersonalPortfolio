import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

// Layouts (always loaded)
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import Loading from './components/common/Loading';

// Public Pages - Critical (loaded eagerly for instant navigation)
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';

// Public Pages - Secondary (lazy loaded - fetched on first visit)
const Skills = lazy(() => import('./pages/Skills'));
const Research = lazy(() => import('./pages/Research'));
const Contact = lazy(() => import('./pages/Contact'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Interests = lazy(() => import('./pages/Interests'));
const CurrentWork = lazy(() => import('./pages/CurrentWork'));

// Admin Pages (lazy loaded - only fetched when admin navigates there)
const Login = lazy(() => import('./pages/admin/Login'));
const ForgotPassword = lazy(() => import('./pages/admin/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const ProjectForm = lazy(() => import('./pages/admin/ProjectForm'));
const AdminSkills = lazy(() => import('./pages/admin/AdminSkills'));
const AdminResearch = lazy(() => import('./pages/admin/AdminResearch'));
const ResearchForm = lazy(() => import('./pages/admin/ResearchForm'));
const AdminAchievements = lazy(() => import('./pages/admin/AdminAchievements'));
const AchievementForm = lazy(() => import('./pages/admin/AchievementForm'));
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs'));
const BlogForm = lazy(() => import('./pages/admin/BlogForm'));
const AdminInterests = lazy(() => import('./pages/admin/AdminInterests'));
const AdminCurrentWork = lazy(() => import('./pages/admin/AdminCurrentWork'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));

// Lazy wrapper for admin routes
const AdminRoute = ({ children }) => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-dark-200"><Loading text="Loading..." /></div>}>
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  </Suspense>
);

// Public Layout wrapper with Suspense for lazy pages
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-dark-200"><Loading /></div>}>
        {children}
      </Suspense>
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f3f4f6'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f3f4f6'
              }
            }
          }}
        />
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
            <Route path="/projects/:id" element={<PublicLayout><ProjectDetails /></PublicLayout>} />
            <Route path="/skills" element={<PublicLayout><Skills /></PublicLayout>} />
            <Route path="/research" element={<PublicLayout><Research /></PublicLayout>} />
            <Route path="/achievements" element={<PublicLayout><Achievements /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
            <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
            <Route path="/interests" element={<PublicLayout><Interests /></PublicLayout>} />
            <Route path="/current-work" element={<PublicLayout><CurrentWork /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

            {/* Admin Routes - Lazy Loaded */}
            <Route path="/admin/login" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-dark-200"><Loading /></div>}><Login /></Suspense>} />
            <Route path="/admin/forgot-password" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-dark-200"><Loading /></div>}><ForgotPassword /></Suspense>} />


            <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/admin/projects" element={<AdminRoute><AdminProjects /></AdminRoute>} />
            <Route path="/admin/projects/new" element={<AdminRoute><ProjectForm /></AdminRoute>} />
            <Route path="/admin/projects/edit/:id" element={<AdminRoute><ProjectForm /></AdminRoute>} />
            <Route path="/admin/skills" element={<AdminRoute><AdminSkills /></AdminRoute>} />
            <Route path="/admin/skills/new" element={<AdminRoute><AdminSkills /></AdminRoute>} />
            <Route path="/admin/research" element={<AdminRoute><AdminResearch /></AdminRoute>} />
            <Route path="/admin/research/new" element={<AdminRoute><ResearchForm /></AdminRoute>} />
            <Route path="/admin/research/edit/:id" element={<AdminRoute><ResearchForm /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
            <Route path="/admin/achievements" element={<AdminRoute><AdminAchievements /></AdminRoute>} />
            <Route path="/admin/achievements/new" element={<AdminRoute><AchievementForm /></AdminRoute>} />
            <Route path="/admin/achievements/edit/:id" element={<AdminRoute><AchievementForm /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/admin/blogs" element={<AdminRoute><AdminBlogs /></AdminRoute>} />
            <Route path="/admin/blogs/new" element={<AdminRoute><BlogForm /></AdminRoute>} />
            <Route path="/admin/blogs/edit/:id" element={<AdminRoute><BlogForm /></AdminRoute>} />
            <Route path="/admin/interests" element={<AdminRoute><AdminInterests /></AdminRoute>} />
            <Route path="/admin/current-work" element={<AdminRoute><AdminCurrentWork /></AdminRoute>} />

            {/* 404 Route */}
            <Route path="*" element={
              <PublicLayout>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                    <p className="text-gray-400 mb-8">Page not found</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </div>
              </PublicLayout>
            } />
          </Routes>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;