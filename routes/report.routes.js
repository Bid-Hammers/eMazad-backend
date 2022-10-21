"use strict";
const express = require("express");
const router = express.Router();
const { Report } = require("../models");

// Routes
router.get("/report", getReport);
router.post("/report", createReport);
router.delete("/report/:id", deleteReport);
router.get("/report/:id", getOneReport);

// function to get all reports
async function getReport(req, res) {
  let report = await Report.read();
  res.status(200).json(report);
}

// function to get one report by id
async function getOneReport(req, res) {
  const id = req.params.id;
  let getOneReport = await Report.read(id);
  res.status(200).json({ getOneReport });
}

// function to create a report
async function createReport(req, res) {
  let newReport = req.body;
  let report = await Report.create(newReport);
  res.status(201).json(report);
}

// function to delete a report by id
async function deleteReport(req, res) {
  const id = req.params.id;
  let deletedReport = await Report.delete(id);
  res.status(204).send( "Report Deleted Successfully" );
}


module.exports = router;
