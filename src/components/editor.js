import React, {useState} from 'react';
import axios from 'axios';
import createHashtagPlugin from 'draft-js-hashtag-plugin';
import {Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, AtomicBlockUtils} from 'draft-js';
import createImagePlugin from "draft-js-image-plugin";


function getCurrentBlock(editorState) {
    const currentSelection = editorState.getSelection();
    const blockKey = currentSelection.getStartKey();
    return(editorState.getCurrentContent().getBlockForKey(blockKey));
}

function getCurrentLetter(editorState) {
    const currentBlock = getCurrentBlock(editorState);
    const blockText = currentBlock.getText();
    return blockText[editorState.getSelection().getStartOffset() - 1];
}

const imagePlugin = createImagePlugin();
const plugins = [imagePlugin];

function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'image'
      );
    },
    callback
  );
}

const Link = (props) => {
  const url = props.contentState.getEntity(props.entityKey).getData();
  console.log('url =', url.src)
  return (
    <img src={url.src}>
    </img>
  );
};


function TextEditor() {
  const content = window.localStorage.getItem('content');
  const hashtagPlugin = createHashtagPlugin();


  const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const onChange = (newEditorState) => {
        const letter = getCurrentLetter(newEditorState);
        if (getCurrentBlock(newEditorState).getText().length > 9) {
            setEditorState(editorState);
            return;
        } 
        setEditorState(newEditorState)
    }

    const saveContent = (content) => {
        localStorage.setItem('content', JSON.stringify(content));
    }


    const onSubmit = function() {
      const content =editorState.getCurrentContent();
      const content_convert = convertToRaw(content);
      saveContent(content_convert);
      
      const headers = { 'Content-Type': 'application/json',
                      'Authorization': 'Token 6942a1b7870abe1f77654b1230688635f0363245'}
      const _content = content_convert
      const calories = 500
      axios.post('http://localhost:8000/add_meal/',{_content , calories},{headers})
      .then(function (response) {
          console.log(response.status);
      })
      .catch(function (error) {
        console.log(error);
      });
    }

    const onAddImage = (event) => {
      const urlValue = window.prompt("Paste Image Link");
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        "image",
        "IMMUTABLE",
        {src : urlValue}
      );

      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = EditorState.set(
        editorState,
        { currentContent: contentStateWithEntity },
        "create-entity"
      );

      setEditorState({
          editorState: AtomicBlockUtils.insertAtomicBlock(
            newEditorState,
            entityKey,
            " "
          )
        })
    };


    let className = 'RichEditor-editor';
    return (
        <div>
          <h2>Create Posts</h2>
          <div className="RichEditor-root">
            <p onClick={()=> onAddImage()}>Image</p>
            <div className={className}>
              
              <Editor
                editorState={editorState}
                onChange={onChange} 
                plugins={plugins}
                placeholder="Tell a story..."
                />
            </div>
            
          </div>
          <button tyoe="submit" onClick={()=> onSubmit()}>Post</button>
        </div>
    );
}

export default TextEditor;