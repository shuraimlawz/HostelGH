/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching and typo tolerance
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  const len1 = s1.length;
  const len2 = s2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  const matrix: number[][] = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[len2][len1];
}

/**
 * Calculate similarity score between two strings (0-1)
 * 1 = identical, 0 = completely different
 */
export function similarityScore(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  return 1 - distance / maxLength;
}

/**
 * Find best matches from an array of strings using fuzzy matching
 * Returns matches with similarity >= threshold
 */
export function fuzzyMatch(
  input: string,
  candidates: string[],
  threshold: number = 0.6
): Array<{ value: string; score: number }> {
  return candidates
    .map((candidate) => ({
      value: candidate,
      score: similarityScore(input, candidate),
    }))
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

/**
 * Find the best single match from an array of strings
 * Returns null if no matches meet the threshold
 */
export function findBestMatch(
  input: string,
  candidates: string[],
  threshold: number = 0.6
): { value: string; score: number } | null {
  const matches = fuzzyMatch(input, candidates, threshold);
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Check if a string contains any of the candidates with fuzzy matching
 * Useful for partial matching with typo tolerance
 */
export function fuzzyIncludes(
  input: string,
  candidates: string[],
  threshold: number = 0.7
): boolean {
  const inputLower = input.toLowerCase();
  return candidates.some((candidate) => {
    const candidateLower = candidate.toLowerCase();
    // Exact contains
    if (inputLower.includes(candidateLower) || candidateLower.includes(inputLower)) {
      return true;
    }
    // Fuzzy match
    return similarityScore(inputLower, candidateLower) >= threshold;
  });
}
