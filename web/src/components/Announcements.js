import React, { useRef, useState, useEffect } from 'react';
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
  const [fontSize, setFontSize] = useState(FONT_SIZES[0].value);
  const [announcements, setAnnouncements] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState(''); // State to store the title
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('http://localhost:5001/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleInlineStyleToggle = (inlineStyle) => {
    setEditorState((prevState) => RichUtils.toggleInlineStyle(prevState, inlineStyle));
    focusEditor();
  };

  const handleFontSizeChange = (event) => {
    const newFontSize = event.target.value;
    setFontSize(newFontSize);
    setEditorState((prevState) => RichUtils.toggleInlineStyle(prevState, `FONT_SIZE_${newFontSize}`));
    focusEditor();
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

  const handleEditorChange = (newState) => {
    setEditorState(newState);
  };

  const currentInlineStyle = editorState.getCurrentInlineStyle();

  const handlePostAnnouncement = async () => {
    try {
      const response = await fetch('http://localhost:5001/new-announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          content: editorState.getCurrentContent().getPlainText(),
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setAnnouncements(data);

      setEditorState(initialEditorState);
      setShowEditor(false);
      setTitle(''); // Reset title after posting
    } catch (error) {
      console.error('Error posting announcement:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold">Announcements</h2>
        {announcements.length > 0 ? (
          <ul>
            {announcements.map((announcement, index) => (
              <li key={index}>{JSON.stringify(announcement)}</li>
            ))}
          </ul>
        ) : (
          <p>No announcements found.</p>
        )}
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={() => setShowEditor(!showEditor)}
      >
        {showEditor ? 'Cancel' : 'New Announcement'}
      </button>
      {showEditor && (
        <>
        <div className="mb-4">
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            {INLINE_STYLES.map(({ label, style }) => (
              <button
                key={style}
                className={`${
                  currentInlineStyle.has(style) ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-700'
                } text-white font-bold py-2 px-4 rounded`}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent losing focus
                  handleInlineStyleToggle(style);
                }}
              >
                {label}
              </button>
            ))}
            <select
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              value={fontSize}
              onChange={handleFontSizeChange}
            >
              {FONT_SIZES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="border border-gray-400 p-4 mt-4 h-64 overflow-y-auto">
            <Editor
              ref={editorRef}
              editorState={editorState}
              onChange={handleEditorChange}
              handleKeyCommand={handleKeyCommand}
              keyBindingFn={mapKeyToEditorCommand}
            />
          </div>
          <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handlePostAnnouncement}>
    Post Announcement
  </button>
        </>
      )}
    </div>
  );
}
