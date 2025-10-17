const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", (req, res) => {
  const cityName = req.body.cityName;
  const apiKey = "4cbaf40a8d3a746f63e7fdc0e3a94dac"; 
  const units = "metric";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${units}`;

  https.get(url, (response) => {
    console.log("Status:", response.statusCode);

    if (response.statusCode === 200) {
      response.on("data", (data) => {
        const weatherData = JSON.parse(data);
        const temp = weatherData.main.temp;
        const desc = weatherData.weather[0].description;
        const icon = weatherData.weather[0].icon;
        const imageURL = `http://openweathermap.org/img/wn/${icon}@2x.png`;

        res.setHeader("Content-Type", "text/html; charset=utf-8");

        res.write(`<h1>The temperature in ${cityName} is ${temp}&deg;C</h1>`);
        res.write(`<h3>Weather: ${desc}</h3>`);
        res.write(`<img src="${imageURL}" alt="weather icon">`);
        res.write(`<br><a href="/">Go back</a>`);
        res.send();
      });
    } else {
      res.write(`<h1>Error: City "${cityName}" not found</h1>`);
      res.write(`<a href="/">Try again</a>`);
      res.send();
    }
  }).on("error", (err) => {
    console.error("API request failed:", err.message);
    res.write("<h1>API request failed</h1>");
    res.write(`<a href="/">Go back</a>`);
    res.send();
  });
});

app.get("/", (req, res) => {
  res.send("Backend server is running");
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
