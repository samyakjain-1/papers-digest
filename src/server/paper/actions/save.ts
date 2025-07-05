import { dbSavedPapers, dbPapers } from '../db';
import { UserInfo, ObjectId } from 'modelence/server';

interface SavePaperParams {
  paperId: string;
}

export async function savePaper({ paperId }: SavePaperParams, user: UserInfo) {
  if (!user) {
    throw new Error('You must be logged in to save a paper.');
  }

  const paper = await dbPapers.findById(paperId);
  if (!paper) {
    throw new Error('Paper not found.');
  }

  const userId = new ObjectId(user.id);
  return await dbSavedPapers.upsertOne(
    { userId, paperId: paper._id },
    { $set: { userId, paperId: paper._id } }
  );
}

export async function unsavePaper({ paperId }: SavePaperParams, user: UserInfo) {
  if (!user) {
    throw new Error('You must be logged in to unsave a paper.');
  }

  const paper = await dbPapers.findById(paperId);
  if (!paper) {
    throw new Error('Paper not found.');
  }

  const userId = new ObjectId(user.id);
  return await dbSavedPapers.deleteOne({ userId, paperId: paper._id });
}
