// src/delete.js
import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

function DeleteUser() {
  const [users, setUsers] = useState([]);

  // Firestoreからユーザー一覧を取得
  const fetchUsers = async () => {
    const usersCol = collection(db, 'mydata');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setUsers(userList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ユーザー削除関数
  const deleteUser = async (id) => {
    const confirmDelete = window.confirm('本当に削除しますか？');
    if (!confirmDelete) return;

    try {
        console.log(id);
      await deleteDoc(doc(db, 'mydate', id));
      alert('削除しました');
      fetchUsers(); // 再取得
    } catch (error) {
      alert('削除に失敗しました: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-center">
      <h2>ユーザー削除ページ</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.mail} - {user.dorm ? '寮生' : '通学'}
            &nbsp;
            <button onClick={() => deleteUser(user.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DeleteUser;