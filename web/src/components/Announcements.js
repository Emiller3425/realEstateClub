import React, { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import BeatLoader from 'react-spinners/BeatLoader';

const INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
];

const createEditorState = (content = '') => {
    if (content) {
        return EditorState.createWithContent(ContentState.createFromText(content));
    }
    return EditorState.createEmpty();
};

const Announcement = ({ announcement, adminAccess, deleteAnnouncement }) => {
  if (!announcement || !announcement.id || !announcement.title || typeof announcement.content !== 'string') {
      console.error("Invalid announcement data passed to Announcement component:", announcement);
      return <div className="text-red-500 p-4">Error: Invalid announcement data.</div>;
  }

  return (
    <div
      className="mb-4 p-4 border-b border-gray-300 w-full"
      style={{ fontFamily: "Gill Sans, sans-serif" }}
    >
      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-0 break-words">{announcement.title}</h1>
        <div className="text-right text-xs sm:text-sm flex-shrink-0 ml-2">
          <span className="text-gray-500 block mb-1 sm:mb-0 sm:mr-2">
            {announcement.timestamp ? new Date(announcement.timestamp).toLocaleString() : 'No date'}
          </span>
          {adminAccess && (
            <button
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs mt-1 sm:mt-0"
              onClick={() => deleteAnnouncement(announcement.id)}
              aria-label={`Delete announcement titled ${announcement.title}`}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-gray-700 whitespace-pre-wrap break-words">{announcement.content}</p>
    </div>
  );
};

export default function Announcements({ adminAccess }) {
  const [editorState, setEditorState] = useState(() => createEditorState());
  const [announcements, setAnnouncements] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState('');
  const editorRef = useRef(null);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [emails, setEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [errorAnnouncements, setErrorAnnouncements] = useState(null);
  const [errorEmails, setErrorEmails] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [isDeletingEmail, setIsDeletingEmail] = useState(null);
  const [addEmailError, setAddEmailError] = useState(null);

  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5001/api'
    : (window.location.hostname === 'gvsurealestateclub.com'
      ? 'https://gvsurealestateclub.com/api'
      : 'https://real-estate-club.vercel.app/api');

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    setErrorAnnouncements(null);
    console.log(`Workspaceing announcements from ${API_URL}/announcements using POST`);
    try {
      const response = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      console.log(`Workspace announcements response status: ${response.status}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No announcements found (404 response).');
          setAnnouncements([]);
        } else {
          let errorText = `Network response was not ok: ${response.status} ${response.statusText}`;
          try {
              const errorData = await response.text();
              errorText += `. ${errorData}`;
          } catch (e) { /* Ignore */ }
          throw new Error(errorText);
        }
      } else {
         const contentType = response.headers.get("content-type");
         if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data && data.error) {
               console.error("API returned error in JSON response:", data.error);
               setErrorAnnouncements(`API Error: ${data.error}`);
               setAnnouncements([]);
            } else if (Array.isArray(data)) {
               setAnnouncements(data);
               console.log(`Workspaceed ${data.length} announcements.`);
            } else {
               console.error("Unexpected JSON format received for announcements:", data);
               setErrorAnnouncements("Received unexpected data format for announcements.");
               setAnnouncements([]);
            }
         } else {
           console.warn("Received non-JSON response for announcements.");
           setAnnouncements([]);
         }
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setErrorAnnouncements(`Failed to load announcements. Please try again later. (${error.message})`);
      setAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [API_URL]);


  const fetchEmails = async () => {
      if (!adminAccess) {
          setEmails([]);
          setErrorEmails(null);
          setLoadingEmails(false);
          return;
      }

      setLoadingEmails(true);
      setErrorEmails(null);
      console.log(`Workspaceing emails from ${API_URL}/emails`);
      try {
          const response = await fetch(`${API_URL}/emails`, {
            headers: { 'Accept': 'application/json' },
          });
          console.log(`Workspace emails response status: ${response.status}`);

          if (!response.ok) {
             let errorText = `Network response was not ok: ${response.status} ${response.statusText}`;
             try {
                 const errorData = await response.text();
                 errorText += `. ${errorData}`;
             } catch (e) { /* Ignore */ }
             throw new Error(errorText);
          }

          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
             const data = await response.json();
             if (Array.isArray(data)) {
                const emailList = data.map(item => typeof item === 'object' ? item.email : item).filter(Boolean);
                setEmails(emailList);
                console.log(`Workspaceed ${emailList.length} emails.`);
             } else {
                console.error("Unexpected JSON format received for emails:", data);
                setErrorEmails("Received unexpected data format for emails.");
                setEmails([]);
             }
          } else {
            console.warn("Received non-JSON response for emails.");
            setEmails([]);
          }

      } catch (error) {
          console.error('Error fetching emails:', error);
          setErrorEmails(`Failed to load email list. (${error.message})`);
          setEmails([]);
      } finally {
          setLoadingEmails(false);
      }
  };

  useEffect(() => {
    if (adminAccess) {
        fetchEmails();
    } else {
        setEmails([]);
        setErrorEmails(null);
        setLoadingEmails(false);
    }
  }, [adminAccess, API_URL]);


  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const handleInlineStyleToggle = (inlineStyle) => {
    setEditorState((prevState) => RichUtils.toggleInlineStyle(prevState, inlineStyle));
  };

  const handleKeyCommand = (command, currentEditorState) => {
    const newState = RichUtils.handleKeyCommand(currentEditorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const mapKeyToEditorCommand = (e) => {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(e, editorState, 4);
      if (newEditorState !== editorState) {
        setEditorState(newEditorState);
      }
      return 'tab';
    }
    return getDefaultKeyBinding(e);
  };

  const handleEditorChange = (newState) => {
    setEditorState(newState);
  };

  const currentInlineStyle = editorState.getCurrentInlineStyle();

  const handlePostAnnouncement = async () => {
    const contentPlainText = editorState.getCurrentContent().getPlainText('\u0001').trim();
    const currentTitle = title.trim();

    if (!currentTitle || !contentPlainText) {
      alert('Title and announcement content cannot be empty.');
      return;
    }

    console.log("Posting new announcement...");
    try {
      const response = await fetch(`${API_URL}/new-announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTitle,
          content: contentPlainText,
        }),
      });

      if (!response.ok) {
          let errorText = `Failed to post announcement: ${response.status} ${response.statusText}`;
          try {
              const errorData = await response.text();
              errorText += `. ${errorData}`;
          } catch (e) { /* Ignore */ }
          throw new Error(errorText);
      }

      const result = await response.json();
      console.log("Post announcement successful:", result);

      setEditorState(createEditorState());
      setShowEditor(false);
      setTitle('');
      alert('Posted New announcement successfully');

      await fetchAnnouncements();

    } catch (error) {
      console.error('Error posting announcement:', error);
      alert(`Failed to post announcement: ${error.message}`);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this announcement? This action cannot be undone.`)) {
      return;
    }

    console.log(`Deleting announcement with ID: ${id}`);
    try {
      const response = await fetch(`${API_URL}/delete-announcement/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
          let errorText = `Failed to delete announcement: ${response.status} ${response.statusText}`;
          try {
              const errorData = await response.text();
              errorText += `. ${errorData}`;
          } catch (e) { /* Ignore */ }
          throw new Error(errorText);
      }

      console.log("Delete announcement successful, refetching list...");
      alert('Deleted announcement successfully.');

       await fetchAnnouncements();

    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert(`Failed to delete announcement: ${error.message}`);
    }
  };


  const handleAddEmail = async (e) => {
    e.preventDefault();
    const emailToAdd = newEmail.trim();

    if (!emailToAdd || !/\S+@\S+\.\S+/.test(emailToAdd)) {
      setAddEmailError('Please enter a valid email address.');
      return;
    }

    setIsAddingEmail(true);
    setAddEmailError(null);

    try {
      const response = await fetch(`${API_URL}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToAdd }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result?.error || `Failed to add email (${response.status})`;
        throw new Error(errorMessage);
      }

      console.log("Add email successful:", result);
      setNewEmail('');
      alert(`Email "${result.email || emailToAdd}" added successfully.`);
      await fetchEmails();

    } catch (error) {
      console.error('Error adding email:', error);
      setAddEmailError(error.message);
    } finally {
      setIsAddingEmail(false);
    }
  };

  const handleDeleteEmail = async (emailToDelete) => {
      if (!window.confirm(`Are you sure you want to delete the email "${emailToDelete}"?`)) {
          return;
      }

      setIsDeletingEmail(emailToDelete);

      try {
          const response = await fetch(`${API_URL}/emails`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: emailToDelete }),
          });

          const result = await response.json();

          if (!response.ok) {
              const errorMessage = result?.error || `Failed to delete email (${response.status})`;
              throw new Error(errorMessage);
          }

          console.log("Delete email successful:", result);
          alert(`Email "${result.email || emailToDelete}" deleted successfully.`);
          await fetchEmails();

      } catch (error) {
          console.error('Error deleting email:', error);
          alert(`Failed to delete email: ${error.message}`);
      } finally {
          setIsDeletingEmail(null);
      }
  };

   const copyEmailsToClipboard = () => {
      if (emails.length === 0) {
        alert("No emails to copy.");
        return;
      }
      const emailString = emails.join(', ');
      navigator.clipboard.writeText(emailString)
         .then(() => {
            alert('Emails copied to clipboard!');
         })
         .catch(err => {
            console.error('Failed to copy emails: ', err);
            alert('Failed to copy emails. You might need to grant clipboard permission.');
         });
   };


  if (loadingAnnouncements) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BeatLoader color="#008cf0" size={15} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full">

      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Announcements</h2>
      {errorAnnouncements && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errorAnnouncements}</span>
        </div>
      )}

      <div className="mb-6">
        {!loadingAnnouncements && announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements
              .sort((a, b) => {
                  try {
                      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                      if (isNaN(timeA) || isNaN(timeB)) return 0;
                      return timeB - timeA;
                  } catch (e) {
                      console.error("Error parsing timestamp for sorting", e);
                      return 0;
                  }
              })
              .map((announcement) => (
                announcement && announcement.id ? (
                  <Announcement
                    key={announcement.id}
                    announcement={announcement}
                    adminAccess={adminAccess}
                    deleteAnnouncement={deleteAnnouncement}
                  />
                ) : null
              ))}
          </div>
        ) : (
          !loadingAnnouncements && !errorAnnouncements && <p className="text-gray-500 italic">No announcements posted yet.</p>
        )}
      </div>

      {adminAccess && (
        <section className="mt-8 space-y-6">
          <div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out transform hover:scale-105 shadow-sm"
                onClick={() => setShowEditor(!showEditor)}
                aria-expanded={showEditor}
                aria-controls="announcement-editor"
              >
                {showEditor ? 'Cancel Announcement' : 'Create New Announcement'}
              </button>
          </div>

          {showEditor && (
            <div id="announcement-editor" className="p-4 md:p-6 border border-gray-300 rounded-md shadow-md bg-gray-50">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Create New Announcement</h3>
              <div className="mb-4">
                <label htmlFor="announcementTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  id="announcementTitle"
                  type="text"
                  placeholder="Enter announcement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                  aria-required="true"
                />
              </div>
              <div className="flex items-center space-x-2 mb-2 border-b pb-2">
                 <span className="text-sm font-medium text-gray-700 mr-2">Format:</span>
                 {INLINE_STYLES.map(({ label, style }) => (
                    <button
                       key={style}
                       type="button"
                       className={`px-3 py-1 rounded text-sm font-semibold transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 ${
                       currentInlineStyle.has(style)
                           ? 'bg-blue-600 text-white'
                           : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                       }`}
                       onMouseDown={(e) => {
                          e.preventDefault();
                          handleInlineStyleToggle(style);
                       }}
                       aria-pressed={currentInlineStyle.has(style)}
                    >
                       {label}
                    </button>
                 ))}
              </div>
              <div className="mb-4">
                 <label htmlFor="announcementContentEditor" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                 <div
                   id="announcementContentEditor"
                   className="border border-gray-300 rounded-md p-2 min-h-[150px] bg-white cursor-text shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500"
                   onClick={focusEditor}
                 >
                   <Editor
                     placeholder="Enter announcement details here..."
                     ref={editorRef}
                     editorState={editorState}
                     onChange={handleEditorChange}
                     handleKeyCommand={handleKeyCommand}
                     keyBindingFn={mapKeyToEditorCommand}
                     aria-label="Announcement content editor"
                   />
                 </div>
              </div>
              <button
                type="button"
                className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                onClick={handlePostAnnouncement}
                disabled={!title.trim() || !editorState.getCurrentContent().hasText()}
              >
                Post Announcement
              </button>
            </div>
          )}

          <div className="p-4 md:p-6 border border-gray-300 rounded-md shadow-md bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Manage Email List</h3>
                {emails.length > 0 && (
                  <button
                      onClick={copyEmailsToClipboard}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-md shadow-sm transition duration-150 ease-in-out disabled:opacity-50"
                      disabled={loadingEmails}
                      aria-label="Copy all emails to clipboard"
                  >
                     Copy Emails
                  </button>
                )}
            </div>

            <form onSubmit={handleAddEmail} className="mb-4 flex items-start space-x-2">
              <div className="flex-grow">
                  <label htmlFor="new-email-input" className="sr-only">New Email Address</label>
                  <input
                      id="new-email-input"
                      type="email"
                      placeholder="Enter email to add"
                      value={newEmail}
                      onChange={(e) => {
                          setNewEmail(e.target.value);
                          if (addEmailError) setAddEmailError(null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                      aria-required="true"
                      disabled={isAddingEmail}
                      aria-describedby="add-email-error-msg"
                  />
                   {addEmailError && <p id="add-email-error-msg" className="text-red-500 text-xs mt-1">{addEmailError}</p>}
              </div>
              <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-wait flex items-center justify-center min-w-[90px]"
                  disabled={isAddingEmail || !newEmail.trim() || !/\S+@\S+\.\S+/.test(newEmail.trim())}
              >
                  {isAddingEmail ? (
                      <BeatLoader color="#ffffff" size={8} />
                  ) : (
                      'Add Email'
                  )}
              </button>
            </form>

            {errorEmails && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3" role="alert">
                    <strong className="font-bold">Error loading emails:</strong>
                    <span className="block sm:inline"> {errorEmails}</span>
                </div>
             )}

            {loadingEmails && emails.length === 0 ? (
              <div className="flex justify-center items-center min-h-[50px]">
                <BeatLoader color="#008cf0" size={10} />
              </div>
            ) : emails.length > 0 ? (
              <ul className="list-none max-h-60 overflow-y-auto bg-white p-3 rounded border border-gray-200 shadow-sm space-y-1">
                  {emails
                    .slice()
                    .sort((a, b) => a.localeCompare(b))
                    .map((email) => (
                      <li key={email} className="flex justify-between items-center p-1 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                          <span className="text-gray-700 text-sm break-all mr-2 flex-grow">{email}</span>
                          <button
                              onClick={() => handleDeleteEmail(email)}
                              className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-wait p-1 rounded focus:outline-none focus:ring-1 focus:ring-red-400 flex-shrink-0"
                              aria-label={`Delete email ${email}`}
                              disabled={isDeletingEmail === email}
                          >
                              {isDeletingEmail === email ? (
                                  <BeatLoader color="#ef4444" size={5} />
                              ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                              )}
                          </button>
                      </li>
                  ))}
                </ul>
            ) : (
              !loadingEmails && !errorEmails && <p className="text-gray-500 italic">No registered emails found.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}