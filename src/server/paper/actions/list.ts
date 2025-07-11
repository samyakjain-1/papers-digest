import { dbPapers, dbSavedPapers } from '../db.js';
import { UserInfo } from 'modelence/server';
import { ObjectId } from 'mongodb';

interface ListPapersParams {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'publishedAt' | 'relevance';
  conference?: string;
}

/**
 * Fetches a paginated and filtered list of papers from the database.
 *
 * @param {ListPapersParams} params - The query parameters.
 * @returns {Promise<{papers: Array<any>, total: number}>} - A list of papers and the total count.
 */
export async function listPapers(
  {
    limit = 20,
    offset = 0,
    search,
    sortBy = 'publishedAt',
    conference,
  }: ListPapersParams,
  user: UserInfo | null
) {
  const query: any = {};

  // Use text search if a search query is provided
  if (search) {
    query.$text = { $search: search };
  }

  if (conference) {
    query.conference = conference;
  }

  try {
    const sort: any = {};
    if (sortBy === 'relevance' && search) {
      sort.score = { $meta: 'textScore' };
    } else {
      sort.publishedAt = -1;
    }

    const total = await dbPapers.countDocuments(query);
    const paginatedPapers = await dbPapers.fetch(query, {
      sort,
      skip: offset,
      limit,
    });

    const savedPapers = user ? await dbSavedPapers.fetch({ userId: new ObjectId(user.id) }) : [];
    const savedPaperIds = new Set(savedPapers.map((p: any) => p.paperId.toString()));

    const papers = paginatedPapers.map((paper: any) => ({
      title: paper.title,
      arxivId: paper.arxivId,
      publishedAt: paper.publishedAt,
      categories: paper.categories,
      authors: paper.authors,
      _id: paper._id,
      isSaved: savedPaperIds.has(paper._id.toString()),
      conference: paper.conference,
    }));

    return { papers, total };
  } catch (error) {
    console.error('Failed to list papers:', error);
    // Return an empty result in case of an error
    return { papers: [], total: 0 };
  }
}
