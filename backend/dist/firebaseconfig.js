const admin = require('firebase-admin');

// Path to your service account key JSON file
const serviceAccount = require('../config/realestateclub-584d7-firebase-adminsdk-5wrv6-ac5b7aaa7b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'realestateclub-584d7.appspot.com' // Add .appspot.com to your storage bucket name
});

// Get a reference to the Firestore service
const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { db, bucket };
