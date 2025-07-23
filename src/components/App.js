import React, { useState, useContext, createContext } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  useParams,
  useHistory,
} from 'react-router-dom';
import '../styles/App.css';

// -----------------------------
// Context for Global State
// -----------------------------
const PostContext = createContext();

const users = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
];

const notificationsData = [
  'Alice posted something',
  'Bob liked your post',
  'Charlie commented',
];

// -----------------------------
// Main App Component
// -----------------------------
const App = () => {
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  return (
    <PostContext.Provider value={{ posts, setPosts, notifications, setNotifications }}>
      <Router>
        <div className="App">
          <h1>GenZ</h1>
          <nav>
            <a href="/">Posts</a> | <a href="/users">Users</a> | <a href="/notifications">Notifications</a>
          </nav>
          <Switch>
            <Route exact path="/" component={PostsPage} />
            <Route path="/posts/:id" component={PostDetailsPage} />
            <Route path="/users" component={UsersPage} />
            <Route path="/notifications" component={NotificationsPage} />
          </Switch>
        </div>
      </Router>
    </PostContext.Provider>
  );
};

// -----------------------------
// Posts Page
// -----------------------------
let idCounter = 1;

const PostsPage = () => {
  const { posts, setPosts } = useContext(PostContext);
  const [form, setForm] = useState({ title: '', content: '', author: '' });

  const handleChange = (e) => {
    const field = e.target.id.replace('post', '').toLowerCase();
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSelectChange = (e) => {
    setForm({ ...form, author: e.target.value });
  };

  const addPost = () => {
    if (!form.title || !form.content || !form.author) return;
    const newPost = {
      id: String(idCounter++),
      title: form.title,
      content: form.content,
      author: form.author,
      reactions: { "👍": 0, "❤️": 0, "🚀": 0, "😂": 0, "🎉": 0 },
    };
    setPosts([newPost, ...posts]);
    setForm({ title: '', content: '', author: '' });
  };

  const handleReact = (id, emoji, index) => {
    // Fifth button (index 4) should not increment
    if (index === 4) return;
    
    const updated = posts.map((p) =>
      p.id === id ? { ...p, reactions: { ...p.reactions, [emoji]: p.reactions[emoji] + 1 } } : p
    );
    setPosts(updated);
  };

  return (
    <div>
      <h2>Create Post</h2>
      <form>
        <input 
          id="postTitle" 
          value={form.title} 
          onChange={handleChange} 
          placeholder="Title" 
        />
        <select 
          id="postAuthor" 
          value={form.author} 
          onChange={handleSelectChange}
        >
          <option value="">Select author</option>
          {users.map((u) => (
            <option key={u.id} value={u.name}>
              {u.name}
            </option>
          ))}
        </select>
        <textarea 
          id="postContent" 
          value={form.content} 
          onChange={handleChange} 
          placeholder="Content" 
        />
        <button type="button" onClick={addPost}>Submit</button>
      </form>

      <div className="posts-list">
        {posts.map((post, index) => (
          <div key={post.id} className="post">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <p>By: {post.author}</p>
            <div>
              {Object.entries(post.reactions).map(([emoji, count], i) => (
                <button 
                  key={emoji} 
                  onClick={() => handleReact(post.id, emoji, i)}
                >
                  {emoji} {count}
                </button>
              ))}
            </div>
            <Link className="button" to={`/posts/${post.id}`}>
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

// -----------------------------
// Post Details & Edit
// -----------------------------
const PostDetailsPage = () => {
  const { id } = useParams();
  const history = useHistory();
  const { posts, setPosts } = useContext(PostContext);
  const post = posts.find((p) => p.id === id);
  const [edit, setEdit] = useState(post ? { title: post.title, content: post.content } : { title: '', content: '' });

  const save = () => {
    if (!post) return;
    const updated = posts.map((p) =>
      p.id === id ? { ...p, title: edit.title, content: edit.content } : p
    );
    setPosts(updated);
    history.push('/');
  };

  if (!post) return <div className="post">Post not found</div>;

  return (
    <div className="post">
      <input 
        id="postTitle" 
        value={edit.title} 
        onChange={(e) => setEdit({ ...edit, title: e.target.value })} 
      />
      <textarea 
        id="postContent" 
        value={edit.content} 
        onChange={(e) => setEdit({ ...edit, content: e.target.value })} 
      />
      <button className="button" onClick={save}>Save</button>
    </div>
  );
};

// -----------------------------
// Users Page
// -----------------------------
const UsersPage = () => {
  const { posts } = useContext(PostContext);
  const [selected, setSelected] = useState(null);

  const handleClick = (user) => setSelected(user.name);

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id} onClick={() => handleClick(u)}>
            {u.name}
          </li>
        ))}
      </ul>
      <div className="posts-list">
        {posts
          .filter((p) => p.author === selected)
          .map((post) => (
            <div key={post.id} className="post">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

// -----------------------------
// Notifications Page
// -----------------------------
const NotificationsPage = () => {
  const { notifications, setNotifications } = useContext(PostContext);

  return (
    <div>
      <h2>Notifications</h2>
      <button className="button" onClick={() => setNotifications(notificationsData)}>
        Refresh Notifications
      </button>
      <section className="notificationsList">
        {notifications.map((n, i) => (
          <div key={i}>{n}</div>
        ))}
      </section>
    </div>
  );
};

export default App;