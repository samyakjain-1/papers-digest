import { dbPapers } from '../db.js';

interface FindSimilarPapersParams {
  arxivId: string;
}

/**
 * Finds papers with similar abstracts using vector search.
 *
 * @param {FindSimilarPapersParams} params - The parameters containing the arxivId.
 * @returns {Promise<Array<any>>} - A list of similar papers.
 */
export async function findSimilarPapers({ arxivId }: FindSimilarPapersParams) {
  try {
    const targetPaper = await dbPapers.findOne({ arxivId });
    if (!targetPaper) {
      console.error(`Paper with arxivId "${arxivId}" not found.`);
      return [];
    }

    if (!targetPaper.embedding) {
      console.error(`Paper with arxivId "${arxivId}" does not have an embedding.`);
      return [];
    }

    const similarPapersCursor = await dbPapers.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: targetPaper.embedding,
          numCandidates: 100,
          limit: 6, // 5 similar + the paper itself
        },
      },
      {
        $match: {
          arxivId: { $ne: arxivId }, // Exclude the paper itself
        },
      },
      {
        $project: {
          _id: 1,
          arxivId: 1,
          title: 1,
          authors: 1,
          publishedAt: 1,
          categories: 1,
          similarity: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    const similarPapers = await similarPapersCursor.toArray();
    return similarPapers;

  } catch (error) {
    console.error(`Failed to find similar papers for arxivId "${arxivId}":`, error);
    return [];
  }
}
