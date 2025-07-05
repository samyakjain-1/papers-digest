import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import { useSession } from 'modelence/client';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';

interface Paper {
    _id: string;
    arxivId: string;
    title: string;
    authors: string[];
    publishedAt: string;
}

export default function FeedPage() {
    const { user } = useSession();
    const navigate = useNavigate();

    const { data: savedPapers, isLoading: isLoadingSaved } = useQuery<Paper[]>({
        ...modelenceQuery('paper.getSaved'),
        enabled: !!user,
    });

    if (!user) {
        return (
            <div className="p-6 text-center text-gray-400">
                <p>Please <Link to="/auth/login" className="text-electric-blue underline">log in</Link> to view your saved papers.</p>
            </div>
        );
    }

    if (isLoadingSaved) return <p className="p-6 text-center">Loading your saved papers...</p>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 px-4 py-2 bg-light-gray rounded-md hover:bg-gray-600 transition-colors"
            >
                &larr; Back
            </button>
            <h1 className="text-2xl font-bold mb-6">My Saved Papers</h1>
            {savedPapers && savedPapers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedPapers.map((paper) => (
                        <div key={paper.arxivId} className="p-4 border border-purple-400/20 rounded-lg bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-60 bg-light-gray/20 hover:bg-light-gray/40 transition-colors shadow-md">
                            <Link to={`/paper/${paper.arxivId}`} className="text-lg font-bold text-electric-blue hover:underline">
                                {paper.title}
                            </Link>
                            <p className="text-sm text-gray-400 mt-1">by {paper.authors.join(', ')}</p>
                            <p className="text-xs text-gray-500">{new Date(paper.publishedAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>You haven't saved any papers yet.</p>
            )}
        </div>
    );
}
