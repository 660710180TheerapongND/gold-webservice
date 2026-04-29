import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';
import ScrollToTop from './components/ui/ScrollToTop'; 
import Home from './pages/Home'; 
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Docs from './pages/Docs';

function App() {
  const location = useLocation();
  
  const hideNavbarPaths = ['/', '/pricing', '/login', '/signup'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      
      {shouldShowNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/docs" 
          element={
            <ProtectedRoute>
              <Docs />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={
          <div className="p-10 text-center bg-[#FDFAF4] min-h-screen font-sans">
            <h1 className="font-serif text-4xl mb-4 text-[#0E0B06]">404 - ไม่พบหน้านี้จ้า</h1>
            <a href="/" className="text-[#C8922A] font-bold underline">กลับไปหน้าแรก</a>
          </div>
        } />
      </Routes>
    </>
  );
}

export default App;