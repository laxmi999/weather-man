require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");
// import got from "got";

let client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.on("ready", (c) => {
  console.log(`Logged in as ${c.user.tag}!`);
});

const getWeather = async function () {
  const options = {
    method: "GET",
    url: "https://ip-geolocation-ipwhois-io.p.rapidapi.com/json/",
    headers: {
      "X-RapidAPI-Key": process.env.RapidAPI_KEY,
      "X-RapidAPI-Host": "ip-geolocation-ipwhois-io.p.rapidapi.com",
    },
  };

  try {
    const location_response = await axios(options);
    const place_data = location_response.data;
    const country = place_data.country;
    const lat = place_data.latitude;
    const long = place_data.longitude;

    const apiKey = process.env.Weather_API_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}&units=metric`;

    const weather_response = await axios(apiUrl);
    const weather = weather_response.data;
    const city = weather.name;
    const [{ main, description }] = weather.weather;
    const { temp, temp_min, temp_max, pressure, humidity } = weather.main;
    const { sunrise, sunset } = weather.sys;

    return {
      country,
      city,
      main,
      description,
      temp,
      temp_min,
      temp_max,
      pressure,
      humidity,
      sunrise,
      sunset,
    };
  } catch (error) {
    console.error(error);
  }
};

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "weather") {
    try {
      const weather_data = await getWeather();
      const degreeCelsius = "\u00B0C";
      const sun_rise = new Date(weather_data.sunrise * 1000);
      const sun_set = new Date(weather_data.sunset * 1000);

      const embed = new EmbedBuilder()
        .setTitle(`${weather_data.city}, ${weather_data.country}`)
        .setDescription(
          `${sun_rise.toLocaleDateString()}\n
          ${
            weather_data.description.charAt(0).toUpperCase() +
            weather_data.description.slice(1)
          }`
        )
        .setColor("Random")
        .addFields({
          name: "Temperature",
          value: `${weather_data.temp}${degreeCelsius}`,
        })
        .addFields(
          {
            name: "Max. Temperature",
            value: `${weather_data.temp_max}${degreeCelsius}`,
            inline: true,
          },
          {
            name: "Min. Temperature",
            value: `${weather_data.temp_min}${degreeCelsius}`,
            inline: true,
          }
        )
        .addFields(
          {
            name: "Pressure",
            value: `${weather_data.pressure}`,
          },
          {
            name: "Humidity",
            value: `${weather_data.humidity}`,
          }
        )
        .addFields(
          {
            name: "Sunrise",
            value: `${sun_rise.toLocaleTimeString()}`,
            inline: true,
          },
          {
            name: "Sunset",
            value: `${sun_set.toLocaleTimeString()}`,
            inline: true,
          }
        );

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
      interaction.reply("Something went wrong!");
    }
  }
});

client.login(process.env.TOKEN);
