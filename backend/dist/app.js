"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firebaseconfig_1 = require("./firebaseconfig");
const app = (0, express_1.default)();
const port = process.env.PORT || 5001;
app.use(express_1.default.json());
app.post('/webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const docRef = firebaseconfig_1.db.collection('announcements').doc('Announcement1');
        const doc = yield docRef.get();
        if (doc.exists) {
            res.json(doc.data());
        }
        else {
            res.status(404).json({ error: 'Document not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal Error" });
    }
}));
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
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
