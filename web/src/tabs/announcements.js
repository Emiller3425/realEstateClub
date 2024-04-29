import React, { useState, useRef } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';

function Announcements() {
  const [editorState, setEditorState] = useState(() => {
    const initialState = EditorState.createEmpty();
    console.log('Initial editor state:', initialState.getCurrentContent().getPlainText());
    return initialState;
  });
  const editorRef = useRef(null);

  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);
  const [underlineActive, setUnderlineActive] = useState(false);

  const handleInlineStyleToggle = (inlineStyle) => {
    editorRef.current.focus(); // Add this line to focus the editor:wwq
    const newState = RichUtils.toggleInlineStyle(editorState, inlineStyle);
    console.log('New editor state after inline style change:', newState.getCurrentContent().getPlainText());
    setEditorState(newState);

    if (inlineStyle === 'BOLD') {
      setBoldActive(!boldActive);
    } else if (inlineStyle === 'ITALIC') {
      setItalicActive(!italicActive);
    } else if (inlineStyle === 'UNDERLINE') {
      setUnderlineActive(!underlineActive);
    }
  };

  const handleFontSizeChange = (e) => {
    const fontSize = e.target.value;
    const newState = RichUtils.toggleInlineStyle(editorState, `FONT_SIZE_${fontSize}`);
    console.log('New editor state after font size change:', newState.getCurrentContent().getPlainText());
    setEditorState(newState);
  };

  return (
    <div className="p-4">
      <div className="flex items-center space-x-4">
        <button className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${boldActive ? 'text-white' : ''}`} onClick={() => handleInlineStyleToggle('BOLD')}>Bold</button>
        <button className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${italicActive ? 'text-white' : ''}`} onClick={() => handleInlineStyleToggle('ITALIC')}>Italic</button>
        <button className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${underlineActive ? 'text-white' : ''}`} onClick={() => handleInlineStyleToggle('UNDERLINE')}>Underline</button>
        <select className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onChange={handleFontSizeChange}>
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
        </select>
      </div>
      <div className="border border-gray-400 p-4 mt-4">
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={(newState) => {
            console.log('Current editor state:', newState.getCurrentContent().getPlainText());
            setEditorState(newState);
          }}
        />
      </div>
      <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => console.log('Creating announcement:', editorState.getCurrentContent().getPlainText())}>
        Post Announcement
      </button>
    </div>
  );
}

export default Announcements;