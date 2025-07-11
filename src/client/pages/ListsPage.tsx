import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation } from '@modelence/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from 'modelence/client';
import { toast } from 'react-hot-toast';

interface List {
  _id: string;
  name: string;
}

export default function ListsPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  const { data: lists, isLoading } = useQuery<List[]>({
    ...modelenceQuery('paper.lists'),
    enabled: !!user,
  });

  const { mutate: createList } = useMutation({
    ...modelenceMutation('paper.createList'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paper.lists'] });
      setIsCreating(false);
      setNewListName('');
      toast.success('List created!');
    },
  });

  const { mutate: deleteList } = useMutation({
    ...modelenceMutation('paper.deleteList'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paper.lists'] });
      toast.success('List deleted!');
    },
  });

  const { mutate: renameList } = useMutation({
    ...modelenceMutation('paper.renameList'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paper.lists'] });
      toast.success('List renamed!');
    },
  });

  const [renamingListId, setRenamingListId] = useState<string | null>(null);
  const [newListNameInput, setNewListNameInput] = useState('');

  if (isLoading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>Please <Link to="/auth/login" className="text-electric-blue underline">log in</Link> to view your lists.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-light-gray rounded-md hover:bg-gray-600 transition-colors"
      >
        &larr; Back
      </button>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Lists</h1>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          {isCreating ? 'Cancel' : 'Create New List'}
        </button>
      </div>

      {isCreating && (
        <div className="mb-6">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Enter list name"
            className="px-3 py-2 border border-light-gray bg-dark-charcoal rounded-md focus:outline-none focus:ring-2 focus:ring-electric-blue"
          />
          <button
            onClick={() => createList({ name: newListName })}
            className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Create
          </button>
        </div>
      )}

      {lists && lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <div key={list._id} className="p-4 border border-purple-400/20 rounded-lg bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-60 bg-light-gray/20 hover:bg-light-gray/40 transition-colors shadow-md flex justify-between items-center">
              {renamingListId === list._id ? (
                <div className="flex-1">
                  <input
                    type="text"
                    value={newListNameInput}
                    onChange={(e) => setNewListNameInput(e.target.value)}
                    className="px-3 py-2 border border-light-gray bg-dark-charcoal rounded-md focus:outline-none focus:ring-2 focus:ring-electric-blue"
                  />
                  <button
                    onClick={() => {
                      renameList({ listId: list._id, name: newListNameInput });
                      setRenamingListId(null);
                    }}
                    className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setRenamingListId(null)}
                    className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <Link to={`/lists/${list._id}`} className="text-lg font-bold text-electric-blue hover:underline">
                    {list.name}
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setRenamingListId(list._id);
                        setNewListNameInput(list.name);
                      }}
                      className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this list?')) {
                          deleteList({ listId: list._id });
                        }
                      }}
                      className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>You haven't created any lists yet.</p>
      )}
    </div>
  );
}
