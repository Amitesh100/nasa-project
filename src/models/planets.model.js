const planets = require("./launches.mongo");

const fs = require('fs');
const path = require("path");
const { parse} = require("csv-parse");

// Reading the data from the csv file

function isHabitablePlanet(planet) {
    return planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 && planet["koi_insol"] < 1.11 && 
    planet["koi_prad"] < 1.6;
}

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '../../data/','kepler_data.csv'))
        .pipe(parse({
            comment: "#",
            columns: true,
        }))
        .on("data", async (data) => {
            if (isHabitablePlanet(data)) {
                savePlanet(data);
            }
        })
        .on("error", (err) => {
            console.log(err);
            reject(err);
        })
        .on("end", async () => {
            const countPlanetsFound = (await getAllPlanets()).length;
            console.log(`${countPlanetsFound} habitable planets found`);
            resolve();
        })
    })
}

async function getAllPlanets() {
    return await planets.find({}, {
        __id: 0, __v: 0,
    });
}

async function savePlanet(planet) {
    try {
        await planets.findOneAndUpdate({
            keplerName: planet.kepler_name,
        }, {
            keplerName: planet.kepler_name,
        }, {upsert: true});
    } catch (err) {
        console.log(`Could not save planet ${err}`)
    }
}

// exporting the model

module.exports = {
    loadPlanetsData,
    getAllPlanets,
}