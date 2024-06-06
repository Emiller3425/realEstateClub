import express from 'express';
import { db } from './firebaseconfig';

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());

app.post('/webhook', async (req, res) => {
  try {
    const docRef = db.collection('announcements').doc('Announcement1');
    const doc = await docRef.get();
    if (doc.exists) {
      res.json(doc.data());
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Error" });
  }
});

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
