// src/add.js
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';

function AddUser() {
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [dorm, setDorm] = useState(true);
  const navigate = useNavigate(); // ページ遷移用

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'mydata'), {
        name,
        mail,
        dorm,
       
      });
      alert('ユーザーを追加しました');
      navigate('/'); // 追加後トップページへ戻る
    } catch (error) {
      alert('追加に失敗しました: ' + error.message);
    }
  };

  return (
    <div>
      <h1>ユーザー追加</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>name：</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>mail：</label>
          <input
            type="text"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>dorm：</label>
          <select value={dorm} onChange={(e) => setDorm(e.target.value === 'true')}>
            <option value="true">寮生</option>
            <option value="false">通学</option>
          </select>
        </div>
        <button type="submit">追加</button>
      </form>
    </div>
  );
}

export default AddUser;