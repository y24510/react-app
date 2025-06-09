// src/find.js
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';


function FindUserPage() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCol = collection(db, 'mydate');
      const userSnapshot = await getDocs(usersCol);
      const userList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
      setFilteredUsers(userList);
    };

    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const kw = e.target.value;
    setKeyword(kw);

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(kw.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  return (
    <div>
 
      <h2>ユーザー検索ページ</h2>
      <input
        type="text"
        placeholder="名前で検索"
        value={keyword}
        onChange={handleSearch}
        style={{ marginBottom: '10px', padding: '5px' }}
      />
      <ul>
        {filteredUsers.map(user => (
          <li key={user.id}>
            {user.name} - {user.mail} - {user.dorm ? "寮生" : "通学"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FindUserPage;