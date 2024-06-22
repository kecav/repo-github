// src/components/Auth.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Auth = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get('http://localhost:4000/api/user', { withCredentials: true });
        setUser(data);
      } catch (error) {
        console.error('Not authenticated', error);
      }
    };

    const fetchRepos = async () => {
      try {
        const { data } = await axios.get('http://localhost:4000/api/repos', { withCredentials: true });
        setRepos(data);
      } catch (error) {
        console.error('Error fetching repositories', error);
      }
    };

    fetchUser();
    fetchRepos();
  }, []);

  const handleRepoClick = async (repo) => {
    setSelectedRepo(repo);
    setSelectedFolder(null);
    setSelectedFile(null);
    setFileContent('');

    try {
      const { data } = await axios.get(`https://api.github.com/repos/${repo.full_name}/contents`, { withCredentials: true });
      setSelectedRepo(repo);
      repo.contents = data;
      setRepos([...repos]);
    } catch (error) {
      console.error('Error fetching repository contents', error);
    }
  };

  const handleFolderClick = async (folder) => {
    setSelectedFolder(folder);
    setSelectedFile(null);
    setFileContent('');

    if (folder.type === 'file') {
      try {
        const { data } = await axios.get(folder.download_url, { withCredentials: true });
        setSelectedFile(folder);
        setFileContent(atob(data.content)); // assuming content is base64 encoded
      } catch (error) {
        console.error('Error fetching file content', error);
      }
    }
  };

  return (
    <div>
      <h1>GitHub Repositories</h1>
      {!user ? (
        <a href="http://localhost:4000/auth/github">Login with GitHub</a>
      ) : (
        <div>
          <h2>Welcome, {user.username}</h2>
          <div style={{ display: 'flex' }}>
            <div style={{ marginRight: '20px' }}>
              <h3>Repositories:</h3>
              <ul>
                {repos.map(repo => (
                  <li key={repo.id}>
                    <button onClick={() => handleRepoClick(repo)}>{repo.name}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Repository Contents:</h3>
              {selectedRepo && (
                <ul>
                  {selectedRepo.contents.map(item => (
                    <li key={item.path}>
                      <button onClick={() => handleFolderClick(item)}>
                        {item.type === 'dir' ? `[Folder] ${item.name}` : `[File] ${item.name}`}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {selectedFile && (
                <div>
                  <h3>File Content:</h3>
                  <pre>{fileContent}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
