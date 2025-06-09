// firebaseconfig.js

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const firebase_admin_1 = __importDefault(require("firebase-admin"));

// Define a variable for the credentials
let credentials;

// This is the new, environment-aware logic
if (process.env.GOOGLE_CREDENTIALS) {
  // This block runs on Vercel (and other production environments)
  try {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    console.log('Initializing Firebase with credentials from environment variable.');
  } catch (error) {
    console.error('Failed to parse GOOGLE_CREDENTIALS environment variable:', error);
    process.exit(1); // Exit if credentials are bad
  }
} else {
  // This block runs on your local machine for development
  try {
    // IMPORTANT: The path must be relative to this file's location.
    // Assuming firebaseconfig.js is in the root of your 'dist' folder,
    // and your key is in 'dist/config/'.
    credentials = require('./config/realestateclub-584d7-firebase-adminsdk-5wrv6-0ab82c960c.json');
    console.log('Initializing Firebase with credentials from local file.');
  } catch (error) {
    console.error('Failed to load local service account key. Make sure the file exists and the path is correct.', error);
    process.exit(1); // Exit if local file is missing
  }
}

// Initialize the Firebase app with the correct credentials
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(credentials),
    storageBucket: 'gs://realestateclub-584d7.appspot.com'
});

// Get a reference to the services and export them
const db = firebase_admin_1.default.firestore();
const bucket = firebase_admin_1.default.storage().bucket();

exports.db = db;
exports.bucket = bucket;