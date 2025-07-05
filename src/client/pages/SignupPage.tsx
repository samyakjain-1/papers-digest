import { SignupForm } from '@modelence/auth-ui';
import { Link, useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const navigate =useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
      >
        ← Home
      </button>
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create an Account</h1>
          <p className="text-gray-500">
            Please fill in the details to sign up.
          </p>
        </div>
        <div className="auth-ui">
          <SignupForm
            renderLoginLink={({ className, children }) => (
              <Link to="/auth/login" className={className}>{children}</Link>
            )}
          />
        </div>
      </div>
    </div>
  );
}
