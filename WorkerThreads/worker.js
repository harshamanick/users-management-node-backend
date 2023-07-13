import { workerData, parentPort } from 'worker_threads';
import fs from 'fs';
import csvParser from 'csv-parser';
import xlsx from 'xlsx';
import { MongoClient } from 'mongodb';
import { getClient } from '../StartUp/DB.js';
import { constructPolicyInfo, constructUserData } from '../utility.js/utility.js';

const { filePath, mimetype } = workerData;

// MongoDB connection settings
const client = getClient();
const dbName = 'userManagement';
const db = client.db(dbName);
const userCollection = db.collection('users');
const policyCollection = db.collection('policies');
const agentCollection = db.collection('agents');
const usersAccountCollection = db.collection('usersAccounts');
const policyCategoryCollection = db.collection('LOB');
const policyCarrier = db.collection('carrier');

// Function to process CSV data
function processCSVData(data) {
  console.log('Processing CSV data');

  return new Promise(async (resolve, reject) => {
    try {
      const userDataBatch = [];
      const policyDataBatch = [];
      const agentDataBatch = [];
      const usersAccountDataBatch = [];
      const policyCategoryDataBatch = [];
      const policyCarrierDataBatch = [];

      for (const element of data) {
        let userData = constructUserData(element);
        let policeInfo = constructPolicyInfo(element);

        userDataBatch.push(userData);
        policyDataBatch.push(policeInfo);
        agentDataBatch.push({ agent_name: element?.agent });
        usersAccountDataBatch.push({ account_name: element?.account_name });
        policyCategoryDataBatch.push({ category_name: element?.category_name });
        policyCarrierDataBatch.push({ company_name: element?.company_name });
      }

      const usersResult = await userCollection.insertMany(userDataBatch);
      const insertedUserIds = Object.values(usersResult.insertedIds).map(id => id.toString());

      policyDataBatch.forEach((policy, index) => {
        policy.user_id = insertedUserIds[index];
      });

      await Promise.all([
        policyCollection.insertMany(policyDataBatch),
        agentCollection.insertMany(agentDataBatch),
        usersAccountCollection.insertMany(usersAccountDataBatch),
        policyCategoryCollection.insertMany(policyCategoryDataBatch),
        policyCarrier.insertMany(policyCarrierDataBatch)
      ]);

      console.log('Data inserted into MongoDB');
      resolve();
    } catch (error) {
      reject(error);
      console.log('Error:', error);
    }
  });
}

// Read the file and process the data
if (mimetype === 'text/csv') {
  const rows = [];

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      // Process each row of data
      rows.push(row);
    })
    .on('end', () => {
      console.log('CSV processing complete');
      processCSVData(rows)
        .then(() => {
          deleteFile(filePath); // Delete the file after upload
          parentPort.postMessage('Data upload completed');
          console.log('Data upload completed');
        })
        .catch((error) => {
          console.error('CSV processing error:', error);
          console.log('Data upload failed');
        })
        .finally(() => {
          client.close();
        });
    })
    .on('error', (error) => {
      console.error('CSV processing error:', error);
      console.log('Data upload failed');
      client.close();
    });
} else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheetData = workbook.Sheets[sheetName];

  processCSVData(xlsx.utils.sheet_to_json(sheetData))
    .then(() => {
      deleteFile(filePath); // Delete the file after upload
      console.log('Data upload completed');
      client.close();
    })
    .catch((error) => {
      console.error('XLSX processing error:', error);
      console.log('Data upload failed');
      client.close();
    });
} else {
  console.error('Invalid file format');
  console.log('Data upload failed');
}

// Function to delete a file
function deleteFile(filePath) {
  fs.unlink(filePath, (error) => {
    if (error) {
      console.error('Error deleting file:', error);
    } else {
      console.log('File deleted successfully');
    }
  });
}
