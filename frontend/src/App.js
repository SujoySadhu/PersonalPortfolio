import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Skills from './pages/Skills';
import Research from './pages/Research';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminProjects from './pages/admin/AdminProjects';
import ProjectForm from './pages/admin/ProjectForm';
import AdminSkills from './pages/admin/AdminSkills';
import AdminResearch from './pages/admin/AdminResearch';
import ResearchForm from './pages/admin/ResearchForm';
import AdminAchievements from './pages/admin/AdminAchievements';
import AchievementForm from './pages/admin/AchievementForm';
import AdminBlogs from './pages/admin/AdminBlogs';
import BlogForm from './pages/admin/BlogForm';
import AdminInterests from './pages/admin/AdminInterests';
import AdminCurrentWork from './pages/admin/AdminCurrentWork';
import AdminCategories from './pages/admin/AdminCategories';
import Settings from './pages/admin/Settings';

// Public Pages (additional)
import Achievements from './pages/Achievements';
import Interests from './pages/Interests';
import CurrentWork from './pages/CurrentWork';

// Public Layout wrapper
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
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

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/projects" element={
            <ProtectedRoute>
              <AdminLayout><AdminProjects /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/projects/new" element={
            <ProtectedRoute>
              <AdminLayout><ProjectForm /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/projects/edit/:id" element={
            <ProtectedRoute>
              <AdminLayout><ProjectForm /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/skills" element={
            <ProtectedRoute>
              <AdminLayout><AdminSkills /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/skills/new" element={
            <ProtectedRoute>
              <AdminLayout><AdminSkills /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/research" element={
            <ProtectedRoute>
              <AdminLayout><AdminResearch /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/research/new" element={
            <ProtectedRoute>
              <AdminLayout><ResearchForm /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/research/edit/:id" element={
            <ProtectedRoute>
              <AdminLayout><ResearchForm /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <AdminLayout><Settings /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* Admin Achievement Routes */}
          <Route path="/admin/achievements" element={
            <ProtectedRoute>
              <AdminLayout><AdminAchievements /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/achievements/new" element={
            <ProtectedRoute>
              <AdminLayout><AchievementForm /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/achievements/edit/:id" element={
            <ProtectedRoute>
              <AdminLayout><AchievementForm /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* Admin Categories Route */}
          <Route path="/admin/categories" element={
            <ProtectedRoute>
              <AdminLayout><AdminCategories /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* Admin Blog Routes */}
          <Route path="/admin/blogs" element={
            <ProtectedRoute>
              <AdminLayout><AdminBlogs /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/blogs/new" element={
            <ProtectedRoute>
              <AdminLayout><BlogForm /></AdminLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/blogs/edit/:id" element={
            <ProtectedRoute>
              <AdminLayout><BlogForm /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* Admin Interests Route */}
          <Route path="/admin/interests" element={
            <ProtectedRoute>
              <AdminLayout><AdminInterests /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* Admin Current Work Route */}
          <Route path="/admin/current-work" element={
            <ProtectedRoute>
              <AdminLayout><AdminCurrentWork /></AdminLayout>
            </ProtectedRoute>
          } />

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
    </AuthProvider>
  );
}

export default App;