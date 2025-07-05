import { dbSavedPapers, dbPapers } from '../db';
import { UserInfo, ObjectId } from 'modelence/server';

export async function getSavedPapers(user: UserInfo) {
  if (!user) {
    return [];
  }

  const userId = new ObjectId(user.id);
  const savedPapers = await dbSavedPapers.fetch({ userId });
  const paperIds = savedPapers.map(p => p.paperId);

  return await dbPapers.fetch({ _id: { $in: paperIds } });
}
