require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);


const axios = require('axios');

const cryptoSchema = new mongoose.Schema({
    name: String,
    last: Number,
    buy: Number,
    sell: Number,
    volume: Number,
    base_unit: String
});

const Crypto = mongoose.model('Crypto', cryptoSchema);

app.get('/store-to-db', async (req, res) => {
    try {
        const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
        const top10Results = Object.values(response.data).slice(0, 10);

        top10Results.forEach(async (cryptoData) => {
            const crypto = new Crypto({
                name: cryptoData.name,
                last: cryptoData.last,
                buy: cryptoData.buy,
                sell: cryptoData.sell,
                volume: cryptoData.volume,
                base_unit: cryptoData.base_unit
            });
            await crypto.save();
        });
        res.send('Data saved to the database!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/get-data", async (req, res) => {
    try {
        const cryptos = await Crypto.find({});
        res.json(cryptos);

    } catch (error) {
        console.log(error);

    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
