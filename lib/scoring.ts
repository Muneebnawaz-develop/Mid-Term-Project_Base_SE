
import { AnalysisResult, DecisionType, ExtractedData } from '../types';
import { preprocessText } from './preprocess';
import { extractKeywords } from './keywordExtract';
import { computeCosineSimilarity } from './tfidf';

export function calculateMatch(cvText: string, jdText: string, cvFileName: string, jdFileName: string): AnalysisResult {
  const cvPrep = preprocessText(cvText);
  const jdPrep = preprocessText(jdText);

  const cvExtracted = extractKeywords(cvText);
  const jdExtracted = extractKeywords(jdText);

  // 1. TF-IDF Cosine Similarity (50%)
  const { score: tfidfScore, topTerms } = computeCosineSimilarity(cvPrep.tokens, jdPrep.tokens);

  // 2. Skills Match (30%)
  const jdSkills = jdExtracted.skills;
  const matchedSkills = jdSkills.filter(s => cvExtracted.skills.includes(s));
  const skillsScore = jdSkills.length > 0 ? (matchedSkills.length / jdSkills.length) : (cvExtracted.skills.length > 0 ? 0.5 : 0);
  const missingSkills = jdSkills.filter(s => !cvExtracted.skills.includes(s));

  // 3. Experience Match (10%)
  let expScore = 0;
  if (jdExtracted.experience.years !== null && cvExtracted.experience.years !== null) {
    expScore = cvExtracted.experience.years >= jdExtracted.experience.years ? 1 : (cvExtracted.experience.years / jdExtracted.experience.years);
  } else {
    // Keyword overlap fallback
    const matchedExp = jdExtracted.experience.keywords.filter(k => cvExtracted.experience.keywords.includes(k));
    expScore = jdExtracted.experience.keywords.length > 0 ? matchedExp.length / jdExtracted.experience.keywords.length : 0.5;
  }

  // 4. Education Match (10%)
  const matchedEdu = jdExtracted.education.filter(e => cvExtracted.education.includes(e));
  const eduScore = jdExtracted.education.length > 0 ? matchedEdu.length / jdExtracted.education.length : 0.8;

  // Weighted Score
  const weights = { tfidf: 0.5, skills: 0.3, experience: 0.1, education: 0.1 };
  const overall = (
    (tfidfScore * weights.tfidf) +
    (skillsScore * weights.skills) +
    (expScore * weights.experience) +
    (eduScore * weights.education)
  ) * 100;

  let decision: DecisionType = "Not Fit";
  if (overall >= 70) decision = "Strong Candidate";
  else if (overall >= 40) decision = "Moderate Fit";

  // HR Summary Generation
  const hrSummary = generateSummary(overall, matchedSkills, missingSkills, cvExtracted, jdExtracted, decision);

  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    cv_filename: cvFileName,
    jd_filename: jdFileName,
    overall_score: Math.round(overall),
    sub_scores: {
      tfidf: Math.round(tfidfScore * 100),
      skills: Math.round(skillsScore * 100),
      experience: Math.round(expScore * 100),
      education: Math.round(eduScore * 100)
    },
    decision,
    extracted: {
      cv: cvExtracted,
      jd: jdExtracted
    },
    missing_skills: missingSkills,
    explanation: {
      weights,
      top_matched_terms: topTerms,
      notes: `Weighted match based on semantic similarity (${weights.tfidf * 100}%), specific skill overlap (${weights.skills * 100}%), experience alignment (${weights.experience * 100}%), and education (${weights.education * 100}%).`
    },
    hr_summary: hrSummary
  };
}

function generateSummary(
  score: number, 
  matched: string[], 
  missing: string[], 
  cv: ExtractedData, 
  jd: ExtractedData, 
  decision: string
): string {
  const strengths = matched.length > 0 ? `The candidate shows strong proficiency in key areas like ${matched.slice(0, 3).join(', ')}.` : "The candidate's core technical stack matches basic requirements.";
  const gaps = missing.length > 0 ? `However, there are noticeable gaps in ${missing.slice(0, 3).join(', ')}.` : "No major technical skill gaps were identified.";
  const expMatch = cv.experience.years && jd.experience.years 
    ? `The candidate has ${cv.experience.years} years of experience vs the required ${jd.experience.years}.` 
    : "Experience levels appear generally aligned with the role.";
  
  return `Evaluation Result: ${decision}. 
${strengths}
${gaps}
${expMatch}
Recommendation: ${score >= 70 ? "Proceed to technical interview immediately." : (score >= 40 ? "Consider for a screening call to clarify gaps." : "Does not meet minimum requirements for this specific role.")}`;
}
