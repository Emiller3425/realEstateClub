import React, { useState } from 'react';
import eboard1 from '../images/Eboard1.jpeg';
import eboard2 from '../images/Eboard2.jpg';
import blake from '../images/Blake.jpeg';
import jacob from '../images/Jacob.jpg';
import sophie from '../images/Sophie.jpg';
import caleb from '../images/Caleb.jpg';
import bronson from '../images/Bronson.jpg';
import jake from '../images/Jake.jpg';

const members = [
  { name: 'Blake Bess', image: blake, description: 'Description for Blake', title: 'President', email: 'bessb@mail.gvsu.edu' },
  { name: 'Jacob Vandenberg', image: jacob, description: 'Description for Jacob', title: 'Vice President', email: 'vandenjd@mail.gvsu.edu' },
  { name: 'Sophie Bulos', image: sophie, description: 'Description for Sophie', title: 'Treasurer', email: 'buloss@mail.gvsu.edu' },
  { name: 'Caleb Ray', image: caleb, description: 'Description for Caleb', title: 'Secretary', email: 'raycal@mail.gvsu.edu' },
  { name: 'Bronson Bess', image: bronson, description: 'Description for Bronson', title: 'Marketing Director', email: 'bessbr@mail.gvsu.edu' },
  { name: 'Jake Giddings', image: jake, description: 'Description for Jake', title: 'Event Coordinator', email: 'giddingsj@mail.gvsu.edu' },
  { name: 'Cam Raffler', image: jake, description: 'Description for cam raffler', title: 'idk', email: 'rafflerc@mail.gvsu.edu' },
  { name: 'Collin Shirkey', image: jake, description: 'description for collin shirkey', title: 'Event Coordinator', email: 'shirkeyc@mail.gvsu.edu' },
];

const About = ({ adminAccess }) => {
  const [editMode, setEditMode] = useState(false);
  const [membersContent, setMembersContent] = useState(members);

  const handleChange = (index, field, value) => {
    const updatedMembers = [...membersContent];
    updatedMembers[index][field] = value;
    setMembersContent(updatedMembers);
  };

  return (
    <div style={{ padding: '60px', fontFamily: 'Arial, sans-serif', margin: '0 auto', width: '75%' }}>
      <h1 className="text-4xl font-bold" style={{ textAlign: 'center' }}>About Us!</h1>
      <section style={{ marginBottom: '20px', textAlign: 'left' }}></section>
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
            src={member.image} 
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
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold">{member.name}</h2>
                <h3 className="text-xl font-bold">{member.title}</h3>
                <a href={`mailto:${member.email}`} style={{ color: 'gray', fontStyle: 'italic' }}>{member.email}</a>
                <p style={{ paddingTop: '20px' }}>{member.description}</p>
              </>
            )}
          </div>
        </div>
      ))}
      {adminAccess && (
        <button
          onClick={() => setEditMode(!editMode)}
          className="bg-navy text-white py-2 px-4 rounded-lg"
        >
          {editMode ? 'Save' : 'Edit'}
        </button>
      )}
    </div>
  );
};

export default About;
