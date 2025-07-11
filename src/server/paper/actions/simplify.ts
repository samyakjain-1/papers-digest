import { dbPapers } from '../db.js';
import OpenAI from 'openai';

interface SimplifyAbstractParams {
  arxivId: string;
}

/**
 * Simplifies the abstract of a paper using an LLM and saves it to the database.
 *
 * @param {SimplifyAbstractParams} params - The parameters containing the arxivId.
 * @returns {Promise<{arxivId: string, abstract: string, simplifiedAbstract: string} | null>} - The result or null if not found.
 */
export async function simplifyAbstract({ arxivId }: SimplifyAbstractParams) {
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

    // 2. Use the OpenAI API to generate a simplified summary
    const prompt = `You are a friendly science communicator. Your job is to explain the abstract of a research paper in a way that anyone can understand — even those without a technical background.

                    Simplify the following abstract by:

                    - Explaining the main idea in clear, simple language.

                    - Avoiding technical jargon, or briefly explaining it if necessary.

                    - Using everyday analogies or examples to clarify complex ideas.

                    - Highlighting what the research does and why it matters.

                    Abstract:
                    ${paper.abstract}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    const simplifiedAbstract = response.choices[0].message.content || '';

    // 3. Save the generated summary to the simplifiedAbstract field
    await dbPapers.updateOne(
      { _id: paper._id },
      { $set: { simplifiedAbstract: simplifiedAbstract } }
    );

    console.log(`Successfully simplified abstract for paper: ${paper.title}`);

    // 4. Return the required fields
    return {
      arxivId: paper.arxivId,
      abstract: paper.abstract,
      simplifiedAbstract: simplifiedAbstract || '',
    };

  } catch (error) {
    console.error(`Failed to simplify abstract for arxivId "${arxivId}":`, error);
    return null;
  }
}
