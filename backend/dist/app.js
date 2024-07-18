"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const firebaseconfig_1 = require("./firebaseconfig");
const app = (0, express_1.default)();
const port = process.env.PORT || 5001;
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });

app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://realestateclubgvsu.com', 'https://real-estate-club.vercel.app'],
}));
app.use(body_parser_1.default.json());

app.post('/api/announcements', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const announcementsRef = firebaseconfig_1.db.collection('announcements');
        const snapshot = yield announcementsRef.get();
        if (snapshot.empty) {
            res.status(404).json({ error: 'No announcements found' });
            return;
        }
        const announcements = [];
        snapshot.forEach(doc => {
            announcements.push({ id: doc.id, ...doc.data() });
        });
        res.json(announcements);
    }
    catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: "Internal Error" });
    }
}));

app.post('/api/new-announcement', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(400).json({ error: 'Title and content are required' });
            return;
        }
        const newAnnouncementRef = firebaseconfig_1.db.collection('announcements').doc();
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
            hour12: true,
        });
        const formattedTimestamp = `${formattedDate} ${formattedTime}`;
        yield newAnnouncementRef.set({
            title,
            content,
            timestamp: formattedTimestamp,
        });
        res.status(201).json({ message: 'Announcement added successfully' });
    }
    catch (error) {
        console.error('Error adding announcement:', error);
        res.status(500).json({ error: "Internal Error" });
    }
}));

app.delete('/api/delete-announcement/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const announcementRef = firebaseconfig_1.db.collection('announcements').doc(id);
        yield announcementRef.delete();
        const announcementsRef = firebaseconfig_1.db.collection('announcements');
        const snapshot = yield announcementsRef.get();
        const announcements = [];
        snapshot.forEach(doc => {
            announcements.push({ id: doc.id, ...doc.data() });
        });
        res.json(announcements);
    }
    catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ error: "Internal Error" });
    }
}));

app.post('/api/get-admin-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userProfileRef = firebaseconfig_1.db.collection('userProfile').doc('adminAccount');
        const doc = yield userProfileRef.get();
        if (!doc.exists) {
            res.status(404).json({ error: 'Admin account not found' });
            return;
        }
        const data = doc.data();
        res.json({ password: data.password });
    }
    catch (error) {
        console.error('Error fetching admin password:', error);
        res.status(500).json({ error: 'Internal Error' });
    }
}));

app.get('/api/home-content', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const homeContentRef = firebaseconfig_1.db.collection('home').doc('homeContent');
        const ourMissionRef = firebaseconfig_1.db.collection('home').doc('ourMission');
        const [homeContentDoc, ourMissionDoc] = yield Promise.all([homeContentRef.get(), ourMissionRef.get()]);
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
    }
    catch (error) {
        console.error('Error fetching home content:', error);
        res.status(500).json({ error: 'Internal Error' });
    }
}));

app.post('/api/update-home-content', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { welcomeMessage, nextMeeting, mission } = req.body;
        const homeContentRef = firebaseconfig_1.db.collection('home').doc('homeContent');
        const ourMissionRef = firebaseconfig_1.db.collection('home').doc('ourMission');
        yield homeContentRef.set({
            welcomeMessage,
            title: nextMeeting.title,
            content: nextMeeting.content
        }, { merge: true });
        yield ourMissionRef.set({
            title: mission.title,
            content: mission.content
        }, { merge: true });
        res.status(200).json({ message: 'Home content updated successfully' });
    }
    catch (error) {
        console.error('Error updating home content:', error);
        res.status(500).json({ error: 'Internal Error' });
    }
}));

app.get('/api/about', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const aboutRef = firebaseconfig_1.db.collection('about');
        const snapshot = yield aboutRef.get();
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
            }
            else {
                aboutContent.push({ id: doc.id, ...doc.data() });
            }
        });
        aboutContent.sort((a, b) => a.order - b.order);
        res.json({ title, content, members: aboutContent });
    }
    catch (error) {
        console.error('Error fetching about content:', error);
        res.status(500).json({ error: "Internal Error" });
    }
}));

app.post('/api/update-about-title', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content } = req.body;
        const aboutTitleRef = firebaseconfig_1.db.collection('about').doc('aboutTitle');
        yield aboutTitleRef.set({ title, content }, { merge: true });
        res.status(200).json({ message: 'About title updated successfully' });
    }
    catch (error) {
        console.error('Error updating about title:', error);
        res.status(500).json({ error: 'Internal Error' });
    }
}));

app.post('/api/new-member', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, title, email, description, order } = req.body;
        const file = req.file;
        if (!name || !title || !email || !description || !file) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const blob = firebaseconfig_1.bucket.file(`profiles/${file.originalname}`);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });
        blobStream.on('error', (err) => {
            console.error('Error uploading file:', err);
            res.status(500).json({ error: "Internal Error" });
        });
        blobStream.on('finish', () => __awaiter(void 0, void 0, void 0, function* () {
            const imageUrl = `https://storage.googleapis.com/${firebaseconfig_1.bucket.name}/${blob.name}`;
            yield blob.makePublic();
            const newMemberRef = firebaseconfig_1.db.collection('about').doc();
            yield newMemberRef.set({
                name,
                title,
                email,
                description,
                image: imageUrl,
                order: parseInt(order, 10)
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
        }));
        blobStream.end(file.buffer);
    }
    catch (error) {
        console.error('Error adding new member:', error);
        res.status(500).json({ error: "Internal Error" });
    }
}));

app.delete('/api/delete-member/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const memberRef = firebaseconfig_1.db.collection('about').doc(id);
        const memberDoc = yield memberRef.get();
        if (!memberDoc.exists) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }
        const memberData = memberDoc.data();
        const imageUrl = memberData.image;
        const fileName = imageUrl.split('/').pop().split('?')[0];
        yield memberRef.delete();
        const file = firebaseconfig_1.bucket.file(`profiles/${fileName}`);
        yield file.delete();
        res.status(200).json({ message: 'Member deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ error: "Internal Error" });
    }
}));

app.post('/api/update-member', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name, title, email, description, order } = req.body;
        const file = req.file;
        if (!id || !name || !title || !email || !description || order === undefined) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const memberRef = firebaseconfig_1.db.collection('about').doc(id);
        const memberData = { name, title, email, description, order: parseInt(order, 10) };
        if (file) {
            const blob = firebaseconfig_1.bucket.file(`profiles/${file.originalname}`);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype
                }
            });
            blobStream.on('error', (err) => {
                console.error('Error uploading file:', err);
                res.status(500).json({ error: "Internal Error" });
            });
            blobStream.on('finish', () => __awaiter(void 0, void 0, void 0, function* () {
                const imageUrl = `https://storage.googleapis.com/${firebaseconfig_1.bucket.name}/${blob.name}`;
                yield blob.makePublic();
                memberData.image = imageUrl;
                yield memberRef.update(memberData);
                res.status(200).json({ message: 'Member updated successfully' });
            }));
            blobStream.end(file.buffer);
        }
        else {
            yield memberRef.update(memberData);
            res.status(200).json({ message: 'Member updated successfully' });
        }
    }
    catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ error: "Internal Error" });
    }
}));

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
