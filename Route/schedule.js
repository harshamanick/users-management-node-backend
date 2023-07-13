import express from 'express';
import cron from 'node-cron';
import { MongoClient } from 'mongodb';
import { dateToCronPattern } from '../utility.js/utility.js';

const dbName = 'userManagement';
const nonScheduledCollectionName = 'nonScheduledCollection';
const scheduledCollectionName = 'scheduledCollection';
const route = express.Router();
import dbUri from '../DbUri/Dburi.js';

// Schedule a job to transfer the message
const scheduleMessageJob = (message, timestamp) => {
  const cronPattern = dateToCronPattern(timestamp);
  cron.schedule(cronPattern, async () => {
    try {
      const client = new MongoClient(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      const nonScheduledCollection = client.db(dbName).collection(nonScheduledCollectionName);
      const scheduledCollection = client.db(dbName).collection(scheduledCollectionName);
      // Find the message in collection1 by timestamp
      const query = { timestamp };
      const messageDoc = await nonScheduledCollection.findOne(query);

      if (messageDoc) {
        // Insert the message into collection2
        await scheduledCollection.insertOne(messageDoc);

        // Remove the message from collection1
        await nonScheduledCollection.deleteOne(query);

        console.log('Message transferred successfully.');
      } else {
        console.log('Message not found.');
      }

      // Close the MongoDB connection
      client.close();
    } catch (error) {
      console.error('Error:', error);
    }
  });
};

// API endpoint to schedule a message
route.post('/schedule-message', async (req, res) => {
  const { message, day, time } = req.body;
  const timestamp = new Date(`${day} ${time}`);

  try {
    const client = new MongoClient(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const nonScheduledCollection = client.db(dbName).collection(nonScheduledCollectionName);

    // Insert the message into collection1
    await nonScheduledCollection.insertOne({ message, timestamp });

    // Close the MongoDB connection
    client.close();

    // Schedule the job to transfer the message
    try {
      scheduleMessageJob(message, timestamp);
    } catch (error) {
      console.log('Error:', error);
    }

    res.status(200).send('Message scheduled successfully.');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default route;
