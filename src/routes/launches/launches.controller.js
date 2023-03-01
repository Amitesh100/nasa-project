const {
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
    const { skip, limit } = getPagination(req.query);
    const launches = await getAllLaunches(skip, limit);
    return res.status(200).json(launches);
}

async function httpPostNewLaunch(req, res) {
    const launch = req.body;
    
    if (!launch.mission || !launch.launchDate || !launch.target || !launch.rocket) {
        return res.status(400).json({
            error: "Missing required launch property"
        })
    }

    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: "Invalid launch Date"
        })
    }
    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const launchId = req.params.id;

    // if launch doesn't exist 
    const launchExists = await existsLaunchWithId(launchId)
    if (!launchExists) {
        res.status(404).json({
            error: "Launch Not found"
        })
    }

    // if launch does exist 
    const aborted = await abortLaunchById(launchId);
    
    if (!aborted) {
        res.status(400).json({
            error: "Launch not aborted",
        })
    }

    res.status(200).json({
        ok: true,
    })
}

module.exports = {
    httpGetAllLaunches,
    httpPostNewLaunch,
    httpAbortLaunch
}