import express from "express";
import uploads from "../Route/upload.js";
import policy from "../Route/policy.js";
import schedule from "../Route/schedule.js";
import cors from "cors";

export const Route = (App) => {
  App.use(cors());
  App.use(express.json());
  App.use("/api/document", uploads);
  App.use("/api/policies", policy);
  App.use("/api/schedule", schedule);
};
