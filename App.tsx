
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Results from './pages/Results';
import History from './pages/History';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen d-flex flex-column">
        <Navbar />
        <main className="flex-grow-1 py-4">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/results/:id" element={<Results />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </div>
        </main>
        <footer className="py-3 bg-white border-top mt-auto">
          <div className="container text-center text-muted">
            <small>&copy; 2024 HR CV-JD Match Assistant. Privacy-first, local analysis.</small>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
