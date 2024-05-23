import React, { useRef, useState } from 'react';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding } from 'draft-js';
import 'draft-js/dist/Draft.css';

const INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
];

const FONT_SIZES = [
  { value: '12', label: '12' },
  { value: '14', label: '14' },
  { value: '16', label: '16' },
  { value: '18', label: '18' },
  { value: '20', label: '20' },
];

const initialEditorState = EditorState.createEmpty();

export default function Announcements() {
  const [editorState, setEditorState] = useState(initialEditorState);
  const [fontSize, setFontSize] = useState(FONT_SIZES[0].value); // Manage font size state
  const editorRef = useRef(null);

  const handleInlineStyleToggle = (inlineStyle) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const handleFontSizeChange = (event) => {
    const newFontSize = event.target.value;
    setFontSize(newFontSize);
    setEditorState(RichUtils.toggleInlineStyle(editorState, `FONT_SIZE_${newFontSize}`));
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return true;
    }
    return false;
  };

  const mapKeyToEditorCommand = (e) => {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(e, editorState, 4 /* maxDepth */);
      if (newEditorState !== editorState) {
        setEditorState(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  };

  return (
    <div className="p-4">
      <div className="flex items-center space-x-4">
        {INLINE_STYLES.map(({ label, style }) => (
          <button
            key={style}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${editorState.getCurrentInlineStyle().has(style) ? 'text-white' : ''}`}
            onClick={() => handleInlineStyleToggle(style)}
          >
            {label}
          </button>
        ))}
        <select
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          value={fontSize} // Use the value prop
          onChange={handleFontSizeChange}
        >
          {FONT_SIZES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="border border-gray-400 p-4 mt-4">
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={(newState) => {
            setEditorState(newState);
          }}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={mapKeyToEditorCommand}
        />
      </div>
      <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Post Announcement
      </button>
    </div>
  );
}