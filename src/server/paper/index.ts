import { Module } from 'modelence/server';
import { dbPapers, dbSavedPapers } from './db.ts';
import { fetchAndInsertPapers } from './actions/fetch.js';
import { listPapers } from './actions/list.js';
import { simplifyAbstract } from './actions/simplify.js';
import { findSimilarPapers } from './actions/similar.js';
import { embedPaper, embedAllPapers } from './actions/embed.js';
import { savePaper, unsavePaper } from './actions/save.js';
import { getSavedPapers } from './actions/feed.js';
import { getRecommendedPapers } from './actions/recommend.js';
import { ObjectId } from 'mongodb';

/**
 * The Paper module encapsulates all backend functionality
 * related to research papers, including the data store,
 * queries, and mutations.
 */
export default new Module('paper', {
  // Include the dbPapers store so it will be automatically
  // provisioned in MongoDB when the server starts.
  stores: [dbPapers, dbSavedPapers],

  queries: {
    /**
     * A query to list papers with filtering, pagination, and searching.
     */
    async list(params, { user }) {
      return await listPapers(params, user || null);
    },
    /**
     * A query to get a single paper by its arxivId.
     */
    async getOne(params: any, { user }: any) {
      const { arxivId } = params || {};
      if (typeof arxivId !== 'string') {
        console.error('Invalid arxivId provided to getOne query.');
        return null;
      }
      const paper = await dbPapers.findOne({ arxivId });
      if (!paper) {
        return null;
      }

      let isSaved = false;
      if (user) {
        const savedPaper = await dbSavedPapers.findOne({
          userId: new ObjectId(user.id),
          paperId: paper._id,
        });
        isSaved = !!savedPaper;
      }

      return { ...paper, isSaved };
    },
    /**
     * A query to find similar papers using TF-IDF.
     */
    async similar(params: any) {
      const { arxivId } = params || {};
      if (typeof arxivId !== 'string') {
        console.error('Invalid arxivId provided to similar query.');
        return [];
      }
      return await findSimilarPapers({ arxivId });
    },

    async getSaved(_: any, { user }: any) {
      return await getSavedPapers(user);
    },

    async recommend(_: any, { user }: any) {
      return await getRecommendedPapers(user);
    }
  },
  mutations: {
    /**
     * A mutation to trigger the fetching and inserting of papers.
     * This can be called from the frontend to refresh the paper data.
     */
    async fetchAndInsert() {
      // We don't wait for this to complete, as it can be a long-running process.
      // The client will be notified of completion through other means if necessary.
      fetchAndInsertPapers();
      return { success: true, message: 'Paper fetching process started.' };
    },

    /**
     * A mutation to simplify the abstract of a paper.
     */
    async simplify(params: any) {
      const { arxivId } = params || {};
      if (typeof arxivId !== 'string') {
        // Or throw an error, depending on desired behavior
        console.error('Invalid arxivId provided to simplify mutation.');
        return null;
      }
      return await simplifyAbstract({ arxivId });
    },

    /**
     * A mutation to generate an embedding for a paper.
     */
    async embed(params: any) {
      const { arxivId } = params || {};
      if (typeof arxivId !== 'string') {
        console.error('Invalid arxivId provided to embed mutation.');
        return null;
      }
      return await embedPaper({ arxivId });
    },

    /**
     * A mutation to generate embeddings for all papers.
     */
    async embedAll() {
      embedAllPapers();
      return { success: true, message: 'Embedding process started for all papers.' };
    },

    async save(params: any, { user }: any) {
      const { paperId } = params || {};
      if (typeof paperId !== 'string') {
        throw new Error('Invalid paperId provided to save mutation.');
      }
      return await savePaper({ paperId }, user);
    },

    async unsave(params: any, { user }: any) {
      const { paperId } = params || {};
      if (typeof paperId !== 'string') {
        throw new Error('Invalid paperId provided to unsave mutation.');
      }
      return await unsavePaper({ paperId }, user);
    },
  },
});
