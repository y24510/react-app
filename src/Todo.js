import { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

function Todo({ user }) {
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editId, setEditId] = useState(null);
  const [todos, setTodos] = useState([]);

  const fetchTodos = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const snapshot = await getDocs(collection(db, 'todos'));
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setTodos(data.filter((item) => item.uid === user.uid));
    } catch (error) {
      console.error(error);
      alert('ToDo を取得に失敗しました');
    }
  }, [user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleSave = async (e) => {
    e.preventDefault();

    // 🔒 user チェック追加
    if (!user || !user.uid) {
      alert('ログイン情報が見つかりません');
      return;
    }

    if (!task.trim()) return;

    try {
      if (editId) {
        await updateDoc(doc(db, 'todos', editId), {
          text: task,
          dueDate: new Date(dueDate),
        });
        alert('ToDo を整理しました');
      } else {
        await addDoc(collection(db, 'todos'), {
          uid: user.uid,
          text: task,
          dueDate: new Date(dueDate),
          completed: false,
          createdAt: serverTimestamp()
        });
        alert('ToDo を登録しました');
      }

      setTask('');
      setDueDate('');
      setEditId(null);
      fetchTodos();
    } catch (error) {
      console.error(error);
      alert('ToDo を保存に失敗しました');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('本当に削除しますか？')) {
      try {
        await deleteDoc(doc(db, 'todos', id));
        alert('ToDo を削除しました');
        fetchTodos();
      } catch (error) {
        console.error(error);
        alert('ToDo を削除に失敗しました');
      }
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setTask(item.text);
    setDueDate(item.dueDate?.toDate().toISOString().split('T')[0]);
  };

  // 🔒 未ログイン時の表示
  if (!user) {
    return <div>ログインしてください</div>;
  }

  return (
    <div>
      <h1>ToDoリスト</h1>

      <form onSubmit={handleSave}>
        <div>
          <label>ToDo：</label>
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            required
          />
        </div>

        <div>
          <label>期限：</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          {editId ? '整理' : '登録'}
        </button>
      </form>

      <br />
      <h2>登録されたToDo</h2>
      <ul>
        {todos.map((item) => (
          <li
            key={item.id}
            style={{
              borderTop: '1px solid #ccc',
              borderBottom: '1px solid #ccc',
              paddingBottom: '10px',
              marginBottom: '10px',
            }}
          >
            <div>
              <strong>ToDo:</strong> {item.text}
            </div>
            <div>
              <strong>期限:</strong> {item.dueDate?.toDate().toLocaleDateString()}
            </div>

            <button
              onClick={() => handleEdit(item)}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                marginRight: '10px',
              }}
            >
              編集
            </button>

            <button
              onClick={() => handleDelete(item.id)}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Todo;
