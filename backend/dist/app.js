"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const { db, bucket } = require('./firebaseconfig');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 5001;

// Enable CORS for the frontend origin
app.use(cors({
   origin: ['http://localhost:3000', 'https://realestateclubgvsu.com', 'https://real-estate-club.vercel.app'], // Allow your frontend origin
}));

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Middleware to handle multipart/form-data
const upload = multer({ storage: multer.memoryStorage() });

// Prefix all routes with /api

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../web/build')));

// The "catchall" handler: for any request that doesn't match any route, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../web/build', 'index.html'));
});

// Fetch all resources
app.get('/api/resources', async (req, res) => {
    try {
        const resourcesRef = db.collection('resources');
        const snapshot = await resourcesRef.orderBy('timestamp', 'asc').get();

        if (snapshot.empty) {
            console.log('No resources found');
            res.status(404).json({ error: 'No resources found' });
            return;
        }

        const resources = [];
        snapshot.forEach(doc => {
            resources.push({ id: doc.id, ...doc.data() });
        });

        res.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

// Add a new resource
app.post('/api/new-resource', upload.single('file'), async (req, res) => {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const { name, description } = req.body;
    const file = req.file;

    if (!name || !description || !file) {
        console.log('Missing required fields: name, description, or file');
        res.status(400).json({ error: 'Name, description, and file are required' });
        return;
    }

    const blob = bucket.file(`resources/${file.originalname}`);
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: file.mimetype
        }
    });

    blobStream.on('error', (err) => {
        console.error('Error uploading file:', err);
        res.status(500).json({ error: "Internal Error" });
    });

    blobStream.on('finish', async () => {
        try {
            const fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            await blob.makePublic();

            const newResourceRef = db.collection('resources').doc();
            const timestamp = new Date();

            await newResourceRef.set({
                name,
                description,
                fileUrl,
                timestamp
            });

            res.status(201).json({ message: 'Resource added successfully' });
        } catch (err) {
            console.error('Error finalizing resource upload:', err);
            res.status(500).json({ error: "Internal Error" });
        }
    });

    blobStream.end(file.buffer);
});

// Delete a resource
app.delete('/api/delete-resource/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resourceRef = db.collection('resources').doc(id);
        const resourceDoc = await resourceRef.get();

        if (!resourceDoc.exists) {
            console.log('Resource not found:', id);
            res.status(404).json({ error: 'Resource not found' });
            return;
        }

        const resourceData = resourceDoc.data();
        const fileUrl = resourceData.fileUrl;
        const fileName = fileUrl.split('/').pop().split('?')[0];

        await resourceRef.delete();
        const file = bucket.file(`resources/${fileName}`);
        await file.delete();

        res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});


/**
 * POST /api/announcements
 * Fetch all documents from the 'announcements' collection in Firestore.
 */
