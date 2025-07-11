import { Store, schema } from 'modelence/server';

export const dbPapers = new Store('papers', {
  /**
   * Schema for research papers fetched from the arXiv API.
   */
  schema: {
    // The paper's title from the <title> field.
    title: schema.string(),
    
    // List of author names from <author><name>.
    authors: schema.array(schema.string()),
    
    // The full paper abstract from <summary>.
    abstract: schema.string(),
    
    // The unique arXiv ID extracted from the <id> URL (e.g., "1909.03550v1").
    arxivId: schema.string(),
    
    // The canonical abstract page link (from <link rel="alternate">).
    arxivUrl: schema.string(),
    
    // The direct PDF download link (from <link title="pdf">).
    pdfUrl: schema.string(),
    
    // All <category term="..."> values, such as "cs.LG".
    categories: schema.array(schema.string()),
    
    // The published date from <published>.
    publishedAt: schema.date(),
    
    // A simplified summary generated using an LLM.
    simplifiedAbstract: schema.string().optional(),
    
    // Vector embedding of the abstract, used for semantic similarity search.
    embedding: schema.array(schema.number()).optional(),
    
    // The conference the paper was published in, if available.
    conference: schema.string().optional(),
  },

  /**
   * Indexes to optimize query performance.
   */
  indexes: [
    // Index on arxivId for fast lookups.
    { key: { arxivId: 1 }, unique: true },
    
    // Index on categories for filtering by topic.
    { key: { categories: 1 } },

    // Index on publishedAt for sorting by date.
    { key: { publishedAt: -1 } },

    // Add a text index for searching
    { key: { title: 'text', abstract: 'text' } },
  ],
});

export const dbSavedPapers = new Store('savedPapers', {
  schema: {
    userId: schema.userId(),
    paperId: schema.objectId(),
  },
  indexes: [
    { key: { userId: 1, paperId: 1 }, unique: true },
  ],
});

export const dbLists = new Store('lists', {
  schema: {
    userId: schema.userId(),
    name: schema.string(),
  },
  indexes: [
    { key: { userId: 1 } },
  ],
});

export const dbPaperLists = new Store('paperLists', {
  schema: {
    listId: schema.objectId(),
    paperId: schema.objectId(),
  },
  indexes: [
    { key: { listId: 1, paperId: 1 }, unique: true },
  ],
});
