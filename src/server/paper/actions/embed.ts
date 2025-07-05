import { dbPapers } from '../db';
import OpenAI from 'openai';

interface EmbedPaperParams {
  arxivId: string;
}

/**
 * Generates a vector embedding for a paper's abstract and saves it to the database.
 *
 * @param {EmbedPaperParams} params - The parameters containing the arxivId.
 * @returns {Promise<{arxivId: string, embedding: number[]} | null>} - The result or null if not found.
 */
export async function embedPaper({ arxivId }: EmbedPaperParams) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // 1. Look up the paper by arxivId
    const paper = await dbPapers.findOne({ arxivId });

    if (!paper) {
      console.error(`Paper with arxivId "${arxivId}" not found.`);
      return null;
    }

    // 2. Use the OpenAI API to generate an embedding
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: paper.abstract,
    });
    const embedding = response.data[0].embedding;

    // 3. Save the generated embedding to the embedding field
    await dbPapers.updateOne(
      { _id: paper._id },
      { $set: { embedding } }
    );

    console.log(`Successfully generated embedding for paper: ${paper.title}`);

    // 4. Return the required fields
    return {
      arxivId: paper.arxivId,
      embedding,
    };

  } catch (error) {
    console.error(`Failed to generate embedding for arxivId "${arxivId}":`, error);
    return null;
  }
}

/**
 * Generates vector embeddings for all papers that don't have one yet.
 */
export async function embedAllPapers() {
  const papersToEmbed = await dbPapers.fetch({ embedding: { $exists: false } });
  console.log(`Found ${papersToEmbed.length} papers to embed.`);

  let count = 0;
  for (const paper of papersToEmbed) {
    await embedPaper({ arxivId: paper.arxivId });
    count++;
    if (count % 10 === 0) {
      console.log(`Embedded ${count}/${papersToEmbed.length} papers...`);
    }
  }

  console.log('Finished embedding all papers.');
  return { success: true, count: papersToEmbed.length };
}
