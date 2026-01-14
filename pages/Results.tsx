
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import PdfExportButton from '../components/PdfExportButton';

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const result = storage.getById(id || '');

  if (!result) {
    return (
      <div className="text-center py-5">
        <h2>Result not found</h2>
        <Link to="/" className="btn btn-primary mt-3">Go Home</Link>
      </div>
    );
  }

  const getDecisionColor = (decision: string) => {
    if (decision === 'Strong Candidate') return 'success';
    if (decision === 'Moderate Fit') return 'warning';
    return 'danger';
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Analysis Result</h2>
          <p className="text-muted mb-0">Analyzed on {new Date(result.created_at).toLocaleDateString()}</p>
        </div>
        <PdfExportButton result={result} />
      </div>

      <div className="row g-4">
        {/* Score Card */}
        <div className="col-lg-4">
          <div className="card text-center p-4 mb-4 h-100">
            <h4 className="text-muted mb-4">Overall Match</h4>
            <div className="position-relative d-inline-block mx-auto mb-4" style={{ width: 150, height: 150 }}>
              <svg viewBox="0 0 36 36" className="w-100 h-100">
                <path
                  className="text-light"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`text-${getDecisionColor(result.decision)}`}
                  strokeWidth="3"
                  strokeDasharray={`${result.overall_score}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="position-absolute top-50 start-50 translate-middle">
                <span className="h1 fw-bold mb-0">{result.overall_score}%</span>
              </div>
            </div>
            <div className={`badge bg-${getDecisionColor(result.decision)} fs-6 py-2 px-3 mb-3`}>
              {result.decision}
            </div>
            <hr />
            <div className="text-start">
              <div className="mb-2">
                <div className="d-flex justify-content-between small mb-1">
                  <span>TF-IDF Similarity (50%)</span>
                  <span>{result.sub_scores.tfidf}%</span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <div className="progress-bar bg-primary" style={{ width: `${result.sub_scores.tfidf}%` }}></div>
                </div>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Skills Coverage (30%)</span>
                  <span>{result.sub_scores.skills}%</span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <div className="progress-bar bg-info" style={{ width: `${result.sub_scores.skills}%` }}></div>
                </div>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Experience Alignment (10%)</span>
                  <span>{result.sub_scores.experience}%</span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <div className="progress-bar bg-warning" style={{ width: `${result.sub_scores.experience}%` }}></div>
                </div>
              </div>
              <div className="mb-0">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Education Match (10%)</span>
                  <span>{result.sub_scores.education}%</span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <div className="progress-bar bg-secondary" style={{ width: `${result.sub_scores.education}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Column */}
        <div className="col-lg-8">
          {/* HR Summary */}
          <div className="card p-4 mb-4">
            <h4 className="mb-3">🤖 HR Summary</h4>
            <p className="card-text text-secondary" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {result.hr_summary}
            </p>
          </div>

          {/* Skills Breakdown */}
          <div className="card p-4 mb-4">
            <h4 className="mb-3">🛠 Skills & Keywords</h4>
            <div className="row">
              <div className="col-md-6 mb-3">
                <h6 className="text-success mb-2 fw-bold">Matched Skills</h6>
                <div className="d-flex flex-wrap gap-2">
                  {result.extracted.cv.skills.filter(s => result.extracted.jd.skills.includes(s)).map(s => (
                    <span key={s} className="badge bg-success-subtle text-success border border-success">{s}</span>
                  ))}
                  {result.extracted.cv.skills.filter(s => result.extracted.jd.skills.includes(s)).length === 0 && (
                    <span className="text-muted small">No direct skill matches found.</span>
                  )}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-danger mb-2 fw-bold">Missing from CV</h6>
                <div className="d-flex flex-wrap gap-2">
                  {result.missing_skills.map(s => (
                    <span key={s} className="badge bg-danger-subtle text-danger border border-danger">{s}</span>
                  ))}
                  {result.missing_skills.length === 0 && <span className="text-muted small">All JD skills present!</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Panel */}
          <div className="accordion" id="explanationAccordion">
            <div className="accordion-item card border-0 overflow-hidden">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                  Why this score? (Detailed Explanation)
                </button>
              </h2>
              <div id="collapseOne" className="accordion-collapse collapse" data-bs-parent="#explanationAccordion">
                <div className="accordion-body bg-light-subtle">
                  <p className="small mb-3">{result.explanation.notes}</p>
                  <h6 className="small fw-bold">Top Overlapping Terms (TF-IDF):</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {result.explanation.top_matched_terms.map(term => (
                      <span key={term} className="badge bg-light text-dark border">{term}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
