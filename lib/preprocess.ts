
// A common English stopword list
export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'did', 'do', 'does', 'doing', 'don', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'here', 'how', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 's', 'same', 'she', 'should', 'so', 'some', 'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * A lightweight Porter-ish stemmer for English.
 * Simple rule-based approach for browser efficiency.
 */
export function stem(word: string): string {
  if (word.length < 3) return word;
  let stemmed = word.toLowerCase();
  if (stemmed.endsWith('ies') && !stemmed.endsWith('eies')) stemmed = stemmed.slice(0, -3) + 'i';
  else if (stemmed.endsWith('es')) stemmed = stemmed.slice(0, -2);
  else if (stemmed.endsWith('s') && !stemmed.endsWith('ss')) stemmed = stemmed.slice(0, -1);
  else if (stemmed.endsWith('ing')) stemmed = stemmed.slice(0, -3);
  else if (stemmed.endsWith('ed')) stemmed = stemmed.slice(0, -2);
  return stemmed;
}

export function preprocessText(text: string): { tokens: string[], cleaned: string } {
  // Lowercase & Remove punctuation/numbers (keep years like 2024)
  const clean = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove special chars
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();

  const words = clean.split(' ');
  const tokens = words
    .filter(w => w.length > 1 && !STOPWORDS.has(w))
    .map(w => stem(w));

  return {
    tokens,
    cleaned: tokens.join(' ')
  };
}
