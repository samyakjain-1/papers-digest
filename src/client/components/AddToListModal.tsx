import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation } from '@modelence/react-query';
import { Check, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AddToListModalProps {
  paper: any;
  onClose: () => void;
}

export default function AddToListModal({ paper, onClose }: AddToListModalProps) {
  const queryClient = useQueryClient();
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: lists, refetch: refetchLists } = useQuery({
    ...modelenceQuery('paper.lists'),
  }) as { data: any[], refetch: any };

  const { mutate: addPaperToList } = useMutation({
    ...modelenceMutation('paper.addPaperToList'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelenceQuery('paper.getOne', { arxivId: paper.arxivId }).queryKey });
      toast.success('Paper added to list!');
    },
  });

  const { mutate: removePaperFromList } = useMutation({
    ...modelenceMutation('paper.removePaperFromList'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelenceQuery('paper.getOne', { arxivId: paper.arxivId }).queryKey });
      toast.success('Paper removed from list!');
    },
  });

  const { mutate: createList } = useMutation({
    ...modelenceMutation('paper.createList'),
    onSuccess: () => {
      refetchLists();
      toast.success('List created!');
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-charcoal p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add to List</h2>
        <ul>
          {lists?.map((list: any) => (
            <li
              key={list._id}
              onClick={() => {
                if (paper.lists?.includes(list._id)) {
                  removePaperFromList({ listId: list._id, paperId: paper._id.toString() });
                } else {
                  addPaperToList({ listId: list._id, paperId: paper._id.toString() });
                }
              }}
              className="px-4 py-2 hover:bg-gray-600 cursor-pointer flex justify-between items-center"
            >
              {list.name}
              {paper.lists?.includes(list._id) && <Check size={18} />}
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-gray-600">
          {isCreating ? (
            <div>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="New list name"
                className="w-full px-3 py-2 border border-light-gray bg-dark-charcoal rounded-md"
              />
              <button
                onClick={() => {
                  createList({ name: newListName });
                  setNewListName('');
                  setIsCreating(false);
                }}
                className="w-full mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Create
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Create New List
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}
