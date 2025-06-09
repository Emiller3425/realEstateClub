// test-auth.js
const admin = require('firebase-admin');

// IMPORTANT: Use the path to the key inside the 'dist' folder,
// as this script will be run after you build.
const serviceAccount = require('./config/realestateclub-584d7-firebase-adminsdk-5wrv6-6fe577f264.json');

console.log('Initializing Firebase...');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();
  console.log('Firebase initialized successfully.');

  console.log('Attempting to fetch data from Firestore...');
  // Replace 'users' with the name of any collection you have in your Firestore.
  db.collection('users').limit(1).get()
    .then(snapshot => {
      if (snapshot.empty) {
        console.log('SUCCESS: Connected to Firestore, but the test collection is empty.');
      } else {
        console.log('SUCCESS: Connected and fetched data from Firestore.');
        snapshot.forEach(doc => {
          console.log('Document ID:', doc.id);
        });
      }
      process.exit(0);
    })
    .catch(err => {
      console.error('ERROR: Firebase initialized, but failed to fetch data.');
      console.error('Firestore Error Code:', err.code);
      console.error('Firestore Error Message:', err.message);
      process.exit(1);
    });

} catch (err) {
  console.error('ERROR: Failed to initialize Firebase.');
  console.error(err);
  process.exit(1);
}