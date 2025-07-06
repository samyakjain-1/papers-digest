import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-8 text-gray-400">The page you are looking for does not exist.</p>
      <Link to="/" className="text-electric-blue underline">Go back home</Link>
    </div>
  );
}
