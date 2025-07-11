import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { modelenceQuery, modelenceMutation } from '@modelence/react-query';
import { useSession } from 'modelence/client';
import { Wand2, Bookmark, Cpu, Check } from 'lucide-react';
import AddToListModal from '../components/AddToListModal';


export default function PaperPage() {
  const { arxivId } = useParams<{ arxivId: string }>();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const navigate = useNavigate();

  const { data: paper, isLoading, error } = useQuery({
    ...modelenceQuery('paper.getOne', { arxivId }),
  }) as { data: any, isLoading: boolean, error: any };

  const { mutate: simplify, isPending: isSimplifying } = useMutation({
    ...modelenceMutation('paper.simplify'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelenceQuery('paper.getOne', { arxivId }).queryKey });
    },
  });

  const { mutate: embed, isPending: isEmbedding } = useMutation({
    ...modelenceMutation('paper.embed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelenceQuery('paper.getOne', { arxivId }).queryKey });
      queryClient.invalidateQueries({ queryKey: modelenceQuery('paper.similar', { arxivId }).queryKey });
    },
  });

  const { mutate: savePaper, isPending: isSaving } = useMutation({
    ...modelenceMutation('paper.save'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelenceQuery('paper.getOne', { arxivId }).queryKey });
    },
  });

  const { mutate: unsavePaper, isPending: isUnsaving } = useMutation({
    ...modelenceMutation('paper.unsave'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelenceQuery('paper.getOne', { arxivId }).queryKey });
    },
  });

  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);

  const { data: similarPapers, isLoading: isLoadingSimilar } = useQuery({
    ...modelenceQuery('paper.similar', { arxivId }),
  }) as { data: any[], isLoading: boolean };

  if (isLoading) {
    return <div className="text-center p-6">Loading paper...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-6">Error: {error.message}</div>;
  }

  if (!paper) {
    return <div className="text-center p-6">Paper not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="mb-6 px-4 py-2 bg-light-gray rounded-md hover:bg-gray-600 transition-colors">
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold mb-2">{paper.title}</h1>
      <p className="text-lg text-gray-400 mb-4">{paper.authors.join(', ')}</p>
      
      <div className="flex items-center gap-4 mb-6 text-sm">
        <a href={paper.arxivUrl} target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:underline">
          arXiv Page
        </a>
        <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:underline">
          PDF
        </a>
        <span>{new Date(paper.publishedAt).toLocaleDateString()}</span>
        {paper.conference && (
          <span className="px-2 py-1 bg-purple-500 text-white rounded-md text-xs">
            {paper.conference}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="prose max-w-none p-4 border border-light-gray rounded-md bg-light-gray/20">
          <h2 className="text-2xl font-semibold mb-2">Abstract</h2>
          <p>{paper.abstract}</p>
        </div>
        <div className="prose max-w-none p-4 border border-cyan-glow rounded-md bg-light-gray/20 relative overflow-hidden">
          <div className="absolute inset-0 border-2 border-cyan-glow rounded-md animate-pulse"></div>
          <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
            Simplified Abstract <span className="text-xs bg-cyan-glow/20 text-cyan-glow px-2 py-1 rounded-full">✨ AI</span>
          </h2>
          {paper.simplifiedAbstract ? (
            <ReactMarkdown>{paper.simplifiedAbstract}</ReactMarkdown>
          ) : (
            <p className="text-gray-500">Click "Simplify Abstract" to generate a simplified version.</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => simplify({ arxivId })}
          disabled={isSimplifying}
          className="mt-6 px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          title="Simplify Abstract"
        >
          <Wand2 size={18} />
          {isSimplifying ? 'Simplifying...' : 'Simplify'}
        </button>
        <button
          onClick={() => embed({ arxivId })}
          disabled={isEmbedding || paper.embedding}
          className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          title="Generate Embedding"
        >
          {paper.embedding ? <Check size={18} /> : <Cpu size={18} />}
          {isEmbedding ? 'Generating...' : (paper.embedding ? 'Embedding Generated' : 'Generate Embedding')}
        </button>
        {user && (
          <>
            <button
              onClick={() => paper.isSaved ? unsavePaper({ paperId: paper._id.toString() }) : savePaper({ paperId: paper._id.toString() })}
              disabled={isSaving || isUnsaving}
              className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              title={paper.isSaved ? 'Unsave Paper' : 'Save Paper'}
            >
              <Bookmark size={18} />
              {isSaving || isUnsaving ? '...' : (paper.isSaved ? 'Unsave' : 'Save')}
            </button>
            <button
              onClick={() => setIsAddToListModalOpen(true)}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
              title="Add to List"
            >
              <Bookmark size={18} />
              Add to List
            </button>
            {isAddToListModalOpen && (
              <AddToListModal
                paper={paper}
                onClose={() => setIsAddToListModalOpen(false)}
              />
            )}
          </>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Similar Papers</h2>
        {isLoadingSimilar && <p>Loading similar papers...</p>}
        {similarPapers && similarPapers.length > 0 && (
          <div className="space-y-4">
            {similarPapers.map((p: any) => (
              <div key={p.arxivId} className="p-4 border border-light-gray rounded-md bg-light-gray/20 hover:bg-light-gray/40 transition-colors">
                <Link to={`/paper/${p.arxivId}`} className="text-lg font-bold text-electric-blue hover:underline">
                  {p.title}
                </Link>
                <p className="text-sm text-gray-400 mt-1">
                  by {p.authors.join(', ')}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="font-semibold">{p.categories[0]}</span>
                  <span>{new Date(p.publishedAt).toLocaleDateString()}</span>
                  <span className="text-gray-500">Similarity: {p.similarity.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {similarPapers && similarPapers.length === 0 && (
          <p>No similar papers found.</p>
        )}
      </div>
    </div>
  );
}
