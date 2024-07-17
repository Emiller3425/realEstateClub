"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// Initialize the Firebase app with a service account, granting admin privileges
const serviceAccount = require('../config/realestateclub-584d7-firebase-adminsdk-5wrv6-ac5b7aaa7b.json');
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount)
});
// Get a reference to the Firestore service
const db = firebase_admin_1.default.firestore();
exports.db = db;
