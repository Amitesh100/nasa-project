const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB url string
const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
    console.log("MongoDB connection ready!");
})

mongoose.connection.on("error", (err) => {
    console.error(err);
})

mongoose.set('strictQuery', false);

const mongoConnect = async () => {
    await mongoose.connect(MONGO_URL);
}

const mongoDisconnect = async () => {
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect
};