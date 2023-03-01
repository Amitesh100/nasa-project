const axios = require("axios");

// Database storage
const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

// In memory storage
const DEFAULT_FLIGHT_NUMBER = 100;

//* Here we are using SPACEX API to populate our API
const SPACEX_API_URL = "https://api.spacexdata.com/v5/launches/query";

async function populateLaunches() {
    console.log("Downloading launch data...");
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
          pagination: false,  
          populate: [
              {
                path: "rocket",
                select: {
                  name: 1
                }
              },
              {
                path: "payloads",
                select: {
                    customers: 1
                }
              }
            ]
        }
    });

    if (response.status !== 200) {
        console.log("Problem downloading launch data.");
        throw new Error("Launch Data download failed");
    }
    
    const launchDocs = response.data.docs;
    launchDocs.forEach(async launchDoc => {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        })
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc["name"],
            rocket: launchDoc["rocket"]["name"],
            launchDate: launchDoc["date_local"],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers,
        };
        console.log(`${launch.flightNumber} ${launch.mission}`);
        return await saveLaunch(launch);
    });
}

async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        mission: "FalconSat"
    });
    if (firstLaunch) {
        console.log("Launch data already loaded.");
        return;
    } else {
        return await populateLaunches();
    }
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}


async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId,
    })
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber')

        if (!latestLaunch) {
            return DEFAULT_FLIGHT_NUMBER;
        }

        return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
    return await launchesDatabase
    .find({}, {"__id":0, "__v":0,})
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
    await launchesDatabase.create(launch);
}

async function scheduleNewLaunch(launch) {
        // const planet = await planets.findOne({
    //     keplerName: launch.target,
    // });

    // if (!planet) {
    //     throw new Error('No matching planet found');
    // }

    const newFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ["Zero to Mastery", "ISRO"],
        flightNumber: newFlightNumber,
    })
    await saveLaunch(newLaunch);
} 

async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber:launchId
    }, {
        upcoming : false,
        success : false
    });

    return aborted.modifiedCount === 1;
}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
    loadLaunchData
};

