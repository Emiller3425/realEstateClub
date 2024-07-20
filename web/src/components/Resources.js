import React, { useState, useEffect } from 'react';

const Resources = ({ adminAccess }) => {
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({
    name: '',
    description: '',
    file: null,
  });
  const [editMode, setEditMode] = useState(false);

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api' 
    : (window.location.hostname === 'gvsurealestateclub.com' 
        ? 'https://gvsurealestateclub.com/api' 
        : 'https://real-estate-club.vercel.app/api');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`${API_URL}/resources`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
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
      console.log('File selected:', file); // Log file details for debugging
      handleNewResourceChange('file', file);
    }
  };

  const addNewResource = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newResource.name);
      formData.append('description', newResource.description);
      formData.append('file', newResource.file);

      console.log('New resource to be added:', newResource); // Log newResource details for debugging

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
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

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
