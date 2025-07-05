import { dbPapers } from '../db';
import natural from 'natural';

interface ListPapersParams {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'publishedAt' | 'relevance';
}

/**
 * Fetches a paginated and filtered list of papers from the database.
 *
 * @param {ListPapersParams} params - The query parameters.
 * @returns {Promise<{papers: Array<any>, total: number}>} - A list of papers and the total count.
 */
export async function listPapers({
  limit = 20,
  offset = 0,
  search,
  sortBy = 'publishedAt',
}: ListPapersParams) {
  const query: any = {};

  // Add search filter for title or abstract if provided
  if (search) {
    const searchRegex = { $regex: search, $options: 'i' }; // Case-insensitive search
    query.$or = [
      { title: searchRegex },
      { abstract: searchRegex },
    ];
  }

  try {
    // Fetch all matching papers
    const allMatchingPapers = await dbPapers.fetch(query);
    const total = allMatchingPapers.length;

    let sortedPapers: any[] = allMatchingPapers;

    if (sortBy === 'relevance' && search) {
      const tfidf = new natural.TfIdf();
      allMatchingPapers.forEach(paper => tfidf.addDocument(paper.abstract));

      const paperScores = allMatchingPapers.map((paper, index) => {
        let score = 0;
        const terms = new natural.WordTokenizer().tokenize(search.toLowerCase());
        if (terms) {
          tfidf.tfidfs(terms, (i, measure) => {
            if (i === index) {
              score = measure;
            }
          });
        }
        return { ...paper, score };
      });

      sortedPapers = paperScores.sort((a, b) => b.score - a.score);
    } else {
      // Default sort by publishedAt
      sortedPapers.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    const paginatedPapers = sortedPapers.slice(offset, offset + limit);

    // Manually project the fields to return only the necessary data
    const papers = paginatedPapers.map(paper => ({
      title: paper.title,
      arxivId: paper.arxivId,
      publishedAt: paper.publishedAt,
      categories: paper.categories,
      authors: paper.authors,
      _id: paper._id, // include id for react keys
    }));

    return { papers, total };
  } catch (error) {
    console.error('Failed to list papers:', error);
    // Return an empty result in case of an error
    return { papers: [], total: 0 };
  }
}
