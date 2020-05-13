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

  return (
        <div className="profile-page">     
          <button>Edit</button> 
          <div className="content_block">
            <Editor editorState={editorState} readOnly={true} />
          </div>
        </div>
    );
}

export default Posts;
