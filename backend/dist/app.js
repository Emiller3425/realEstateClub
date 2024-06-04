"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firebaseconfig_1 = require("./firebaseconfig");
const app = (0, express_1.default)();
const port = 5000;
app.use(express_1.default.json());
app.post('/webhook', async (req, res) => {
    try {
        // Example: Reading a specific document from Firestore
        const docRef = firebaseconfig_1.db.collection('announcements').doc('Announcement1');
        const doc = await docRef.get();
        if (doc.exists) {
            res.json(doc.data());
        }
        else {
            res.status(404).json({ error: 'Document not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: "500 error" });
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
