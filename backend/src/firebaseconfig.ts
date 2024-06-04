import admin from 'firebase-admin';

// Initialize the Firebase app with a service account, granting admin privileges
const serviceAccount = require('../config/realestateclub-584d7-firebase-adminsdk-5wrv6-ac5b7aaa7b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get a reference to the Firestore service
const db = admin.firestore();

export { db };