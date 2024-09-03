import React, { useState, useEffect } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';

const Syndication = ({ adminAccess }) => {
  const [documents, setDocuments] = useState([]);
  const [watchThroughs, setWatchThroughs] = useState([]);
  const [readThroughs, setReadThroughs] = useState([]);
  const [overview, setOverview] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newOverview, setNewOverview] = useState('');
  const [newDocument, setNewDocument] = useState({ name: '', description: '', file: null });
  const [newWatchThrough, setNewWatchThrough] = useState({ title: '', url: '' });
  const [newReadThrough, setNewReadThrough] = useState({ title: '', url: '' });

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api' 
    : (window.location.hostname === 'gvsurealestateclub.com' 
        ? 'https://gvsurealestateclub.com/api' 
        : 'https://real-estate-club.vercel.app/api');

  const fetchSyndicationData = async () => {
    try {
      setLoading(true);
      const [documentsRes, watchThroughsRes, readThroughsRes, overviewRes] = await Promise.all([
        fetch(`${API_URL}/syndication/documents`),
        fetch(`${API_URL}/syndication/watch-throughs`),
        fetch(`${API_URL}/syndication/read-throughs`),
        fetch(`${API_URL}/syndication/overview`)
      ]);

      if (!documentsRes.ok || !watchThroughsRes.ok || !readThroughsRes.ok || !overviewRes.ok) {
        throw new Error('Network response was not ok');
      }

      const [documentsData, watchThroughsData, readThroughsData, overviewData] = await Promise.all([
        documentsRes.json(),
        watchThroughsRes.json(),
        readThroughsRes.json(),
        overviewRes.json()
      ]);

      setDocuments(documentsData);
      setWatchThroughs(watchThroughsData);
      setReadThroughs(readThroughsData);
      setOverview(overviewData);
      setNewOverview(overviewData.text);
    } catch (error) {
      console.error('Error fetching syndication data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyndicationData();
  }, [API_URL]);

  const handleUpdateOverview = async () => {
    try {
      const response = await fetch(`${API_URL}/syndication/overview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newOverview })
      });

      if (response.ok) {
        alert('Overview updated successfully');
        setOverview({ text: newOverview });
      } else {
        throw new Error('Failed to update overview');
      }
    } catch (error) {
      console.error('Error updating overview:', error);
    }
  };

  const handleAddOrUpdateDocument = async () => {
    const formData = new FormData();
    formData.append('name', newDocument.name);
    formData.append('description', newDocument.description);
    if (newDocument.file) formData.append('file', newDocument.file);

    try {
      const response = await fetch(`${API_URL}/syndication/documents`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Document added/updated successfully');
        fetchSyndicationData();
      } else {
        throw new Error('Failed to add/update document');
      }
    } catch (error) {
      console.error('Error adding/updating document:', error);
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      const response = await fetch(`${API_URL}/syndication/documents/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Document deleted successfully');
        setDocuments(documents.filter(doc => doc.id !== id));
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleAddOrUpdateWatchThrough = async () => {
    try {
      const response = await fetch(`${API_URL}/syndication/watch-throughs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWatchThrough)
      });

      if (response.ok) {
        alert('Watch-through added/updated successfully');
        fetchSyndicationData();
      } else {
        throw new Error('Failed to add/update watch-through');
      }
    } catch (error) {
      console.error('Error adding/updating watch-through:', error);
    }
  };

  const handleDeleteWatchThrough = async (id) => {
    try {
      const response = await fetch(`${API_URL}/syndication/watch-throughs/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Watch-through deleted successfully');
        setWatchThroughs(watchThroughs.filter(wt => wt.id !== id));
      } else {
        throw new Error('Failed to delete watch-through');
      }
    } catch (error) {
      console.error('Error deleting watch-through:', error);
    }
  };

  const handleAddOrUpdateReadThrough = async () => {
    try {
      const response = await fetch(`${API_URL}/syndication/read-throughs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReadThrough)
      });

      if (response.ok) {
        alert('Read-through added/updated successfully');
        fetchSyndicationData();
      } else {
        throw new Error('Failed to add/update read-through');
      }
    } catch (error) {
      console.error('Error adding/updating read-through:', error);
    }
  };

  const handleDeleteReadThrough = async (id) => {
    try {
      const response = await fetch(`${API_URL}/syndication/read-throughs/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Read-through deleted successfully');
        setReadThroughs(readThroughs.filter(rt => rt.id !== id));
      } else {
        throw new Error('Failed to delete read-through');
      }
    } catch (error) {
      console.error('Error deleting read-through:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#008cf0" />
      </div>
    );
  }

  return (
    <div className="px-12 py-8 font-sans mx-auto max-w-5xl">
      <h1 className="text-4xl font-bold text-center mb-8">Syndication Project</h1>
      
      {/* Overview Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Overview:</h2>
        {editMode ? (
          <textarea value={newOverview} onChange={(e) => setNewOverview(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-4"></textarea>
        ) : (
          <p>{overview.text}</p>
        )}
        {editMode && (
          <button onClick={handleUpdateOverview} className="bg-navy text-white py-2 px-4 rounded-lg mt-2">Save Overview</button>
        )}
      </div>
      
      {/* Documents Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Documents:</h2>
        {documents.map((doc, index) => (
          <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 p-4 border-b border-gray-300">
            <div className="mb-2 md:mb-0">
              <h3 className="text-2xl font-bold">{doc.name}</h3>
              <p>{doc.description}</p>
            </div>
            <div className="flex space-x-2">
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-navy text-white py-2 px-4 rounded-lg">Download</a>
              {adminAccess && (
                <button onClick={() => handleDeleteDocument(doc.id)} className="bg-red-500 text-white py-2 px-4 rounded-lg">Delete</button>
              )}
            </div>
          </div>
        ))}
        {editMode && (
          <>
            <input type="text" placeholder="Document Name" onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })} className="mb-2 p-2 border rounded w-full" />
            <input type="text" placeholder="Document Description" onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })} className="mb-2 p-2 border rounded w-full" />
            <input type="file" onChange={(e) => setNewDocument({ ...newDocument, file: e.target.files[0] })} className="mb-4" />
            <button onClick={handleAddOrUpdateDocument} className="bg-navy text-white py-2 px-4 rounded-lg">Save Document</button>
          </>
        )}
      </div>
      
      {/* Resources Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Resources:</h2>
        
        {/* Watch-throughs Subsection */}
        <div className="ml-4 text-sm mb-4">
          <h3 className="text-2xl font-bold mb-2">Watch-throughs:</h3>
          {watchThroughs.map((video, index) => (
            <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 p-4 border-b border-gray-300">
              <div className="mb-2 md:mb-0">
                <h4 className="text-lg font-semibold">{video.title}</h4>
              </div>
              <div className="flex space-x-2">
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="bg-navy text-white py-2 px-4 rounded-lg">Watch Video</a>
                {adminAccess && (
                  <button onClick={() => handleDeleteWatchThrough(video.id)} className="bg-red-500 text-white py-2 px-4 rounded-lg">Delete</button>
                )}
              </div>
            </div>
          ))}
          {editMode && (
            <>
              <input type="text" placeholder="Watch-through Title" onChange={(e) => setNewWatchThrough({ ...newWatchThrough, title: e.target.value })} className="mb-2 p-2 border rounded w-full" />
              <input type="text" placeholder="Watch-through URL" onChange={(e) => setNewWatchThrough({ ...newWatchThrough, url: e.target.value })} className="mb-4 p-2 border rounded w-full" />
              <button onClick={handleAddOrUpdateWatchThrough} className="bg-navy text-white py-2 px-4 rounded-lg">Save Watch-through</button>
            </>
          )}
        </div>
        
        {/* Read-throughs Subsection */}
        <div className="ml-4 text-sm">
          <h3 className="text-2xl font-bold mb-2">Read-throughs:</h3>
          {readThroughs.map((doc, index) => (
            <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 p-4 border-b border-gray-300">
              <div className="mb-2 md:mb-0">
                <h4 className="text-lg font-semibold">{doc.title}</h4>
              </div>
              <div className="flex space-x-2">
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="bg-navy text-white py-2 px-4 rounded-lg">Read Document</a>
                {adminAccess && (
                  <button onClick={() => handleDeleteReadThrough(doc.id)} className="bg-red-500 text-white py-2 px-4 rounded-lg">Delete</button>
                )}
              </div>
            </div>
          ))}
          {editMode && (
            <>
              <input type="text" placeholder="Read-through Title" onChange={(e) => setNewReadThrough({ ...newReadThrough, title: e.target.value })} className="mb-2 p-2 border rounded w-full" />
              <input type="text" placeholder="Read-through URL" onChange={(e) => setNewReadThrough({ ...newReadThrough, url: e.target.value })} className="mb-4 p-2 border rounded w-full" />
              <button onClick={handleAddOrUpdateReadThrough} className="bg-navy text-white py-2 px-4 rounded-lg">Save Read-through</button>
            </>
          )}
        </div>
      </div>
      
      {/* Admin Controls (if adminAccess is true) */}
      {adminAccess && (
        <>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-navy text-white py-2 px-4 rounded-lg"
          >
            {editMode ? 'Exit Edit Mode' : 'Edit'}
          </button>
        </>
      )}
    </div>
  );
};

export default Syndication;
