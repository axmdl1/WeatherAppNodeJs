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
            coord: {
                longitude: data.coord.longitude,
                latitude: data.coord.latitude,
            },
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

app.get("/api/airQuality", async (req, res) => {
    const {lat, lon} = req.query
    if (!lat || !lon) {
        return res.status(404).json({error: 'Latitude parameter required'});
    }

    try {
        const airQualityAPIKEY = process.env.API_KEY;
        const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${airQualityAPIKEY}`

        const response = await axios.get(url);
        const data = response.data.data;

        const airQualityInfo = {
            city: data.city,
            country: data.country,
            pollution: data.current.pollution,
            weather: data.current.weather,
        };

        res.json(airQualityInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error fetching airQuality'});
    }
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
