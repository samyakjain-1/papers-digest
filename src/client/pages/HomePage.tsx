import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation } from '@modelence/react-query';
import { Link } from 'react-router-dom';
import { useSession } from 'modelence/client';
import { UserInfo } from 'modelence/server';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ["cs.AI", "cs.LG", "cs.CL", "cs.CV", "cs.NE"];

export default function HomePage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');
  const queryClient = useQueryClient();
  const { user } = useSession();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    ...modelenceQuery('paper.list', {
      offset: page * 20,
      limit: 20,
      search: activeSearch || undefined,
      sortBy,
    }),
  }) as { data: { papers: any[], total: number }, isLoading: boolean, error: any };

  const papers = data?.papers || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setActiveSearch(search);
  };


  const { mutate: fetchPapers, isPending: isFetching } = useMutation({
    ...modelenceMutation('paper.fetchAndInsert'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paper.list'] });
    },
  });

  const { mutate: embedAll, isPending: isEmbeddingAll } = useMutation({
    ...modelenceMutation('paper.embedAll'),
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">arXiv Papers</h1>
        <button
          onClick={() => fetchPapers({})}
          disabled={isFetching}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isFetching ? 'Fetching...' : 'Fetch Latest Papers'}
        </button>
        <button
          onClick={() => embedAll({})}
          disabled={isEmbeddingAll}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {isEmbeddingAll ? 'Embedding...' : 'Generate All Embeddings'}
        </button>
        <div className="flex gap-3">
          {!user && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/auth/login')}
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/auth/signup')}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Sign Up
              </button>
            </div>
          )}

          {user && (
            <button
              onClick={() => navigate('/saved')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              My Saved Papers
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearchSubmit} className="flex gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by title or abstract..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="px-4 py-2 bg-gray-200 rounded-md">Search</button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="publishedAt">Sort by Date</option>
          <option value="relevance">Sort by Relevance</option>
        </select>
      </form>

      {/* Loading and Error States */}
      {isLoading && <p className="text-center">Loading papers...</p>}
      {error && <p className="text-center text-red-500">Error: {error.message}</p>}

      {/* Papers List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {papers.map((paper: any) => (
            <div key={paper.arxivId} className="p-4 border border-gray-200 rounded-md">
              <Link to={`/paper/${paper.arxivId}`} className="text-xl font-bold text-blue-600 hover:underline">
                {paper.title}
              </Link>
              <p className="text-sm text-gray-600 mt-1">
                by {paper.authors.join(', ')}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="font-semibold">{paper.categories[0]}</span>
                <span>{new Date(paper.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
