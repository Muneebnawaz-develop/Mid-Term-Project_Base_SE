
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold text-primary" to="/">
          <span className="fs-3 me-2">🤝</span> MatchAI
        </Link>
        <div className="navbar-nav ms-auto">
          <Link 
            className={`nav-link px-3 ${location.pathname === '/' ? 'active' : ''}`} 
            to="/"
          >
            Analyze
          </Link>
          <Link 
            className={`nav-link px-3 ${location.pathname === '/history' ? 'active' : ''}`} 
            to="/history"
          >
            History
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
