"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const firebaseconfig = require('./firebaseconfig');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5001;

// Enable CORS for the frontend origin
app.use(cors({
    origin: 'http://localhost:3000', // Allow your frontend origin
}));

// Middleware to parse JSON requests
app.use(bodyParser.json());

/**
 * POST /webhook
 * Fetch all documents from the 'announcements' collection in Firestore.
 */
app.post('/webhook', async (req, res) => {
    try {
        const announcementsRef = firebaseconfig.db.collection('announcements');
        const snapshot = await announcementsRef.get();

        if (snapshot.empty) {
            res.status(404).json({ error: 'No announcements found' });
            return;
        }

        const announcements = [];
        snapshot.forEach(doc => {
            announcements.push({ id: doc.id, ...doc.data() });
        });

        res.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

/**
 * POST /new-announcement
 * Add a new announcement to the 'announcements' collection in Firestore.
 */
app.post('/new-announcement', async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(400).json({ error: 'Title and content are required' });
            return;
        }

        const newAnnouncementRef = firebaseconfig.db.collection('announcements').doc();
        const currentDate = new Date();
        const formattedTimestamp = currentDate.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false // Use 24-hour format
        });
        
        await newAnnouncementRef.set({
            title,
            content,
            timestamp: formattedTimestamp,
        });

        res.status(201).json({ message: 'Announcement added successfully' });
    } catch (error) {
        console.error('Error adding announcement:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('Forcing shutdown');
        process.exit(1);
    }, 10000);
};

// Handle termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
