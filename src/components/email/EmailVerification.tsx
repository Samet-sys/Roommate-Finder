import React, { useEffect, useState } from 'react';
import { Header } from '../layout/Header';
import { Button } from '../ui/Button'; // Assuming you have a reusable Button component

export const EmailVerification: React.FC = () => {
  const [verificationMessage, setVerificationMessage] = useState('Verifying email...');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      fetch(`http://localhost:3000/api/auth/verify-email?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          setVerificationMessage(data.message || 'Verifying email...');
          if (data.message === 'Email successfully verified.') {
            setIsVerified(true);
          }
        })
        .catch(() => {
          setVerificationMessage('An error occurred while verifying your email.');
        });
    } else {
      setVerificationMessage('Invalid verification token.');
    }
  }, []);

  const handleRedirect = () => {
    window.location.href = isVerified ? '/signin' : '/';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome Back!</h1>
        <p className="text-lg text-gray-600 mb-6">
            {verificationMessage === 'Email is successfully verified.'
                ? 'Your email is successfully verified.'
                : verificationMessage}
        </p>
        <Button
          onClick={handleRedirect}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {isVerified ? 'Go to Sign In' : 'Go to Home'}
        </Button>
      </div>
    </div>
  );
};