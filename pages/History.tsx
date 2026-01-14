
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { AnalysisResult } from '../types';

const History: React.FC = () => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    setHistory(storage.getAll());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this record?')) {
      storage.delete(id);
      setHistory(storage.getAll());
    }
  };

  const getDecisionBadge = (decision: string) => {
    let color = 'secondary';
    if (decision === 'Strong Candidate') color = 'success';
    if (decision === 'Moderate Fit') color = 'warning';
    if (decision === 'Not Fit') color = 'danger';
    return <span className={`badge bg-${color}`}>{decision}</span>;
  };

  return (
    <div>
      <h2 className="mb-4">Analysis History</h2>
      
      {history.length === 0 ? (
        <div className="card p-5 text-center">
          <p className="text-muted">No history found. Start by analyzing a CV!</p>
          <Link to="/" className="btn btn-primary d-inline-block mx-auto">Analyze Now</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Candidate CV</th>
                  <th>Job Description</th>
                  <th>Score</th>
                  <th>Decision</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td className="align-middle small">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="align-middle fw-semibold">{item.cv_filename}</td>
                    <td className="align-middle text-muted small">{item.jd_filename}</td>
                    <td className="align-middle">
                      <span className="fw-bold">{item.overall_score}%</span>
                    </td>
                    <td className="align-middle">{getDecisionBadge(item.decision)}</td>
                    <td className="align-middle text-end">
                      <Link to={`/results/${item.id}`} className="btn btn-sm btn-outline-primary me-2">View</Link>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
