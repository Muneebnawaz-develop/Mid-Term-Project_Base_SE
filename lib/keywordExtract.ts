
import { ExtractedData } from '../types';

const SKILLS_DICT = [
  'python', 'java', 'javascript', 'typescript', 'react', 'node', 'express', 'flask', 'django', 'sql', 'mysql', 'postgres', 'mongodb',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'linux', 'rest', 'api', 'html', 'css', 'bootstrap', 'tailwind', 'ml', 'nlp', 
  'tensorflow', 'pytorch', 'c++', 'c#', 'ruby', 'go', 'php', 'swift', 'kotlin', 'flutter', 'dart', 'angular', 'vue', 'redux', 'graphql',
  'jenkins', 'terraform', 'ansible', 'jira', 'agile', 'scrum', 'devops', 'machine learning', 'deep learning', 'data science',
  'excel', 'word', 'management', 'leadership', 'communication', 'problem solving', 'teamwork', 'project management'
];

const EDU_KEYWORDS = ['bs', 'bsc', 'ms', 'msc', 'phd', 'bachelor', 'master', 'university', 'college', 'degree', 'diploma', 'school'];
const EXP_KEYWORDS = ['experience', 'worked', 'internship', 'project', 'role', 'senior', 'junior', 'lead', 'manager', 'professional', 'year', 'yr'];
const CERT_KEYWORDS = ['aws certified', 'azure', 'ccna', 'pmp', 'itil', 'comptia', 'cissp', 'certified', 'certification'];

export function extractKeywords(text: string): ExtractedData {
  const lowerText = text.toLowerCase();
  
  // Extract Skills
  const skills = SKILLS_DICT.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lowerText);
  });

  // Extract Years of Experience
  const yearPattern = /(\d+)\+?\s*(years|yrs|year|yr)/i;
  const yearMatch = lowerText.match(yearPattern);
  const years = yearMatch ? parseInt(yearMatch[1], 10) : null;

  const expKeywords = EXP_KEYWORDS.filter(kw => lowerText.includes(kw));
  const education = EDU_KEYWORDS.filter(kw => lowerText.includes(kw));
  const certifications = CERT_KEYWORDS.filter(kw => lowerText.includes(kw));

  return {
    skills,
    experience: {
      years,
      keywords: expKeywords
    },
    education,
    certifications
  };
}
