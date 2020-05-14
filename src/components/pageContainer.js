import React from "react";
import { EditorState, RichUtils, AtomicBlockUtils, convertToRaw, convertFromRaw, CompositeDecorator } from "draft-js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {Editor} from 'draft-js';
import createImagePlugin from "draft-js-image-plugin";
import createVideoPlugin from 'draft-js-video-plugin';
import "../App.css";
import {hashtagStrategy, findLinkEntities, findVideoEntities, findImageEntities} from './entities/media_handler';

const imagePlugin = createImagePlugin();
const videoPlugin = createVideoPlugin();

const plugins = [imagePlugin, videoPlugin];

const Image = (props) => {
  const url = props.contentState.getEntity(props.entityKey).getData();
  console.log('url =', url.src)
  return (
    <img src={url.src}>
    </img>
  );
};

const Link = (props) => {
  const url = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={url.href} target="_blank">
      {url.href}
    </a>
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

class PageContainer extends React.Component {
  constructor(props) {
      super(props);
      let editorState;
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
       this.state = {
              editorState: EditorState.createWithContent(convertFromRaw(_editorState), decorator)
            };
      
  }


  onChange = editorState => {
    this.setState({
      editorState
    });
  };


  handleKeyCommand = command => {
    const newState = RichUtils.handleKeyCommand(
      this.state.editorState,
      command
    );
    if(newState) {
      this.onChange(newState);
      return "handled";
    }
    return "not-handled";
  }

  onSubmit = ()=> {
    const editorState = this.state.editorState;
      const content = editorState.getCurrentContent();
      const content_convert = convertToRaw(content);
      this.saveContent(content_convert);
      
  }


   saveContent = (content) => {
        localStorage.setItem('content', JSON.stringify(content));
  }

  onAddMedia = (type) => {
    const editorState = this.state.editorState;
    const urlValue = window.prompt("Paste Link");
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      type,
      "IMMUTABLE",
      {src : urlValue}
    );

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(
      editorState,
      { currentContent: contentStateWithEntity },
      "create-entity"
    );

    this.setState(
      {
        editorState: AtomicBlockUtils.insertAtomicBlock(
          newEditorState,
          entityKey,
          " "
        )
      }
    );
  };

  onUnderlineClick = () => {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, "UNDERLINE")
    );
  };
  onBoldClick = () => {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, "BOLD"));
  };

  onItalicClick = () => {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, "ITALIC")
    );
  };

  render() {
    return(
      <div className="editorContainer">
        <div className="menuButtons">
          <button onClick={this.onUnderlineClick}>U</button>
          <button onClick={this.onBoldClick}>
            <b>B</b>
          </button>
          <button onClick={this.onItalicClick}>
            <em>I</em>
          </button>
          <button className="inline styleButton" onClick={() =>this.onAddMedia('video')}>
             <i className="fa fa-spinner">video</i>
          </button>
          <button className="inline styleButton" onClick={() =>this.onAddMedia('image')}>
            image
          </button>
        </div>
        <div className="editors">
          <Editor
            placeholder="Tell a story..."
            editorState={this.state.editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            plugins={plugins}
          />
        </div>
         <button tyoe="submit" onClick={this.onSubmit}>Post</button>
      </div>
    )
  }
}

export default PageContainer;