app.post('/api/announcements', async (req, res) => {
    try {
        const announcementsRef = db.collection('announcements');
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
 * POST /api/new-announcement
 * Add a new announcement to the 'announcements' collection in Firestore.
 */
app.post('/api/new-announcement', async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(400).json({ error: 'Title and content are required' });
            return;
        }

        const newAnnouncementRef = db.collection('announcements').doc();
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
 * DELETE /api/delete-announcement/:id
 * Delete an announcement from the 'announcements' collection in Firestore.
 */
app.delete('/api/delete-announcement/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const announcementRef = db.collection('announcements').doc(id);
        await announcementRef.delete();

        // Fetch updated list of announcements
        const announcementsRef = db.collection('announcements');
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
 * POST /api/get-admin-password
 * Fetch the admin password from the 'userProfile' collection in Firestore.
 */
app.post('/api/get-admin-password', async (req, res) => {
    try {
        const userProfileRef = db.collection('userProfile').doc('adminAccount');
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
 * GET /api/home-content
 * Fetch the home content from the 'home' collection in Firestore.
 */
app.get('/api/home-content', async (req, res) => {
    try {
        const homeContentRef = db.collection('home').doc('homeContent');
        const ourMissionRef = db.collection('home').doc('ourMission');

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
 * POST /api/update-home-content
 * Update the home content in the 'home' collection in Firestore.
 */
app.post('/api/update-home-content', async (req, res) => {
    try {
        const { welcomeMessage, nextMeeting, mission } = req.body;

        const homeContentRef = db.collection('home').doc('homeContent');
        const ourMissionRef = db.collection('home').doc('ourMission');

        await homeContentRef.set({
            welcomeMessage, // Ensure welcomeMessage is being saved correctly
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

/**
 * GET /api/about
 * Fetch all documents from the 'about' collection in Firestore.
 */
app.get('/api/about', async (req, res) => {
    try {
        const aboutRef = db.collection('about');
        const snapshot = await aboutRef.get();

        if (snapshot.empty) {
            res.status(404).json({ error: 'No about content found' });
            return;
        }

        const aboutContent = [];
        let title = '';
        let content = '';

        snapshot.forEach(doc => {
            if (doc.id === 'aboutTitle') {
                title = doc.data().title;
                content = doc.data().content;
            } else {
                aboutContent.push({ id: doc.id, ...doc.data() });
            }
        });

        // Sort members by order field
        aboutContent.sort((a, b) => a.order - b.order);

        res.json({ title, content, members: aboutContent });
    } catch (error) {
        console.error('Error fetching about content:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

/**
 * POST /api/update-about-title
 * Update the about title and content in Firestore.
 */
app.post('/api/update-about-title', async (req, res) => {
    try {
        const { title, content } = req.body;
        const aboutTitleRef = db.collection('about').doc('aboutTitle');

        await aboutTitleRef.set({ title, content }, { merge: true });

        res.status(200).json({ message: 'About title updated successfully' });
    } catch (error) {
        console.error('Error updating about title:', error);
        res.status(500).json({ error: 'Internal Error' });
    }
});

/**
 * POST /api/new-member
 * Add a new member profile to Firestore.
 */
app.post('/api/new-member', upload.single('image'), async (req, res) => {
    try {
        const { name, title, email, description, order } = req.body;
        const file = req.file;

        if (!name || !title || !email || !description || !file) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        // Upload image to Firebase Storage
        const blob = bucket.file(`profiles/${file.originalname}`);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            console.error('Error uploading file:', err);
            res.status(500).json({ error: "Internal Error" });
        });

        blobStream.on('finish', async () => {
            const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            // Make the file publicly accessible
            await blob.makePublic();

            // Save the member profile to Firestore
            const newMemberRef = db.collection('about').doc();
            await newMemberRef.set({
                name,
                title,
                email,
                description,
                image: imageUrl,
                order: parseInt(order, 10) // Ensure order is saved as a number
            });

            const newMember = {
                id: newMemberRef.id,
                name,
                title,
                email,
                description,
                image: imageUrl,
                order: parseInt(order, 10)
            };

            res.status(201).json(newMember);
        });

        blobStream.end(file.buffer);
    } catch (error) {
        console.error('Error adding new member:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

/**
 * DELETE /api/delete-member/:id
 * Delete a member profile from Firestore and its associated image from Firebase Storage.
 */
app.delete('/api/delete-member/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const memberRef = db.collection('about').doc(id);
        const memberDoc = await memberRef.get();

        if (!memberDoc.exists) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }

        const memberData = memberDoc.data();
        const imageUrl = memberData.image;
        const fileName = imageUrl.split('/').pop().split('?')[0]; // Extract file name from URL

        // Delete the Firestore document
        await memberRef.delete();

        // Delete the associated image from Firebase Storage
        const file = bucket.file(`profiles/${fileName}`);
        await file.delete();

        res.status(200).json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

/**
 * POST /api/update-member
 * Update a member profile in Firestore.
 */
app.post('/api/update-member', upload.single('image'), async (req, res) => {
    try {
        const { id, name, title, email, description, order } = req.body;
        const file = req.file;

        if (!id || !name || !title || !email || !description || order === undefined) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const memberRef = db.collection('about').doc(id);
        const memberData = { name, title, email, description, order: parseInt(order, 10) };

        if (file) {
            // Upload new image to Firebase Storage
            const blob = bucket.file(`profiles/${file.originalname}`);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype
                }
            });

            blobStream.on('error', (err) => {
                console.error('Error uploading file:', err);
                res.status(500).json({ error: "Internal Error" });
            });

            blobStream.on('finish', async () => {
                const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

                // Make the file publicly accessible
                await blob.makePublic();

                memberData.image = imageUrl;
                await memberRef.update(memberData);

                res.status(200).json({ message: 'Member updated successfully' });
            });

            blobStream.end(file.buffer);
        } else {
            await memberRef.update(memberData);
            res.status(200).json({ message: 'Member updated successfully' });
        }
    } catch (error) {
        console.error('Error updating member:', error);
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
