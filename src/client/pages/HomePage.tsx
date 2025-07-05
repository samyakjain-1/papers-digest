import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation } from '@modelence/react-query';
import { Link } from 'react-router-dom';
import { useSession } from 'modelence/client';
import { UserInfo } from 'modelence/server';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../components/SkeletonLoader';
import { LogIn, UserPlus, Bookmark } from 'lucide-react';

const CATEGORIES = ["cs.AI", "cs.LG", "cs.CL", "cs.CV", "cs.NE"];

export default function HomePage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [feedType, setFeedType] = useState<'recommended' | 'latest'>('latest');
  const queryClient = useQueryClient();
  const { user } = useSession();
  const navigate = useNavigate();

  const { data: recommendedPapers, isLoading: isLoadingRecommended } = useQuery<any[]>({
    ...modelenceQuery('paper.recommend'),
    enabled: !!user,
  });

  const { data, isLoading, error } = useQuery({
    ...modelenceQuery('paper.list', {
      offset: page * 20,
      limit: 20,
      search: activeSearch || undefined,
      sortBy: 'publishedAt',
    }),
    enabled: feedType === 'latest',
  }) as { data: { papers: any[], total: number }, isLoading: boolean, error: any };

  const [papers, setPapers] = useState<any[]>([]);
  const total = (feedType === 'recommended' ? recommendedPapers?.length : data?.total) || 0;
  const totalPages = Math.ceil(total / 20);

  const { refetch: refetchList } = useQuery({
    ...modelenceQuery('paper.list', {
      offset: page * 20,
      limit: 20,
      search: activeSearch || undefined,
      sortBy: 'publishedAt',
    }),
    enabled: false,
  });

  const { refetch: refetchRecommend } = useQuery<any[]>({
    ...modelenceQuery('paper.recommend'),
    enabled: false,
  });

  useEffect(() => {
    if (feedType === 'recommended' && recommendedPapers) {
      setPapers(recommendedPapers);
    } else if (feedType === 'latest' && data?.papers) {
      setPapers(data.papers);
    }
  }, [feedType, recommendedPapers, data]);

  useEffect(() => {
    refetchList();
    if (user) {
      refetchRecommend();
    }
  }, [user, refetchList, refetchRecommend]);

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

  const { mutate: savePaper } = useMutation({
    ...modelenceMutation('paper.save'),
    onMutate: async (variables) => {
      if (!variables) return;
      
      // Optimistically update the UI
      setPapers(prevPapers =>
        prevPapers.map(paper =>
          paper._id === variables.paperId ? { ...paper, isSaved: true } : paper
        )
      );

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['paper.list'] });
      await queryClient.cancelQueries({ queryKey: ['paper.recommend'] });

      // Snapshot the previous value
      const previousPapers = papers;

      // Return a context object with the snapshotted value
      return { previousPapers };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPapers) {
        setPapers(context.previousPapers);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['paper.list'] });
      queryClient.invalidateQueries({ queryKey: ['paper.recommend'] });
    },
  });

  const { mutate: unsavePaper } = useMutation({
    ...modelenceMutation('paper.unsave'),
    onMutate: async (variables) => {
      if (!variables) return;

      // Optimistically update the UI
      setPapers(prevPapers =>
        prevPapers.map(paper =>
          paper._id === variables.paperId ? { ...paper, isSaved: false } : paper
        )
      );
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['paper.list'] });
      await queryClient.cancelQueries({ queryKey: ['paper.recommend'] });

      // Snapshot the previous value
      const previousPapers = papers;

      // Return a context object with the snapshotted value
      return { previousPapers };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, roll back
      if (context?.previousPapers) {
        setPapers(context.previousPapers);
      }
    },
    onSettled: () => {
      // Always refetch
      queryClient.invalidateQueries({ queryKey: ['paper.list'] });
      queryClient.invalidateQueries({ queryKey: ['paper.recommend'] });
    },
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Link to="/" className="text-3xl font-bold">
          arXiv Papers
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFeedType('recommended')}
            className={`px-4 py-2 rounded-md ${feedType === 'recommended' ? 'bg-electric-blue text-white' : 'bg-light-gray'}`}
          >
            Recommended
          </button>
          <button
            onClick={() => setFeedType('latest')}
            className={`px-4 py-2 rounded-md ${feedType === 'latest' ? 'bg-electric-blue text-white' : 'bg-light-gray'}`}
          >
            Latest
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchPapers({})}
            disabled={isFetching}
            className="px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isFetching ? 'Fetching...' : 'Fetch Latest Papers'}
          </button>
          <button
            onClick={() => embedAll({})}
            disabled={isEmbeddingAll}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {isEmbeddingAll ? 'Embedding...' : 'Generate All Embeddings'}
          </button>
          {!user && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/auth/login')}
                className="px-4 py-2 bg-light-gray text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
                title="Login"
              >
                <LogIn size={18} />
                Login
              </button>
              <button
                onClick={() => navigate('/auth/signup')}
                className="px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                title="Sign Up"
              >
                <UserPlus size={18} />
                Sign Up
              </button>
            </div>
          )}

          {user && (
            <button
              onClick={() => navigate('/saved')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors flex items-center gap-2"
              title="My Saved Papers"
            >
              <Bookmark size={18} />
              Saved
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
          className="flex-1 px-3 py-2 border border-light-gray bg-dark-charcoal rounded-md focus:outline-none focus:ring-2 focus:ring-electric-blue"
        />
        <button type="submit" className="px-4 py-2 bg-light-gray rounded-md hover:bg-gray-600 transition-colors">Search</button>
      </form>

      {/* Loading and Error States */}
      {(isLoading || (feedType === 'recommended' && isLoadingRecommended)) && <SkeletonLoader />}
      {error && <p className="text-center text-red-500">Error: {error.message}</p>}

      {/* Papers List */}
      {feedType === 'recommended' && !user && (
        <div className="text-center p-6">
          <p>
            <Link to="/auth/login" className="text-electric-blue underline">Log in</Link> or <Link to="/auth/signup" className="text-electric-blue underline">sign up</Link> to get personalized recommendations.
          </p>
        </div>
      )}
      {feedType === 'recommended' && user && papers.length === 0 && (
        <div className="text-center p-6">
          <p>
            Save some papers to get personalized recommendations.
          </p>
        </div>
      )}
      {!isLoading && !error && (
        <div className="space-y-4">
          {papers.map((paper: any) => (
            <div key={paper.arxivId} className="p-4 border border-purple-400/20 rounded-lg bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-60 bg-light-gray/20 hover:bg-light-gray/40 transition-colors shadow-md flex justify-between items-center">
              <div>
                <Link to={`/paper/${paper.arxivId}`} className="text-xl font-bold text-electric-blue hover:underline">
                  {paper.title}
                </Link>
                <p className="text-sm text-gray-400 mt-1">
                  by {paper.authors.join(', ')}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="font-semibold">{paper.categories[0]}</span>
                  <span>{new Date(paper.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {user && (
                  <button
                    onClick={() => paper.isSaved ? unsavePaper({ paperId: paper._id }) : savePaper({ paperId: paper._id })}
                    className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                    title={paper.isSaved ? 'Unsave' : 'Save'}
                  >
                    <Bookmark size={18} fill={paper.isSaved ? 'currentColor' : 'none'} />
                  </button>
                )}
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
          className="px-4 py-2 bg-light-gray rounded-md disabled:opacity-50 hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          className="px-4 py-2 bg-light-gray rounded-md disabled:opacity-50 hover:bg-gray-600 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
