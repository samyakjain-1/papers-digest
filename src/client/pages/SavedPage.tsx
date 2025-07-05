import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import { useSession } from 'modelence/client';
import { Link, useNavigate } from 'react-router-dom';

interface Paper {
    arxivId: string;
    title: string;
    authors: string[];
    publishedAt: string;
}

export default function PersonalizedFeedPage() {
    const { user } = useSession();
    const navigate = useNavigate();

    const { data: papers, isLoading, error } = useQuery<Paper[]>({
        ...modelenceQuery('paper.getSaved'),
        enabled: !!user, // only run if logged in
    });

    if (!user) {
        return (
            <div className="p-6 text-center text-gray-700">
                <p>Please <Link to="/auth/login" className="text-blue-600 underline">log in</Link> to view your personalized feed.</p>
            </div>
        );
    }

    if (isLoading) return <p className="p-6 text-center">Loading your personalized feed...</p>;
    if (error) return <p className="p-6 text-center text-red-500">Error: {error.message}</p>;
    if (!papers?.length) {
        return (
            <div className="p-6 text-center text-gray-700">
                <p className="p-6 text-center">You haven't saved any papers yet. Save some papers to get started!</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                    &larr; Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
                &larr; Back
            </button>
            <h1 className="text-2xl font-bold mb-6">My Saved Papers</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {papers.map((paper) => (
                    <div key={paper.arxivId} className="p-4 border border-gray-200 rounded-md">
                        <Link to={`/paper/${paper.arxivId}`} className="text-lg font-bold text-blue-600 hover:underline">
                            {paper.title}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">by {paper.authors.join(', ')}</p>
                        <p className="text-xs text-gray-400">{new Date(paper.publishedAt).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
