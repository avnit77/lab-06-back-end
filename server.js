require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;

app.use(cors());

app.get('/location', (request, response) => {
    try {
        const location = request.query.location;
        const result = getLatLng(location);
        response.status(200).json(result);
    }
    catch (err) {
        response.status(500).send('Sorry something went wrong, please try again');
    }
});

const geoData = require('./data/geo.json');

function getLatLng(location) {
    if (location === 'bad location') {
        throw new Error();
    }

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
        response.status(500).send('error, we could not get weather details');
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

app.listen(PORT, () => {
});