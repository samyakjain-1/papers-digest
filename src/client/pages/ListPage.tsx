import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation } from '@modelence/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSession } from 'modelence/client';
import { toast } from 'react-hot-toast';

interface Paper {
  _id: string;
  arxivId: string;
  title: string;
  authors: string[];
  publishedAt: string;
}

interface List {
  _id: string;
  name: string;
  papers: Paper[];
}

export default function ListPage() {
  const { listId } = useParams();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newListName, setNewListName] = useState('');

  const { data: list, isLoading } = useQuery<List>({
    ...modelenceQuery('paper.listOne', { listId }),
    enabled: !!user,
  });

  const { mutate: removePaperFromList } = useMutation({
    ...modelenceMutation('paper.removePaperFromList'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelenceQuery('paper.listOne', { listId }).queryKey });
      toast.success('Paper removed from list!');
    },
  });

  const { mutate: renameList } = useMutation({
    ...modelenceMutation('paper.renameList'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelenceQuery('paper.listOne', { listId }).queryKey });
      setIsRenaming(false);
      toast.success('List renamed!');
    },
  });

  if (isLoading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>Please <Link to="/auth/login" className="text-electric-blue underline">log in</Link> to view this list.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/" className="text-electric-blue hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/lists" className="text-electric-blue hover:underline">My Lists</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-400">{list?.name}</span>
      </div>
      <div className="flex justify-between items-center mb-6">
        {isRenaming ? (
          <div className="flex-1">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="px-3 py-2 border border-light-gray bg-dark-charcoal rounded-md focus:outline-none focus:ring-2 focus:ring-electric-blue"
            />
            <button
              onClick={() => renameList({ listId, name: newListName })}
              className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsRenaming(false)}
              className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <h1 className="text-2xl font-bold">{list?.name}</h1>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsRenaming(!isRenaming);
              setNewListName(list?.name || '');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {isRenaming ? 'Cancel' : 'Rename List'}
          </button>
        </div>
      </div>
      {list && list.papers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.papers.map((paper) => (
            <div key={paper._id} className="p-4 border border-purple-400/20 rounded-lg bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-60 bg-light-gray/20 hover:bg-light-gray/40 transition-colors shadow-md flex justify-between items-center">
              <div>
                <Link to={`/paper/${paper.arxivId}`} className="text-lg font-bold text-electric-blue hover:underline">
                  {paper.title}
                </Link>
                <p className="text-sm text-gray-400 mt-1">by {paper.authors.join(', ')}</p>
                <p className="text-xs text-gray-500">{new Date(paper.publishedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to remove this paper from the list?')) {
                    removePaperFromList({ listId, paperId: paper._id });
                  }
                }}
                className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>This list is empty.</p>
      )}
    </div>
  );
}
