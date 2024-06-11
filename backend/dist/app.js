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
app.post('/announcements', async (req, res) => {
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
        const formattedDate = currentDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

        const formattedTime = currentDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true, // Use 12-hour format with AM/PM
        });

        const formattedTimestamp = `${formattedDate} ${formattedTime}`;

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

/**
 * DELETE /delete-announcement/:id
 * Delete an announcement from the 'announcements' collection in Firestore.
 */
app.delete('/delete-announcement/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const announcementRef = firebaseconfig.db.collection('announcements').doc(id);
        await announcementRef.delete();

        // Fetch updated list of announcements
        const announcementsRef = firebaseconfig.db.collection('announcements');
        const snapshot = await announcementsRef.get();

        const announcements = [];
        snapshot.forEach(doc => {
            announcements.push({ id: doc.id, ...doc.data() });
        });

        res.json(announcements);
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

/**
 * POST /get-admin-password
 * Fetch the admin password from the 'userProfile' collection in Firestore.
 */
app.post('/get-admin-password', async (req, res) => {
    try {
        const userProfileRef = firebaseconfig.db.collection('userProfile').doc('adminAccount');
        const doc = await userProfileRef.get();

        if (!doc.exists) {
            res.status(404).json({ error: 'Admin account not found' });
            return;
        }

        const data = doc.data();
        res.json({ password: data.password });
    } catch (error) {
        console.error('Error fetching admin password:', error);
        res.status(500).json({ error: 'Internal Error' });
    }
});

/**
 * GET /home-content
 * Fetch the home content from the 'home' collection in Firestore.
 */
app.get('/home-content', async (req, res) => {
    try {
        const homeContentRef = firebaseconfig.db.collection('home').doc('homeContent');
        const ourMissionRef = firebaseconfig.db.collection('home').doc('ourMission');

        const [homeContentDoc, ourMissionDoc] = await Promise.all([homeContentRef.get(), ourMissionRef.get()]);

        if (!homeContentDoc.exists || !ourMissionDoc.exists) {
            res.status(404).json({ error: 'Home content not found' });
            return;
        }

        const homeContent = homeContentDoc.data();
        const ourMission = ourMissionDoc.data();

        res.json({
            welcomeMessage: homeContent.welcomeMessage,
            nextMeeting: {
                title: homeContent.title,
                content: homeContent.content
            },
            mission: {
                title: ourMission.title,
                content: ourMission.content
            }
        });
    } catch (error) {
        console.error('Error fetching home content:', error);
        res.status(500).json({ error: 'Internal Error' });
    }
});

/**
 * POST /update-home-content
 * Update the home content in the 'home' collection in Firestore.
 */
app.post('/update-home-content', async (req, res) => {
    try {
        const { welcomeMessage, nextMeeting, mission } = req.body;

        const homeContentRef = firebaseconfig.db.collection('home').doc('homeContent');
        const ourMissionRef = firebaseconfig.db.collection('home').doc('ourMission');

        await homeContentRef.set({
            title: nextMeeting.title,
            content: nextMeeting.content
        }, { merge: true });

        await ourMissionRef.set({
            title: mission.title,
            content: mission.content
        }, { merge: true });

        res.status(200).json({ message: 'Home content updated successfully' });
    } catch (error) {
        console.error('Error updating home content:', error);
        res.status(500).json({ error: 'Internal Error' });
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
