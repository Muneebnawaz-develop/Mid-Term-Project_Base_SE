
export type DecisionType = "Strong Candidate" | "Moderate Fit" | "Not Fit";

export interface ExtractedData {
  skills: string[];
  experience: {
    years: number | null;
    keywords: string[];
  };
  education: string[];
  certifications: string[];
}

export interface AnalysisResult {
  id: string;
  created_at: string;
  cv_filename: string;
  jd_filename: string;
  overall_score: number;
  sub_scores: {
    tfidf: number;
    skills: number;
    experience: number;
    education: number;
  };
  decision: DecisionType;
  extracted: {
    cv: ExtractedData;
    jd: ExtractedData;
  };
  missing_skills: string[];
  explanation: {
    weights: {
      tfidf: number;
      skills: number;
      experience: number;
      education: number;
    };
    top_matched_terms: string[];
    notes: string;
  };
  hr_summary: string;
}
