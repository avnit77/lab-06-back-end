require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.static('./public'));


let latlngs;

const formatLocationResponse = locationItem => {
    const {
        geometry: {
            location: {
                lat,
                lng,
            },
        },
        formatted_address,
    } = locationItem;

    return {
        formatted_query: formatted_address,
        latitude: lat,
        longitude: lng,
    };
};

const getWeatherResponse = async(lat, long) => {
    const DARKSKY_API_KEY = process.env.DARKSKY_API_KEY;

    const weatherItem = await superagent.get(`https://api.darksky.net/forecast/${DARKSKY_API_KEY}/${lat},${long}`);

    const actualWeatherData = JSON.parse(weatherItem.text);
    const dailyArray = actualWeatherData.daily.data.map((item) => {
        return {
            forecast: item.summary,
            time: new Date(item.time * 1000).toDateString(),
        };
    });
    return dailyArray;
};

app.get('/location', async(req, res) => {
    try {
        const searchQuery = req.query.search;
        const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;

        const locationItem = await superagent.get (`https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${GEOCODE_API_KEY}`);
        const actualItem = JSON.parse(locationItem.text).results[0];
        const response = formatLocationResponse(actualItem);

        latlngs = response;

        res.json(response);
    } catch (e) {
        throw new Error(e);
    }
});

app.get('/weather', async(req, res) => {
    try {
        const weatherObject = await getWeatherResponse(latlngs.latitude, latlngs.longitude);

        res.json(weatherObject);
    } catch (e) {
        throw new Error(e);
    }
});

app.listen(PORT, () => {
});