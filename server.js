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

const getTrailResponse = async(lat, lng) => {
    const HIKING_API_KEY = process.env.HIKING_API_KEY;

    const trailItem = await superagent.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lng}&maxDistance=200&key=${HIKING_API_KEY}`);


    const actualTrailData = JSON.parse(trailItem.text);
    const dailyArray = actualTrailData.trails.map((item) => {
        return {
            name: item.name,
            location: item.location,
            length: item.length,
            stars: item.stars,
            star_votes: item.starVotes,
            summary: item.summary,
            trail_url: item.url,
            conditions: item.conditionStatus,
            condition_date: item.conditionDate.slice(0, 10),
            condition_time: item.conditionTime.slice(11)
        };
    });

    return dailyArray;
};

const getYelpResponse = async(lat, lng) => {
    const yelpData = await superagent.get(`https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}`)
        .set(`Authorization`, `Bearer ${process.env.YELP_API_KEY}`);


    const actualYelpData = JSON.parse(yelpData.text);
    const yelpArray = actualYelpData.yelp.map((item) => {
        return {
            name: item.name,
            image_url: item.image_url,
            price: item.price,
            rating: item.rating,
            url: item.url
        };
    });

    return yelpArray;
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

app.get('/trails', async(req, res) => {
    try {
        const trailObject = await getTrailResponse(latlngs.latitude, latlngs.longitude);

        res.json(trailObject);
    } catch (e) {
        throw new Error(e);
    }
});

app.get('/reviews', async(req, res) => {
    try {
        const yelpObject = await getYelpResponse(latlngs.latitude, latlngs.longitude);

        res.json(yelpObject);
    } catch (e) {
        throw new Error(e);
    }
});


app.listen(PORT, () => {
});