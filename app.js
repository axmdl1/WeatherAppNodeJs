import express from 'express';
import axios from "axios";
import dotenv from 'dotenv';
import * as path from "node:path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(__fileName);

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//core
app.get("/api/weather", async (req, res) => {

    const {city} = req.query;
    if (!city) {
        return res.status(404).json({error: 'City parameter required'});
    }

    try {
        const apiKey = process.env.API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

        const response = await axios.get(url);
        const data = response.data;

        const weatherInfo = {
            city: data.name,
            lat: data.coord.lat,
            lon: data.coord.lon,
            temp: data.main.temp,
            feels_like: data.main.feels_like,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            wind_speed: data.wind.speed,
            country: data.sys.country,
        };

        res.send(`
            <!doctype html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Weather Result</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <h1>Weather Information</h1>
                <form action="/api/weather" method="get">
                    <label>
                        <input type="text" id="city" name="city" placeholder="Enter City" required>
                        <button type="submit">Get Weather</button>
                    </label>
                </form>
                <div id="weather-container">
                    <h2>Weather in ${weatherInfo.city}, ${weatherInfo.country}</h2>
                    <p><strong>Temperature:</strong> ${weatherInfo.temp}°C</p>
                    <p><strong>Coordinates:</strong> Lat: ${weatherInfo.lat}, Lon: ${weatherInfo.lon}</p>
                    <p><strong>Feels Like:</strong> ${weatherInfo.feels_like}°C</p>
                    <p><strong>Humidity:</strong> ${weatherInfo.humidity}%</p>
                    <p><strong>Pressure:</strong> ${weatherInfo.pressure} hPa</p>
                    <p><strong>Wind Speed:</strong> ${weatherInfo.wind_speed} m/s</p>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error fetching weather data' });
    }
})

//additional API 1
app.get("/api/timezone", async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and Longitude parameters are required" });
    }

    try {
        const apiKey = process.env.TIMEZONE_API_KEY;
        const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${lat}&lng=${lon}`;

        const response = await axios.get(url);
        const data = response.data;

        const timeZoneInfo = {
            country: data.countryName,
            zone: data.zoneName,
            local_time: data.formatted,
        };

        res.send(`
            <!doctype html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Weather Result</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <h1>Timezone</h1>
                <form action="/api/timezone" method="get">
                    <label>
                        <input type="text" id="lat" name="lat" placeholder="Enter Latitude"></input>
                        <input type="text" id="lon" name="lon" placeholder="Enter Longitude"></input>
                    </label>
                    <button type="submit">Get Timezone</button>
                </form>
                <div id="weather-container">
                    <p><strong>Country:</strong>${timeZoneInfo.country}</p>
                    <p><strong>Zone:</strong> ${timeZoneInfo.zone}</p>
                    <p><strong>Local time:</strong> ${timeZoneInfo.local_time}</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error("Error fetching timezone data:", error.response?.data || error.message);
        res.status(500).json({ error: "Error fetching timezone data" });
    }
});

//additional API 2
app.get("/api/motivation", async (req, res) => {
    try {
        const url = "https://zenquotes.io/api/random";

        const response = await axios.get(url);
        const data = response.data[0];

        const motivationalQuote = {
            quote: data.q,
            author: data.a,
        };

        res.send(`
            <!doctype html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Weather Result</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <form action="/api/motivation" method="get">
                    <button type="submit">Get Motivation</button>
                </form>
                <div id="weather-container">
                    <p><strong>Quote:</strong>${motivationalQuote.quote}</p>
                    <p><strong>Author:</strong> ${motivationalQuote.author}</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error("Error fetching motivational data:", error.message);
        res.status(500).json({ error: "Error fetching motivational data" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
