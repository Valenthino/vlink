// pages/index.tsx

import { useState } from 'react';

export default function Home() {
  // State to hold the input URL, generated short URL, and error messages.
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');

  // Handle form submission.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');

    // Call the API route to create a short link.
    const res = await fetch('/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();

    if (res.ok) {
      // Build the full short URL using the current origin and returned slug.
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setShortUrl(`${origin}/${data.slug}`);
    } else {
      setError(data.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Link Shortener</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="url"
          placeholder="Enter your URL here..."
          className="w-full p-2 border rounded mb-4"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Shorten URL
        </button>
      </form>
      {shortUrl && (
        <div className="mt-4 p-4 bg-green-200 rounded">
          <p>Your short URL:</p>
          <a href={shortUrl} className="text-blue-600 underline">
            {shortUrl}
          </a>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-200 rounded">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
