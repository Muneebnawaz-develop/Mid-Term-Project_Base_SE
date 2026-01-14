
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractPdfText } from '../lib/extractPdfText';
import { extractDocxText } from '../lib/extractDocxText';
import { calculateMatch } from '../lib/scoring';
import { storage } from '../lib/storage';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'jd') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    if (type === 'cv') setCvFile(file);
    else {
      setJdFile(file);
      setJdText(''); // Clear text if file is uploaded
    }
    setError('');
  };

  const getFileText = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    console.log(`Extracting text from ${file.name} (type: ${ext})`);
    try {
      if (ext === 'pdf') return await extractPdfText(file);
      if (ext === 'docx') return await extractDocxText(file);
      if (ext === 'txt') {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read text file'));
          reader.readAsText(file);
        });
      }
      throw new Error('Unsupported file type. Use PDF, DOCX or TXT.');
    } catch (err) {
      console.error('Extraction Error:', err);
      throw new Error(`Failed to extract text from ${file.name}. Ensure the file is not corrupted.`);
    }
  };

  const loadSampleData = () => {
    const sampleCV = "John Doe. Senior Software Engineer with 8 years of experience in Python, React, and AWS. BS in Computer Science from Stanford. Certified AWS Solutions Architect.";
    const sampleJD = "We are looking for a Senior Full Stack Developer. Requirements: 5+ years experience. Skills: Python, React, TypeScript, Docker, Kubernetes. Education: BS in Computer Science or equivalent.";
    
    setCvFile(new File([sampleCV], "sample_cv.txt", { type: "text/plain" }));
    setJdText(sampleJD);
    setJdFile(null);
    setError('');
    console.log("Sample data loaded");
  };

  const handleAnalyze = async () => {
    if (!cvFile || (!jdFile && !jdText.trim())) {
      setError('Please provide both a Candidate CV and a Job Description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log("Analysis started...");
      
      const cvText = await getFileText(cvFile);
      console.log("CV text extracted length:", cvText.length);

      let finalJdText = jdText;
      let jdFileName = 'Pasted Text';

      if (jdFile) {
        finalJdText = await getFileText(jdFile);
        jdFileName = jdFile.name;
      }
      console.log("JD text extracted length:", finalJdText.length);

      if (cvText.trim().length < 10) {
        throw new Error('The CV text extracted is too short. Is the file empty or an image?');
      }
      if (finalJdText.trim().length < 10) {
        throw new Error('The Job Description text is too short.');
      }

      console.log("Calculating match score...");
      const result = calculateMatch(cvText, finalJdText, cvFile.name, jdFileName);
      
      console.log("Saving result to storage...");
      storage.save(result);
      
      console.log("Navigating to results...");
      navigate(`/results/${result.id}`);
    } catch (err: any) {
      console.error("Match Process Error:", err);
      setError(err.message || 'An unexpected error occurred during analysis.');
      alert(`Process Failed: ${err.message || 'Check console for details'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">🤝 MatchAI</h1>
        <p className="lead text-muted">Intelligent CV-JD Comparison for Modern HR Teams</p>
        <button className="btn btn-link text-decoration-none" onClick={loadSampleData}>
          Load Sample Data
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4 shadow-sm" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card h-100 p-4 border-primary bg-white">
            <div className="d-flex align-items-center mb-3">
              <span className="fs-3 me-2">📄</span>
              <h3 className="h5 mb-0">Candidate CV</h3>
            </div>
            <p className="small text-muted mb-4">PDF, DOCX, or TXT (Max 10MB)</p>
            <div className="mb-3">
              <input 
                type="file" 
                className="form-control" 
                accept=".pdf,.docx,.txt"
                onChange={(e) => handleFileChange(e, 'cv')}
              />
            </div>
            {cvFile && (
              <div className="mt-2 p-2 bg-success-subtle text-success rounded border border-success-subtle d-flex justify-content-between align-items-center">
                <span className="small text-truncate me-2 fw-semibold">✓ {cvFile.name}</span>
                <button className="btn-close small" onClick={() => setCvFile(null)} style={{ fontSize: '0.6rem' }}></button>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 p-4 border-primary bg-white">
            <div className="d-flex align-items-center mb-3">
              <span className="fs-3 me-2">💼</span>
              <h3 className="h5 mb-0">Job Description</h3>
            </div>
            <p className="small text-muted mb-3">Upload file or paste requirements</p>
            <input 
              type="file" 
              className="form-control mb-3" 
              accept=".pdf,.docx,.txt"
              onChange={(e) => handleFileChange(e, 'jd')}
              disabled={!!jdText}
            />
            <div className="position-relative">
              <textarea 
                className="form-control" 
                rows={4} 
                placeholder="Or paste JD requirements here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                disabled={!!jdFile}
              ></textarea>
              {jdText && !jdFile && (
                 <button className="btn-close position-absolute top-0 end-0 m-2" onClick={() => setJdText('')} style={{ fontSize: '0.6rem' }}></button>
              )}
            </div>
            {jdFile && (
              <div className="mt-2 p-2 bg-success-subtle text-success rounded border border-success-subtle d-flex justify-content-between align-items-center">
                <span className="small text-truncate me-2 fw-semibold">✓ {jdFile.name}</span>
                <button className="btn-close small" onClick={() => setJdFile(null)} style={{ fontSize: '0.6rem' }}></button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <button 
          className="btn btn-primary btn-lg px-5 shadow" 
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-3"></span>
              Analyzing Profiles...
            </>
          ) : 'Run Match Analysis'}
        </button>
        <p className="mt-3 text-muted small">Analysis is performed entirely on your device.</p>
      </div>
    </div>
  );
};

export default Home;
