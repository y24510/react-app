
import { useState, useEffect } from 'react';
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
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editId, setEditId] = useState(null);

  // タスク取得
  const fetchTodos = async () => {
    const snapshot = await getDocs(collection(db, 'todos'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const filtered = data.filter(todo => todo.uid === user.uid);
    setTodos(filtered);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // 追加または編集保存
  const saveTodo = async () => {
    if (!task || !dueDate) return;

    if (editId) {
      await updateDoc(doc(db, 'todos', editId), {
        text: task,
        dueDate: new Date(dueDate),
      });
    } else {
      await addDoc(collection(db, 'todos'), {
        uid: user.uid,
        text: task,
        createdAt: serverTimestamp(),
        dueDate: new Date(dueDate),
        completed: false,
      });
    }

    setTask('');
    setDueDate('');
    setEditId(null);
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, 'todos', id));
    fetchTodos();
  };

  const startEdit = (todo) => {
    setTask(todo.text);
    setDueDate(todo.dueDate?.toDate().toISOString().split('T')[0]);
    setEditId(todo.id);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">ToDoリスト</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="やること"
          value={task}
          onChange={e => setTask(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={saveTodo} className="bg-blue-500 text-white p-2 rounded">
          {editId ? '更新' : '追加'}
        </button>
      </div>

      <ul>
        {todos.map(todo => (
          <li key={todo.id} className="flex justify-between items-center bg-white border p-2 mb-2">
            <div>
              <div className="font-semibold">{todo.text}</div>
              <div className="text-sm text-gray-500">
                作成日: {todo.createdAt?.toDate().toLocaleDateString() || '―'} /
                締切: {todo.dueDate?.toDate().toLocaleDateString() || '―'}
              </div>
            </div>
            <div className="space-x-2">
              <button onClick={() => startEdit(todo)} className="bg-yellow-500 text-white px-2 rounded">編集</button>
              <button onClick={() => deleteTodo(todo.id)} className="bg-red-500 text-white px-2 rounded">削除</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Todo;
