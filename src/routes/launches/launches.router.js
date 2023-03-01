const express = require("express");
const launchesRouter = express.Router();
const {
    httpGetAllLaunches,
    httpPostNewLaunch,
    httpAbortLaunch
} = require("./launches.controller")

// Getting all the launches
launchesRouter.get('/', httpGetAllLaunches);

// Posting new launch
launchesRouter.post("/", httpPostNewLaunch);

// Aborting a launch
launchesRouter.delete("/:id", httpAbortLaunch);

module.exports = launchesRouter;