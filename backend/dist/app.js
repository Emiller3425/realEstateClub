"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const { db, bucket } = require('./firebaseconfig');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();
const path = require('path');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({
   origin: ['http://localhost:3000', 'https://realestateclubgvsu.com', 'https://real-estate-club.vercel.app'],
}));

app.use(bodyParser.json());

const upload = multer({ storage: multer.memoryStorage() });

let transporter;
if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD
        },
        tls: {
            // rejectUnauthorized: false
        }
    });

    transporter.verify((error, success) => {
        if (error) {
            console.error('Error verifying email transporter:', error);
            console.warn('Email notifications for announcements may fail. Check .env variables and Gmail App Password setup.');
        } else {
            console.log('Email transporter is ready to send messages');
        }
    });
} else {
    console.warn('GMAIL_EMAIL or GMAIL_APP_PASSWORD not found in .env file. Email notifications will be disabled.');
    transporter = null;
}

app.get('/api/syndication/overview', async (req, res) => {
    try {
        const overviewRef = db.collection('syndication_overview').doc('overview');
        const doc = await overviewRef.get();
        if (!doc.exists) {
            res.json({ text: '' });
            return;
        }
        const overview = doc.data();
        res.json(overview);
    } catch (error) {
        console.error('Error fetching overview:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

app.post('/api/syndication/overview', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            res.status(400).json({ error: 'Text is required' });
            return;
        }
        const overviewRef = db.collection('syndication_overview').doc('overview');
        await overviewRef.set({ text }, { merge: true });
        res.status(200).json({ message: 'Overview updated successfully' });
    } catch (error) {
        console.error('Error updating overview:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

app.get('/api/syndication/documents', async (req, res) => {
    try {
        const documentsRef = db.collection('syndication_documents');
        const snapshot = await documentsRef.orderBy('timestamp', 'asc').get();
        const documents = [];
        snapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

app.post('/api/syndication/documents', upload.single('file'), async (req, res) => {
    try {
        const { id, name, description } = req.body;
        const file = req.file;
        const timestamp = new Date();
        if (!name || !description) {
            res.status(400).json({ error: 'Name and description are required' });
            return;
        }
        let fileUrl = '';
        if (file) {
            const blob = bucket.file(`syndication_documents/${file.originalname}`);
            const blobStream = blob.createWriteStream({
                metadata: { contentType: file.mimetype }
            });
            blobStream.on('error', (err) => {
                console.error('Error uploading file:', err);
                res.status(500).json({ error: "Internal Error" });
            });
            blobStream.on('finish', async () => {
                fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                await blob.makePublic();
                const documentData = { name, description, fileUrl, timestamp };
                const docRef = id ? db.collection('syndication_documents').doc(id) : db.collection('syndication_documents').doc();
                await docRef.set(documentData, { merge: true });
                res.status(200).json({ message: 'Document added or updated successfully' });
            });
            blobStream.end(file.buffer);
        } else if (id) {
            await db.collection('syndication_documents').doc(id).set({ name, description, timestamp }, { merge: true });
            res.status(200).json({ message: 'Document updated successfully' });
        } else {
            res.status(400).json({ error: 'File is required for new documents' });
        }
    } catch (error) {
        console.error('Error adding or updating document:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

app.delete('/api/syndication/documents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('syndication_documents').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }
        const documentData = doc.data();
        const fileUrl = documentData.fileUrl;
        if (!fileUrl) {
            res.status(404).json({ error: 'File URL not found in document data' });
            return;
        }
        const fileName = fileUrl.split('/').pop();
        await docRef.delete();
        const file = bucket.file(`syndication_documents/${fileName}`);
        await file.delete();
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error.message);
        res.status(500).json({ error: "Internal Error - Delete document failed" });
    }
});

app.get('/api/syndication/read-throughs', async (req, res) => {
    try {
        const readThroughsRef = db.collection('syndication_read-throughs');
        const snapshot = await readThroughsRef.get();
        const readThroughs = [];
        snapshot.forEach(doc => {
            readThroughs.push({ id: doc.id, ...doc.data() });
        });
        res.json(readThroughs);
    } catch (error) {
        console.error('Error fetching read-throughs:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

app.post('/api/syndication/read-throughs', async (req, res) => {
    try {
        const { id, title, url } = req.body;
        if (!title || !url) {
            res.status(400).json({ error: 'Title and URL are required' });
            return;
        }
        const docRef = id ? db.collection('syndication_read-throughs').doc(id) : db.collection('syndication_read-throughs').doc();
        await docRef.set({ title, url }, { merge: true });
        res.status(200).json({ message: 'Read-through added or updated successfully' });
    } catch (error) {
        console.error('Error adding or updating read-through:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

app.delete('/api/syndication/read-throughs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('syndication_read-throughs').doc(id);
        await docRef.delete();
        res.status(200).json({ message: 'Read-through deleted successfully' });
    } catch (error) {
        console.error('Error deleting read-through:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

app.get('/api/syndication/watch-throughs', async (req, res) => {
    try {
        const watchThroughsRef = db.collection('syndication_watch-throughs');
        const snapshot = await watchThroughsRef.get();
        const watchThroughs = [];
        snapshot.forEach(doc => {
            watchThroughs.push({ id: doc.id, ...doc.data() });
        });
        res.json(watchThroughs);
    } catch (error) {
        console.error('Error fetching watch-throughs:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

app.post('/api/syndication/watch-throughs', async (req, res) => {
    try {
        const { id, title, url } = req.body;
        if (!title || !url) {
            res.status(400).json({ error: 'Title and URL are required' });
            return;
        }
        const docRef = id ? db.collection('syndication_watch-throughs').doc(id) : db.collection('syndication_watch-throughs').doc();
        await docRef.set({ title, url }, { merge: true });
        res.status(200).json({ message: 'Watch-through added or updated successfully' });
    } catch (error) {
        console.error('Error adding or updating watch-through:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

app.delete('/api/syndication/watch-throughs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('syndication_watch-throughs').doc(id);
        await docRef.delete();
        res.status(200).json({ message: 'Watch-through deleted successfully' });
    } catch (error) {
        console.error('Error deleting watch-through:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

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
        metadata: { contentType: file.mimetype }
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
            await newResourceRef.set({ name, description, fileUrl, timestamp });
            res.status(201).json({ message: 'Resource added successfully' });
        } catch (err) {
            console.error('Error finalizing resource upload:', err);
            res.status(500).json({ error: "Internal Error" });
        }
    });
    blobStream.end(file.buffer);
});

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

app.post('/api/announcements', async (req, res) => {
    try {
        const announcementsRef = db.collection('announcements');
        const snapshot = await announcementsRef.orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            res.json([]);
            return;
        }
        const announcements = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp;
            announcements.push({ id: doc.id, ...data, timestamp });
        });
        res.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: "Internal Server Error fetching announcements" });
    }
});

app.post('/api/new-announcement', async (req, res) => {
    let announcementId = null;
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const newAnnouncementRef = db.collection('announcements').doc();
        announcementId = newAnnouncementRef.id;

        const newAnnouncementData = {
            title,
            content,
            timestamp: new Date()
        };

        await newAnnouncementRef.set(newAnnouncementData);
        console.log(`Announcement ${announcementId} saved successfully.`);

        if (!transporter) {
            console.log(`Email transporter not configured. Skipping email notification for announcement ${announcementId}.`);
        } else {
            const emailsRef = db.collection('emails');
            const emailSnapshot = await emailsRef.get();
            const recipientEmails = [];
            if (!emailSnapshot.empty) {
                emailSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data && data.email) {
                        recipientEmails.push(data.email);
                    }
                });
            }

            const logoFilename = 'realEstateLogo.png';
            // IMPORTANT: Adjust this path relative to where your server script is running!
            // If 'assets' folder is in the same directory as this script:
            const logoPath = path.join(__dirname, 'images', logoFilename);
            console.log(logoPath);
            const logoCid = 'logo@realestateclub.gvsu';

            if (recipientEmails.length > 0) {
                console.log(`Preparing to send announcement email to ${recipientEmails.length} recipients.`);
                const mailOptions = {
                    from: `"GVSU Real Estate Club" <${process.env.GMAIL_EMAIL}>`,
                    bcc: recipientEmails,
                    subject: `New Announcement: ${title}`,
                    html: `
                        <div style="font-family: sans-serif; line-height: 1.6;">
                            <p><b>Hello REC Members,</b></p>
                            <p>A new announcement has been posted:</p>
                            <hr style="border: none; border-top: 1px solid #eee;">
                            <h2 style="color: #333;">${title}</h2>
                            <p style="color: #555;">${content.replace(/\n/g, '<br>')}</p>
                            <hr style="border: none; border-top: 1px solid #eee;">
                            <br>
                            <p style="font-size: 16px;"> If you have any questions or concerns, please contact:<br><br> <b>Caleb Ray</b> - <i>Membership Officer:</i> <a href="mailto:raycal@mail.gvsu.edu">raycal@mail.gvsu.edu</a> <br><br> or <br><br> <b>Sophie Buloss</b> - <i>Marketing Officer:</i> <a href="mailto:buloss@mail.gvsu.edu">buloss@mail.gvsu.edu</a></p>
                            <div style="text-align: center; margin-top: 20px;">
                        <img src="cid:${logoCid}" alt="GVSU Real Estate Club Logo" style="max-width: 300px; height: auto;">
                        </div>
                        </div>
                    `,
                    attachments: [
                        {
                            filename: logoFilename,
                            path: logoPath,
                            cid: logoCid // same cid value as in the html img src
                        }
                    ]
                };

                transporter.sendMail(mailOptions)
                    .then(info => {
                        console.log(`Announcement email sent successfully for ${announcementId}. Message ID: ${info.messageId}`);
                    })
                    .catch(emailError => {
                        console.error(`Error sending announcement email for ${announcementId}:`, emailError);
                    });

            } else {
                console.log(`No recipient emails found. Skipping email notification for announcement ${announcementId}.`);
            }
        }

        res.status(201).json({
            message: 'Announcement added successfully',
            announcement: { id: announcementId, ...newAnnouncementData }
        });

    } catch (error) {
        console.error(`Error processing new announcement (ID: ${announcementId || 'N/A'}):`, error);
        res.status(500).json({ error: "Internal Server Error processing announcement" });
    }
});

app.delete('/api/delete-announcement/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
             return res.status(400).json({ error: 'Announcement ID is required.' });
        }
        const announcementRef = db.collection('announcements').doc(id);
        const doc = await announcementRef.get();

        if (!doc.exists) {
             return res.status(404).json({ error: 'Announcement not found.' });
        }

        await announcementRef.delete();
        console.log(`Deleted announcement ${id}`);

        res.status(200).json({ message: 'Announcement deleted successfully', id: id });

    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ error: "Internal Server Error deleting announcement" });
    }
});

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
            nextMeeting: { title: homeContent.title, content: homeContent.content },
            mission: { title: ourMission.title, content: ourMission.content }
        });
    } catch (error) {
        console.error('Error fetching home content:', error);
        res.status(500).json({ error: 'Internal Error' });
    }
});

app.post('/api/update-home-content', async (req, res) => {
    try {
        const { welcomeMessage, nextMeeting, mission } = req.body;
        const homeContentRef = db.collection('home').doc('homeContent');
        const ourMissionRef = db.collection('home').doc('ourMission');
        await homeContentRef.set({
            welcomeMessage,
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
        aboutContent.sort((a, b) => a.order - b.order);
        res.json({ title, content, members: aboutContent });
    } catch (error) {
        console.error('Error fetching about content:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

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

app.post('/api/new-member', upload.single('image'), async (req, res) => {
    try {
        const { name, title, email, description, order } = req.body;
        const file = req.file;
        if (!name || !title || !email || !description || !file) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const blob = bucket.file(`profiles/${file.originalname}`);
        const blobStream = blob.createWriteStream({
            metadata: { contentType: file.mimetype }
        });
        blobStream.on('error', (err) => {
            console.error('Error uploading file:', err);
            res.status(500).json({ error: "Internal Error" });
        });
        blobStream.on('finish', async () => {
            const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            await blob.makePublic();
            const newMemberRef = db.collection('about').doc();
            await newMemberRef.set({
                name, title, email, description, image: imageUrl, order: parseInt(order, 10)
            });
            const newMember = {
                id: newMemberRef.id, name, title, email, description, image: imageUrl, order: parseInt(order, 10)
            };
            res.status(201).json(newMember);
        });
        blobStream.end(file.buffer);
    } catch (error) {
        console.error('Error adding new member:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

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
        const fileName = imageUrl.split('/').pop().split('?')[0];
        await memberRef.delete();
        const file = bucket.file(`profiles/${fileName}`);
        await file.delete();
        res.status(200).json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ error: "Internal Error" });
    }
});

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
            const blob = bucket.file(`profiles/${file.originalname}`);
            const blobStream = blob.createWriteStream({
                metadata: { contentType: file.mimetype }
            });
            blobStream.on('error', (err) => {
                console.error('Error uploading file:', err);
                res.status(500).json({ error: "Internal Error" });
            });
            blobStream.on('finish', async () => {
                const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
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

app.get('/api/emails', async (req, res) => {
    console.log("making email api call")
    try {
      const emailsRef = db.collection('emails');
      console.log(emailsRef)
      const snapshot = await emailsRef.get();
      const emailsList = [];
      if (snapshot.empty) {
        console.log('No documents found in the emails collection.');
        res.json(emailsList);
        return;
      }
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data && data.email) {
          emailsList.push(data.email);
        } else {
          console.warn(`Document ${doc.id} in 'emails' collection is missing the 'email' field.`);
        }
      });
      res.json(emailsList);
    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).json({ error: "Internal Server Error fetching emails" });
    }
  });

  app.post('/api/emails', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email address is required.' });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const emailsRef = db.collection('emails');
      const querySnapshot = await emailsRef.where('email', '==', normalizedEmail).limit(1).get();
      if (!querySnapshot.empty) {
        return res.status(409).json({ error: 'Email address already exists.' });
      }
      const newEmailRef = emailsRef.doc();
      await newEmailRef.set({
        email: normalizedEmail,
        addedAt: new Date()
      });
      console.log(`Added new email: ${normalizedEmail}`);
      res.status(201).json({ message: 'Email added successfully', email: normalizedEmail });
    } catch (error) {
      console.error('Error adding email:', error);
      res.status(500).json({ error: 'Internal Server Error adding email.' });
    }
  });

  app.delete('/api/emails', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email address to delete is required in the request body.' });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const emailsRef = db.collection('emails');
      const querySnapshot = await emailsRef.where('email', '==', normalizedEmail).limit(1).get();
      if (querySnapshot.empty) {
        return res.status(404).json({ error: 'Email address not found.' });
      }
      const docToDelete = querySnapshot.docs[0];
      await docToDelete.ref.delete();
      console.log(`Deleted email: ${normalizedEmail} (Doc ID: ${docToDelete.id})`);
      res.status(200).json({ message: 'Email deleted successfully', email: normalizedEmail });
    } catch (error) {
      console.error('Error deleting email:', error);
      res.status(500).json({ error: 'Internal Server Error deleting email.' });
    }
  });

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Forcing shutdown');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);