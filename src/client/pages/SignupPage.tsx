import { SignupForm } from '@modelence/auth-ui';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from 'modelence/client';
import { useEffect } from 'react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { user } = useSession();

  useEffect(() => {
    if (user) {
      navigate('/papers');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg auth-ui">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Create an Account</h1>
        <SignupForm
          renderLoginLink={({ className, children }) => (
            <Link to="/auth/login" className={className}>{children}</Link>
          )}
        />
      </div>
    </div>
  );
}
