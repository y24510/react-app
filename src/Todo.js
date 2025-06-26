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
  // タスクの状態を管理する
  const [task, setTask] = useState('');
  // 期限の日付を管理するstate
  const [dueDate, setDueDate] = useState('');
  // 編集中のToDoのIDを管理するstate
  const [editId, setEditId] = useState(null);
  // Firestoreから取得したToDo一覧を管理するstate
  const [todos, setTodos] = useState([]);

  // ToDoをFirestoreから取得してstateにセットする関数
  const fetchTodos = useCallback(async () => {
    // ユーザーが存在しない場合は処理を中断
    if (!user?.uid) return;

    try {
      // 'todos'コレクションのドキュメントを全件取得
      const snapshot = await getDocs(collection(db, 'todos'));
      // ドキュメントデータを配列に整形
      const data = snapshot.docs.map((item) => ({
        id: item.id,     // ドキュメントID
        ...item.data()   // ドキュメントの中身
      }));

      // 取得したデータの中から現在のユーザーのものだけ抽出しstateにセット
      setTodos(data.filter((item) => item.uid === user.uid));

    } catch (error) {
      console.error(error);
      alert('ToDo を取得に失敗しました');
    }
  }, [user]);

  // コンポーネントマウント時とuserが変わったときにToDoを取得
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // フォーム送信時の処理（新規登録 or 更新）
  const handleSave = async (e) => {
    e.preventDefault();  // ページリロード防止

    // タスクが空白だけなら処理中断
    if (!task.trim()) return;

    try {
      if (editId) {
        // 編集モードの場合、Firestoreの該当ドキュメントを更新
        await updateDoc(doc(db, 'todos', editId), {
          text: task,
          dueDate: new Date(dueDate),  // 入力値をDate型に変換して保存
        });
        alert('ToDo を整理しました');
      } else {
        // 新規登録の場合、Firestoreに新しいドキュメントを追加
        await addDoc(collection(db, 'todos'), {
          uid: user.uid,
          text: task,
          dueDate: new Date(dueDate),
          completed: false,
          createdAt: serverTimestamp()
        });
        alert('ToDo を登録しました');
      }

      // 入力欄をクリアし編集状態も解除
      setTask('');
      setDueDate('');
      setEditId(null);
      // 変更後に最新データを取得し直す
      fetchTodos();

    } catch (error) {
      console.error(error);
      alert('ToDo を保存に失敗しました');
    }
  };

  // ToDo削除ボタン押下時の処理
  const handleDelete = async (id) => {
    // 確認ダイアログ表示
    if (window.confirm('本当に削除しますか？')) {
      try {
        // Firestoreの該当ドキュメントを削除
        await deleteDoc(doc(db, 'todos', id)); 
        alert('ToDo を削除しました');
        // 削除後に最新データを取得し直す
        fetchTodos();

      } catch (error) {
        console.error(error);
        alert('ToDo を削除に失敗しました');
      }
    }
  };

  // 編集ボタン押下時に入力欄へ既存データをセットし編集モードにする
  const handleEdit = (item) => {
    setEditId(item.id);  // 編集対象のIDをセット
    setTask(item.text);  // タスク名をセット
    // 期限のTimestampをDateに変換し、input[type="date"]用の文字列に変換してセット
    setDueDate(item.dueDate?.toDate().toISOString().split('T')[0]);
  };

  return (
    <div>
      <h1>ToDoリスト</h1>

      {/* 新規登録・編集フォーム */}
      <form onSubmit={handleSave}>
        <div>
          <label>ToDo：</label>
          <input
            value={task}                      // 入力欄の値をtask stateにバインド
            onChange={(e) => setTask(e.target.value)} // 入力時にstate更新
            required                    
          />
        </div>

        <div>
          <label>期限：</label>
          <input
            type="date"
            value={dueDate}                   // 入力欄の値をdueDate stateにバインド
            onChange={(e) => setDueDate(e.target.value)} // 入力時にstate更新
            required                        
          />
        </div>

        {/*「整理」「登録」ボタンを表示 */}
        <button type="submit"
      
        style={{
          backgroundColor: '#4CAF50',  
          color: 'white',              
          padding: '10px 20px',        
          border: 'none',              
          borderRadius: '5px',         
          cursor: 'pointer',           
          fontSize: '16px',
        }}>
          {editId ? '整理' : '登録'}
        </button>
      </form>

      {/* 登録されたToDo一覧 */}
      <br></br>
      <h2>登録されたToDo</h2>
      <ul>
        {todos.map((item) => (
          <li
            key={item.id}
            style={{
              borderTop: '1px solid #ccc',      // 上の線
              borderBottom: '1px solid #ccc',   // 下の線
              paddingBottom: '10px',
              marginBottom: '10px'
            }}
          >
            <div>
              <strong>ToDo:</strong> {item.text}
            </div>
            <div>
              {/* FirestoreのTimestamp型をDateに変換して日本語形式で表示 */}
              <strong>期限:</strong> {item.dueDate?.toDate().toLocaleDateString()}
            </div>

            {/* 削除ボタン */}
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
  }}>
  削除
</button>

          </li>
        ))}
      </ul>
    </div>
  );
}

export default Todo;
