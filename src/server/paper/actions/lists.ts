import { UserInfo, ObjectId } from 'modelence/server';
import { dbLists, dbPaperLists, dbPapers, dbSavedPapers } from '../db.js';
import { savePaper, unsavePaper } from './save.js';

export async function createList({ name }: { name: string }, user: UserInfo) {
  if (!user) {
    throw new Error('You must be logged in to create a list.');
  }

  const userId = new ObjectId(user.id);
  return await dbLists.insertOne({ userId, name });
}

export async function renameList({ listId, name }: { listId: string; name: string }, user: UserInfo) {
  if (!user) {
    throw new Error('You must be logged in to rename a list.');
  }

  const list = await dbLists.findById(listId);
  if (!list) {
    throw new Error('List not found.');
  }

  if (list.userId.toString() !== user.id) {
    throw new Error('You do not have permission to rename this list.');
  }

  return await dbLists.updateOne({ _id: list._id }, { $set: { name } });
}

export async function deleteList({ listId }: { listId: string }, user: UserInfo) {
  if (!user) {
    throw new Error('You must be logged in to delete a list.');
  }

  const list = await dbLists.findById(listId);
  if (!list) {
    throw new Error('List not found.');
  }

  if (list.userId.toString() !== user.id) {
    throw new Error('You do not have permission to delete this list.');
  }

  await dbPaperLists.deleteMany({ listId: list._id });
  return await dbLists.deleteOne({ _id: list._id });
}

export async function addPaperToList({ listId, paperId }: { listId: string; paperId: string }, user: UserInfo) {
  if (!user) {
    throw new Error('You must be logged in to add a paper to a list.');
  }

  const list = await dbLists.findById(listId);
  if (!list) {
    throw new Error('List not found.');
  }

  if (list.userId.toString() !== user.id) {
    throw new Error('You do not have permission to add a paper to this list.');
  }

  const paper = await dbPapers.findById(paperId);
  if (!paper) {
    throw new Error('Paper not found.');
  }

  await savePaper({ paperId }, user);

  return await dbPaperLists.upsertOne(
    { listId: list._id, paperId: paper._id },
    { $set: { listId: list._id, paperId: paper._id } }
  );
}

export async function removePaperFromList({ listId, paperId }: { listId: string; paperId: string }, user: UserInfo) {
  if (!user) {
    throw new Error('You must be logged in to remove a paper from a list.');
  }

  const list = await dbLists.findById(listId);
  if (!list) {
    throw new Error('List not found.');
  }

  if (list.userId.toString() !== user.id) {
    throw new Error('You do not have permission to remove a paper from this list.');
  }

  const paper = await dbPapers.findById(paperId);
  if (!paper) {
    throw new Error('Paper not found.');
  }

  const result = await dbPaperLists.deleteOne({ listId: list._id, paperId: paper._id });

  const otherLists = await dbPaperLists.fetch({ paperId: paper._id });
  if (otherLists.length === 0) {
    await unsavePaper({ paperId }, user);
  }

  return result;
}

export async function getLists(user: UserInfo) {
  if (!user) {
    throw new Error('You must be logged in to view your lists.');
  }

  const userId = new ObjectId(user.id);
  return await dbLists.fetch({ userId });
}

export async function getList({ listId }: { listId: string }, user: UserInfo) {
  if (!user) {
    throw new Error('You must be logged in to view a list.');
  }

  const list = await dbLists.findById(listId);
  if (!list) {
    throw new Error('List not found.');
  }

  if (list.userId.toString() !== user.id) {
    throw new Error('You do not have permission to view this list.');
  }

  const paperListItems = await dbPaperLists.fetch({ listId: list._id });
  const paperIds = paperListItems.map((pl: any) => pl.paperId);
  const papers = await dbPapers.fetch({ _id: { $in: paperIds } });

  return { ...list, papers };
}
