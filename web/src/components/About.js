import React, { useState, useEffect } from 'react';

const About = ({ adminAccess }) => {
  const [editMode, setEditMode] = useState(false);
  const [membersContent, setMembersContent] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newMember, setNewMember] = useState({
    name: '',
    title: '',
    email: '',
    description: '',
    image: null,
    order: 0,
  });

  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : 'https://https://real-estate-club.vercel.app/api';

  useEffect(() => {
    const fetchMembersContent = async () => {
      try {
        const response = await fetch(`${API_URL}/about`);
        const data = await response.json();
        setTitle(data.title);
        setContent(data.content);
        setMembersContent(data.members.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Error fetching members content:', error);
      }
    };

    fetchMembersContent();
  }, [API_URL]);

  const handleChange = (index, field, value) => {
    const updatedMembers = [...membersContent];
    updatedMembers[index][field] = value;
    setMembersContent(updatedMembers);
  };

  const handleNewMemberChange = (field, value) => {
    setNewMember((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleNewMemberChange('image', file);
    }
  };

  const handleMemberImageChange = (index, file) => {
    const updatedMembers = [...membersContent];
    updatedMembers[index].image = file;
    setMembersContent(updatedMembers);
  };

  const addNewMember = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newMember.name);
      formData.append('title', newMember.title);
      formData.append('email', newMember.email);
      formData.append('description', newMember.description);
      formData.append('image', newMember.image);
      formData.append('order', membersContent.length);

      const response = await fetch(`${API_URL}/new-member`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMembersContent([...membersContent, data]);
      setNewMember({
        name: '',
        title: '',
        email: '',
        description: '',
        image: null,
        order: 0,
      });
    } catch (error) {
      console.error('Error adding new member:', error);
    }
  };

  const deleteMember = async (id) => {
    try {
      const response = await fetch(`${API_URL}/delete-member/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setMembersContent(membersContent.filter((member) => member.id !== id));
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const updateMember = async (index) => {
    const member = membersContent[index];
    const formData = new FormData();
    formData.append('id', member.id);
    formData.append('name', member.name);
    formData.append('title', member.title);
    formData.append('email', member.email);
    formData.append('description', member.description);
    formData.append('order', member.order);

    if (typeof member.image !== 'string') {
      formData.append('image', member.image);
    }

    try {
      const response = await fetch(`${API_URL}/update-member`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setEditMode(false);
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  const updateTitleAndContent = async () => {
    try {
      const response = await fetch(`${API_URL}/update-about-title`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setEditMode(false);
    } catch (error) {
      console.error('Error updating title and content:', error);
    }
  };

  const moveMember = async (index, direction) => {
    const updatedMembers = [...membersContent];
    const swapIndex = index + direction;

    if (swapIndex < 0 || swapIndex >= updatedMembers.length) return;

    [updatedMembers[index], updatedMembers[swapIndex]] = [updatedMembers[swapIndex], updatedMembers[index]];

    updatedMembers[index].order -= direction;
    updatedMembers[swapIndex].order += direction;

    setMembersContent(updatedMembers);

    await updateMember(index);
    await updateMember(swapIndex);
  };

  return (
    <div style={{ padding: '40px',fontFamily: 'Gill Sans, sans-serif', margin: '0 auto', width: '75%' }}>
      {editMode ? (
        <>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            style={{ marginBottom: '20px', fontSize: '2rem'}}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            style={{ marginBottom: '20px' }}
          />
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold" style={{ textAlign: 'center', padding:'30px' }}>{title}</h1>
          <p className="text-2xl"style={{ marginBottom: '20px', textAlign: 'left' }}>{content}</p>
        </>
      )}
      {membersContent.map((member, index) => (
        <div
          key={index}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-start', 
            margin: '20px 0',
            padding: '20px 0', 
            borderBottom: '1px solid #ccc' 
          }}
        >
          <img 
            src={typeof member.image === 'string' ? member.image : URL.createObjectURL(member.image)} 
            alt={member.name} 
            style={{ 
              width: '150px', 
              height: '200px', 
              borderRadius: '10px', 
              marginRight: '20px' 
            }} 
          />
          <div style={{ textAlign: 'left', flex: 1 }}>
            {editMode ? (
              <>
                <div className="mb-4">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    style={{ marginBottom: '10px' }}
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    value={member.title}
                    onChange={(e) => handleChange(index, 'title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    style={{ marginBottom: '10px' }}
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    value={member.email}
                    onChange={(e) => handleChange(index, 'email', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    style={{ color: 'gray', fontStyle: 'italic', marginBottom: '10px' }}
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    value={member.description}
                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="file"
                    onChange={(e) => handleMemberImageChange(index, e.target.files[0])}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => updateMember(index)}
                  className="bg-navy text-white py-2 px-4 rounded-lg"
                  style={{ marginTop: '10px' }}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold">{member.name}</h2>
                <h3 className="text-xl font-bold">{member.title}</h3>
                <a href={`mailto:${member.email}`} style={{ color: 'gray', fontStyle: 'italic' }}>{member.email}</a>
                <p style={{ paddingTop: '20px' }}>{member.description}</p>
              </>
            )}
            {adminAccess && !editMode && (
              <button
                onClick={() => deleteMember(member.id)}
                className="bg-red-500 text-white py-2 px-4 rounded-lg"
                style={{ marginTop: '10px' }}
              >
                Delete
              </button>
            )}
            {editMode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <button
                  onClick={() => moveMember(index, -1)}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                  style={{ marginRight: '10px' }}
                >
                  Move Up
                </button>
                <button
                  onClick={() => moveMember(index, 1)}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                >
                  Move Down
                </button>
              </div>
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
                <h2 className="text-3xl font-bold">Add New Member</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newMember.name}
                    onChange={(e) => handleNewMemberChange('name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newMember.title}
                    onChange={(e) => handleNewMemberChange('title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Email"
                    value={newMember.email}
                    onChange={(e) => handleNewMemberChange('email', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    style={{ color: 'gray', fontStyle: 'italic' }}
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    placeholder="Description"
                    value={newMember.description}
                    onChange={(e) => handleNewMemberChange('description', e.target.value)}
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={addNewMember}
                  className="bg-navy text-white py-2 px-4 rounded-lg"
                >
                  Add Member
                </button>
              </div>
              <button
                onClick={updateTitleAndContent}
                className="bg-navy text-white py-2 px-4 rounded-lg"
                style={{ marginTop: '20px' }}
              >
                Save Title and Content
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default About;
