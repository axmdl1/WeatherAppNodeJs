import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import * as path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(__fileName);
dotenv.config();

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const getFlagUrl = (countryCode) =>
    `https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png`;

app.get('/', (req, res) => {
    res.render('index');
})

app.get("/api/weather", async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(404).json({ error: 'City parameter required' });

    try {
        const apiKey = process.env.API_KEY;
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        const weatherResponse = await axios.get(weatherUrl);
        const data = weatherResponse.data;
        const { lat, lon } = data.coord;

        const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const airResponse = await axios.get(airUrl);
        const airQuality = airResponse.data.list[0].main.aqi;

        const weatherInfo = {
            city: data.name,
            country: data.sys.country,
            lat,
            lon,
            temp: data.main.temp,
            feels_like: data.main.feels_like,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            wind_speed: data.wind.speed,
            description: data.weather[0].description,
            icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            air_quality: airQuality,
            flag: getFlagUrl(data.sys.country)
        };

        res.render('weather', { weatherInfo });
    } catch (error) {
        console.error("Error fetching weather data:", error.message);
        res.status(500).json({ error: 'Error fetching weather data' });
    }
});

app.get("/api/map", async (req, res) => {
    const { city } = req.query;
    if (!city) return res.status(404).json({ error: "City parameter required" });

    try {
        const apiKey = process.env.API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        const response = await axios.get(url);
        const { lat, lon } = response.data.coord;

        const latMin = lat - 0.05, latMax = lat + 0.05;
        const lonMin = lon - 0.05, lonMax = lon + 0.05;
        const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lonMin},${latMin},${lonMax},${latMax}&layer=mapnik&marker=${lat},${lon}`;

        res.render('map', { city, lat, lon, embedUrl });
    } catch (error) {
        console.error("Error fetching map data:", error.message);
        res.status(500).json({ error: "Error fetching map data" });
    }
});

app.get("/api/timezone", async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "Latitude and Longitude parameters are required" });

    try {
        const apiKey = process.env.TIMEZONE_API_KEY;
        const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lat=${lat}&lng=${lon}`;
        const response = await axios.get(url);
        const data = response.data;

        const timeZoneInfo = {
            country: data.countryName,
            zone: data.zoneName,
            local_time: data.formatted
        };

        res.render('timezone', { timeZoneInfo });
    } catch (error) {
        console.error("Error fetching timezone data:", error.response?.data || error.message);
        res.status(500).json({ error: "Error fetching timezone data" });
    }
});

app.get("/api/motivation", async (req, res) => {
    try {
        const response = await axios.get("https://zenquotes.io/api/random");
        const data = response.data[0];
        const motivationalQuote = {
            quote: data.q,
            author: data.a,
        };
        res.render('motivation', { motivationalQuote });
    } catch (error) {
        console.error("Error fetching motivational data:", error.message);
        res.status(500).json({ error: "Error fetching motivational data" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
