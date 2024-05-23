import React, { useEffect, useState } from 'react';
import { getUsers } from '../firebase';

const UserList = () => {
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const users = await getUsers();
      setUserList(users);
    }

    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Accounts Created</h2>
      <ul>
        {userList.map(user => (
          <li key={user.id}>
            {user.firstName} - {user.email} {/* Assuming you have 'name' and 'email' fields in your user profile */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;