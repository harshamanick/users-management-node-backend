import express from "express";
import { Worker } from "worker_threads";
import multer from "multer";

const route = express.Router();
const upload = multer({ dest: './Document' });

route.post('/upload', upload.single('file'), (req, res) => {
  const { filename } = req.file;

  // Create a new worker thread and pass necessary information as workerData
  const worker = new Worker('./WorkerThreads/worker.js', {
    workerData: {
      filename: filename,
      filePath: req.file.path,
      mimetype: req.file.mimetype
    }
  });

  worker.on('message', (message) => {
    console.log(`Worker thread finished processing: ${message}`);
    res.status(200).send({ message: 'Upload successful' });
  });

  worker.on('error', (error) => {
    console.log('Worker thread error:', error);
    res.status(500).send({ message: 'Upload failed' });
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
      res.status(500).send({ message: 'Upload failed' });
    }
  });
});

export default route;
