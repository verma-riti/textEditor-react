import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, CompositeDecorator} from 'draft-js';
import createVideoPlugin from 'draft-js-video-plugin';
import {hashtagStrategy, findLinkEntities, findVideoEntities, findImageEntities} from './entities/media_handler';
import {stateToHTML} from 'draft-js-export-html';


const Link = (props) => {
  const url = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url.href} target="_blank">
      {url.href}
    </a>
  );
};

const Image = (props) => {
  const url = props.contentState.getEntity(props.entityKey).getData();
  return (
    <img src={url.src}>
    </img>
  );
};

const Video = (props) => {
  const url = props.contentState.getEntity(props.entityKey).getData();
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
  const [isEditable, setisEditable] = useState(false);
  const [posts, setPosts] = useState([]);
  const [editorState, setEditorState] = useState([]);
  const [postId, setPostId] = useState([]);

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


  useEffect(() => {
    const headers = { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff'}

      axios.get('http://localhost:8000/get_posts')
        .then(
          (result) => {
            setPosts(result.data.posts);
          },
          (error) => {
          }
      )
  }, [])

  const SubmitPost = async ()=> {
      const content = editorState.getCurrentContent();
      const content_convert = convertToRaw(content);
      saveContent(content_convert);
      setisEditable(false);
      const html_data = stateToHTML(editorState.getCurrentContent())
      const json_data = JSON.stringify(content_convert)

    const res = await axios.put('http://localhost:8000/update_post/'+ postId, { "json_data":json_data,"html_data": html_data })

    await new Promise(res => {
        setTimeout(() => {
          res();
        }, 300);
      });

      setPosts(res.data.data);
  }

  const saveContent = (content) => {
        localStorage.setItem('content', JSON.stringify(content));
  }
  
  const editPost = async (e) =>{
    setPostId(e.target.id);
    const res = await fetch('http://localhost:8000/get_posts?post_id='+e.target.id)
    .then(val => val.json())

    await new Promise(res => {
        setTimeout(() => {
          res();
        }, 300);
      });
      
      const result = res.posts[0].json_data
      const _editorState =  JSON.parse(result);
      const new_editorState =  EditorState.createWithContent(convertFromRaw(_editorState), decorator);
      setEditorState(new_editorState)
   
    setisEditable(true);
  }

  const onChange = editorState => {
    setEditorState(editorState);
  };

  return (
        <div>
                {isEditable ?
                      <div className="editors ">
                        <p className="edit_pencil" onClick={SubmitPost}>Save</p>
                          <Editor 
                          editorState={editorState}
                          onChange={onChange} />
                       </div> 
                : 
                <div>
                  {posts.map(item => (
                      <div className="profile-page">
                        
                          <span className="edit_pencil"  onClick={editPost} id={item.id}>&#9998;</span>
                          <div className="content_block">
                            <p dangerouslySetInnerHTML={{__html: item.html_data}}></p>
                          </div>
                        
                      </div>            
                  ))}
                </div>
              }
        </div>
    );
}

export default Posts;
