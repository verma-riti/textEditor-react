import React from 'react';
import logo from './logo.svg';
import './App.css';
import Editor from './components/editor'
import PageContainer from './components/pageContainer'
import Post from './components/post'

function App() {
  return (
    <div className="App">
     
      <div className="editor">
       <PageContainer />
      </div>
      <div className="post_status">
        <Post />
      </div>
    </div>
  );
}

export default App;
