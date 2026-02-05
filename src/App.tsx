
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Apply from './pages/Apply';
import Admin from './pages/Admin';
import SocialCallback from './pages/SocialCallback';
import PaymentCallback from './pages/PaymentCallback';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import PaymentTest from './pages/PaymentTest';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/callback" element={<SocialCallback onLoginSuccess={setUser} />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/payment-test" element={<PaymentTest />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
