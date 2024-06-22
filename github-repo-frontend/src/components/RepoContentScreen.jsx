import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RepoContentScreen = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    axios.get('http://localhost:4000/api/user', { withCredentials: true })
      .then(response => {
        setUser(response.data);
        fetchRepos();
      })
      .catch(error => {
        console.error('Not authenticated', error);
        setLoading(false);
      });
  }, []);

  const fetchRepos = () => {
    axios.get('http://localhost:4000/api/repos', { withCredentials: true })
      .then(response => {
        setRepos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching repositories', error);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    axios.post('http://localhost:4000/logout', {}, { withCredentials: true })
      .then(() => {
        setUser(null);
        setRepos([]);
      })
      .catch(error => {
        console.error('Logout error', error);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <button onClick={handleLogout}>Logout</button>

      <h2>Repositories</h2>
      <ul>
        {repos.map(repo => (
          <li key={repo.id}>
            <strong>{repo.name}</strong>: {repo.description}
            <ul>
              {repo.contents.map(content => (
                <li key={content.sha}>
                  <a href={content.html_url} target="_blank" rel="noopener noreferrer">{content.name}</a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RepoContentScreen;
