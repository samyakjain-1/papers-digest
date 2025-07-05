import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Search, Bookmark } from 'lucide-react';
import NavBar from '../components/NavBar';

export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add('landing-page-body');
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { offsetWidth, offsetHeight } = container;
      const x = (clientX / offsetWidth) * 100;
      const y = (clientY / offsetHeight) * 100;
      container.style.setProperty('--mouse-x', `${x}%`);
      container.style.setProperty('--mouse-y', `${y}%`);
    };

    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.body.classList.remove('landing-page-body');
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <NavBar />
      <div ref={containerRef} className="bg-black text-white min-h-screen flex flex-col items-center justify-center text-center p-6 relative overflow-hidden landing-container">
        <div className="stars-layer"></div>
        <div className="grid-layer"></div>
        <div className="glow-layer"></div>
        <div className="max-w-4xl z-10 mt-24">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            From Complexity to Clarity
          </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10">
          Your AI-Powered Research Partner. Dive into academic papers with tools that simplify, explain, and connect ideas.
        </p>
        <button
          onClick={() => navigate('/papers')}
          className="bg-purple-600 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Explore Papers
        </button>
      </div>

      <div className="mt-24 z-10 w-full max-w-5xl">
        <h2 className="text-3xl font-bold mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center">
            <Wand2 size={48} className="text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI-Powered Simplification</h3>
            <p className="text-gray-400">
              Understand complex papers with AI-generated summaries and explanations.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Search size={48} className="text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Similar Paper Discovery</h3>
            <p className="text-gray-400">
              Find related research and explore new connections with our semantic search.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Bookmark size={48} className="text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Save & Organize</h3>
            <p className="text-gray-400">
              Keep track of your research by saving and organizing papers in your personal library.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
