
export function computeCosineSimilarity(tokens1: string[], tokens2: string[]): { score: number, topTerms: string[] } {
  const allTokens = Array.from(new Set([...tokens1, ...tokens2]));
  
  const getFreqMap = (tokens: string[]) => {
    const map: Record<string, number> = {};
    tokens.forEach(t => map[t] = (map[t] || 0) + 1);
    return map;
  };

  const freq1 = getFreqMap(tokens1);
  const freq2 = getFreqMap(tokens2);

  // For TF-IDF in this 2-doc context:
  // IDF(t) = log(Total Docs / Docs containing t)
  // Since we only have 2 docs, IDF is either log(2/1) or log(2/2)=0
  // Simplified: we just use overlap weighting for better CV-JD context
  
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  const overlappingTerms: { term: string, score: number }[] = [];

  allTokens.forEach(token => {
    const val1 = freq1[token] || 0;
    const val2 = freq2[token] || 0;
    
    dotProduct += val1 * val2;
    mag1 += val1 * val1;
    mag2 += val2 * val2;

    if (val1 > 0 && val2 > 0) {
      overlappingTerms.push({ term: token, score: val1 * val2 });
    }
  });

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  const score = magnitude === 0 ? 0 : dotProduct / magnitude;

  const topTerms = overlappingTerms
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(t => t.term);

  return { score, topTerms };
}
