import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from 'modelence/client';
import { LogIn, UserPlus, Bookmark } from 'lucide-react';

export default function NavBar() {
  const { user } = useSession();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-20 bg-black/50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            PaperDigest
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/papers" className="hover:text-gray-300 transition-colors">
              Explore
            </Link>
            <div className="flex items-center gap-3">
              {!user && (
                <>
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
                </>
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
        </div>
      </div>
    </nav>
  );
}
