import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { dbPapers } from '../db.js';

const ARXIV_API_URL = 'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL&start=0&max_results=2000&sortBy=submittedDate&sortOrder=descending';

/**
 * Fetches the latest AI/ML papers from the arXiv API, parses them,
 * and inserts them into the database.
 *
 * This function is safe to run multiple times, as it uses upsert
 * to avoid creating duplicate entries based on the arxivId.
 */
export async function fetchAndInsertPapers() {
  console.log('Starting to fetch papers from arXiv...');

  try {
    // 1. Fetch the XML data from the arXiv API
    const response = await axios.get(ARXIV_API_URL);
    const xmlData = response.data;

    // 2. Parse the XML response
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });
    const parsedData = parser.parse(xmlData);
    const entries = parsedData?.feed?.entry;

    if (!entries || !Array.isArray(entries)) {
      console.warn('No paper entries found in the arXiv API response.');
      return;
    }

    console.log(`Found ${entries.length} papers to process.`);
    let processedCount = 0;
    const totalPapers = entries.length;

    // 3. Process and insert each paper
    for (const entry of entries) {
      try {
        // Helper to ensure authors and categories are always arrays
        const ensureArray = (item: any) => {
          if (!item) return [];
          return Array.isArray(item) ? item : [item];
        };

        const authors = ensureArray(entry.author).map((a: any) => a.name);
        const categories = ensureArray(entry.category).map((c: any) => c.term);

        // Extract the arXiv ID from the URL (e.g., "http://arxiv.org/abs/2103.12345v1" -> "2103.12345v1")
        const arxivId = entry.id.split('/abs/').pop();

        const paperData = {
          title: entry.title,
          authors,
          abstract: entry.summary.trim(),
          arxivId,
          arxivUrl: entry.link.find((l: any) => l.rel === 'alternate')?.href,
          pdfUrl: entry.link.find((l: any) => l.title === 'pdf')?.href,
          categories,
          publishedAt: new Date(entry.published),
        };

        // 4. Manually perform an upsert operation.
        const existingPaper = await dbPapers.findOne({ arxivId: paperData.arxivId });

        if (existingPaper) {
          // If paper exists, update it.
          await dbPapers.updateOne({ _id: existingPaper._id }, { $set: paperData });
        } else {
          // If paper does not exist, insert it.
          await dbPapers.insertOne(paperData);
        }

        processedCount++;
        if (processedCount % 100 === 0) {
          console.log(`${processedCount}/${totalPapers} papers processed...`);
        }

      } catch (paperError) {
        console.error(`Failed to process paper entry: ${entry.id}`, paperError);
      }
    }

    console.log('Finished fetching and inserting papers.');

  } catch (error) {
    console.error('An error occurred while fetching or processing papers:', error);
  }
}
