
// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');

// Application Setup
// - make an express app!
const app = express();
// - get the port on which to run the server
const PORT = process.env.PORT;
// - enable CORS
app.use(cors());

// API Routes
// app.<verb>(<noun>, handler);
app.get('/location', (request, response) => {
    try {
        // use express built-in query object
        const location = request.query.location;
        const result = getLatLng(location);
        response.status(200).json(result);
    }
    catch (err) {
        // TODO: make an object and send via .json...
        response.status(500).send('Sorry something went wrong, please try again');
    }
});

// node CJS "require" will parse JSON for us into array/object
const geoData = require('./data/geo.json');

// Helper Functions
function getLatLng(location) {
    // simulate an error if special "bad location" is provided:
    if (location === 'bad location') {
        throw new Error();
    }

    // ignore location for now, return hard-coded file
    // api call will go here

    // convert to desired data format:
    return toLocation();
}

function toLocation() {
    const firstResult = geoData.results[0];
    const geometry = firstResult.geometry;

    return {
        formatted_query: firstResult.formatted_address,
        latitude: geometry.location.lat,
        longitude: geometry.location.lng
    };
}

const darkSky = require('./data/darksky.json');

app.get('/weather', (request, response) => {
    try {
        const location = toLocation();
        const weather = getWeather(location);
        response.status(200).json(weather);
    }
    catch (err) {
        response.status(500).send('error');
    }
});

function getWeather() {
    const forecast = [];

    darkSky.daily.data.forEach(day => {
        let date = new Date(day.time);
        let dateString = date.toDateString();
        forecast.push({
            'forecast': day.summary,
            'time': dateString
        });
    });
    return forecast;
}


// Start the server
app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});