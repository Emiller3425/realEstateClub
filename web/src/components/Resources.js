import React, { useState, useEffect } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';

const Resources = ({ adminAccess }) => {
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({
    name: '',
    description: '',
    file: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api' 
    : (window.location.hostname === 'gvsurealestateclub.com' 
        ? 'https://gvsurealestateclub.com/api' 
        : 'https://real-estate-club.vercel.app/api');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true); // Set loading to true
        const response = await fetch(`${API_URL}/resources`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchResources();
  }, [API_URL]);

  const handleNewResourceChange = (field, value) => {
    setNewResource((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleNewResourceChange('file', file);
    }
  };

  const addNewResource = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newResource.name);
      formData.append('description', newResource.description);
      formData.append('file', newResource.file);

      const response = await fetch(`${API_URL}/new-resource`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResources([...resources, data]);
      setNewResource({
        name: '',
        description: '',
        file: null,
      });
      alert('Added new resource successfully');
    } catch (error) {
      console.error('Error adding new resource:', error);
    }
  };

  const deleteResource = async (id) => {
    try {
      const response = await fetch(`${API_URL}/delete-resource/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setResources(resources.filter((resource) => resource.id !== id));
      alert('Deleted new resource successfully');
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <BeatLoader color="#008cf0" />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Gill Sans, sans-serif', margin: '0 auto', width: '75%' }}>
      <h1 className="text-4xl font-bold" style={{ textAlign: 'center', padding: '30px' }}>Resources</h1>
      {resources.map((resource, index) => (
        <div key={index} style={{ marginBottom: '20px', padding: '20px', borderBottom: '1px solid #ccc' }}>
          <h2 className="text-2xl font-bold">{resource.name}</h2>
          <p>{resource.description}</p>
          <div style={{ marginTop: '10px' }}>
            <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-navy text-white py-2 px-4 rounded-lg">
              Preview
            </a>
            {adminAccess && (
              <button
                onClick={() => deleteResource(resource.id)}
                className="bg-red-500 text-white py-2 px-4 rounded-lg"
                style={{ marginLeft: '10px' }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
      {adminAccess && (
        <>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-navy text-white py-2 px-4 rounded-lg"
          >
            {editMode ? 'Exit Edit Mode' : 'Edit'}
          </button>
          {editMode && (
            <>
              <div style={{ marginTop: '40px' }}>
                <h2 className="text-3xl font-bold">Add New Resource</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newResource.name}
                    onChange={(e) => handleNewResourceChange('name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    placeholder="Description"
                    value={newResource.description}
                    onChange={(e) => handleNewResourceChange('description', e.target.value)}
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={addNewResource}
                  className="bg-navy text-white py-2 px-4 rounded-lg"
                >
                  Add Resource
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Resources;