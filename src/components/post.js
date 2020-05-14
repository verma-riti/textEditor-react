import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, CompositeDecorator} from 'draft-js';
import createVideoPlugin from 'draft-js-video-plugin';
import {hashtagStrategy, findLinkEntities, findVideoEntities, findImageEntities} from './entities/media_handler';


const Link = (props) => {
  const url = props.contentState.getEntity(props.entityKey).getData();
  console.log('url =', url.href)
  return (
    <a href={url.href} target="_blank">
      {url.href}
    </a>
  );
};

const Image = (props) => {
  const url = props.contentState.getEntity(props.entityKey).getData();
  console.log('url =', url.src)
  return (
    <img src={url.src}>
    </img>
  );
};

const Video = (props) => {
  const url = props.contentState.getEntity(props.entityKey).getData();
  console.log('url =', url.href)
  return (
    <div>
      <video width="320" height="240" controls>
        <source src={url.src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

const HashtagSpan = props => {
  return (
    <span className="hashtag">
      {props.children}
    </span>
  );
};

function Posts(props) {

  const decorator = new CompositeDecorator([
        {
          strategy: hashtagStrategy,
          component: HashtagSpan,
        },
        {
          strategy: findLinkEntities,
          component: Link,
        },
        {
          strategy: findImageEntities,
          component: Image,
        },
        {
          strategy: findVideoEntities,
          component: Video,
        },
      ]);

  const content = localStorage.getItem('content');
  const _editorState =  JSON.parse(content);
  const new_editorState =  EditorState.createWithContent(convertFromRaw(_editorState), decorator);

  const [editorState, setEditorState] = useState(new_editorState);
  const [isEditable, setisEditable] = useState(false);
  const editPost = () =>{
    setisEditable(true);
    console.log('isEditable = ', isEditable)
  }

  const SubmitPost = ()=> {
      const content = editorState.getCurrentContent();
      const content_convert = convertToRaw(content);
      saveContent(content_convert);
      setisEditable(false);
  }

  const saveContent = (content) => {
        localStorage.setItem('content', JSON.stringify(content));
  }

  const onChange = editorState => {
    setEditorState(editorState);
  };

  return (
        <div >     
          {isEditable ?
                      <div className="editors">
                        <p className="edit_pencil" onClick={SubmitPost}>Save</p> 
                        
                          <Editor 
                          editorState={editorState}
                          onChange={onChange} />
                        
                       </div> 
                      :
                      <div className="profile-page">
                        <span className="edit_pencil"  onClick={editPost}>&#9998;</span> 
                        <div className="content_block">
                          <Editor editorState={editorState} readOnly={true} />
                        </div>
                      </div>
                        
          }
        </div>
    );
}

export default Posts;
