const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Route to fetch stock data
app.all('/api/stockticker', async (req, res) => {
	try {
		const apiURL = `https://api.nasdaq.com/api/quote/${req.body.symbol}/info?assetclass=${req.body.asset}`;

		const response = await axios.get(apiURL, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
				'Accept': 'application/json, text/plain, */*',
				'Referer': 'https://www.nasdaq.com',
			},
		});

		// Return the API response data to the frontend
		res.json(response.data);
	} catch (error) {
		console.error('Error fetching stock data:', error.message);

		// Send a relevant error response
		res.status(500).json({
			message: 'Failed to fetch stock data',
			error: error.message,
		});
	}
});

app.listen(PORT, () => {
	console.log(`Stock Ticker Server running at //localhost:${PORT}`);
});