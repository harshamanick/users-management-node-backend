import dbUri from "../DbUri/Dburi.js";
import { MongoClient } from "mongodb";

const client = new MongoClient(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
export const connectDb = async () => {
  try {
    await client.connect();
    console.log("Connected.......");
  } catch (error) {
    console.log("Connection failed .....", error);
  }
};
export const getClient = () => {
  return client;
};
