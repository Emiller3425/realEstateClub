import React, { useState } from 'react';

const Login = ({ setAdminAccess }) => {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : 'https://real-estate-club-n46hju7iy-ethan-millers-projects.vercel.app/api';

  const handleChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/get-admin-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (password !== data.password) {
        setErrorMessage('Incorrect password');
      } else {
        setErrorMessage('');
        setAdminAccess(true);
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setErrorMessage('Internal error');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full bg-dark-gray text-white">
      <h1 className="text-2xl mb-8">To gain admin access, please enter password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-sm">
        <div className="relative w-full">
          <input
            type="password"
            value={password}
            onChange={handleChange}
            className="mb-4 p-2 rounded w-full border border-white"
            placeholder="Enter Password"
            style={{ color: 'black' }}
          />
        </div>
        <button
          type="submit"
          className="bg-white text-navy py-2 px-4 rounded-lg"
        >
          Submit
        </button>
      </form>
      {errorMessage && (
        <div className="mt-4 text-red-500">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Login;
