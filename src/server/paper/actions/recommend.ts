import { dbPapers, dbSavedPapers } from '../db.js';
import { UserInfo } from 'modelence/server';
import { ObjectId } from 'mongodb';

function cosineSimilarity(vecA: number[], vecB: number[]) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    aMagnitude += vecA[i] * vecA[i];
    bMagnitude += vecB[i] * vecB[i];
  }

  aMagnitude = Math.sqrt(aMagnitude);
  bMagnitude = Math.sqrt(bMagnitude);

  if (aMagnitude === 0 || bMagnitude === 0) {
    return 0;
  }

  return dotProduct / (aMagnitude * bMagnitude);
}

export async function getRecommendedPapers(user: UserInfo) {
  if (!user) {
    return [];
  }

  const savedPaperRecords = await dbSavedPapers.fetch({
    userId: new ObjectId(user.id),
  });

  if (savedPaperRecords.length === 0) {
    return [];
  }

  const savedPaperIds = savedPaperRecords.map(record => record.paperId);

  const savedPapers = await dbPapers.fetch({
    _id: { $in: savedPaperIds },
    embedding: { $exists: true },
  });

  if (savedPapers.length === 0 || !savedPapers[0].embedding) {
    return [];
  }

  const embeddingLength = savedPapers[0].embedding.length;
  const tasteVector = new Array(embeddingLength).fill(0);

  for (const paper of savedPapers) {
    if (paper.embedding) {
      for (let i = 0; i < embeddingLength; i++) {
        tasteVector[i] += paper.embedding[i];
      }
    }
  }

  for (let i = 0; i < embeddingLength; i++) {
    tasteVector[i] /= savedPapers.length;
  }

  const otherPapers = await dbPapers.fetch({
    _id: { $nin: savedPaperIds },
    embedding: { $exists: true },
  });

  const recommendations = otherPapers
    .filter(paper => paper.embedding)
    .map(paper => {
      const similarity = cosineSimilarity(tasteVector, paper.embedding!);
      return { ...paper, similarity };
    });

  const sortedRecommendations = recommendations.sort((a, b) => b.similarity - a.similarity);

  return sortedRecommendations.slice(0, 10);
}
