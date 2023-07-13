import express from "express";
import { connectDb } from "./StartUp/DB.js";
import { Route } from './StartUp/Route.js';
import osu from 'os-utils';

const checkCpuUsage = () => {
  setInterval(() => {
    osu.cpuUsage((value) => {
      const cpuUsagePercent = value * 100;
      console.log('CPU Usage:', cpuUsagePercent.toFixed(2) + '%');

      if (cpuUsagePercent >= 70) {
        console.log('Restarting server due to high CPU usage...');
        process.exit(0);
      }
    });
  }, 1000);
};

const startServer = async () => {
  try {
    const app = express();
    const port = process.env.PORT || 3000;

    await connectDb();
    Route(app);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      checkCpuUsage();
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

startServer();
