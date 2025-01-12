'use client'

import React, { useState, useEffect } from 'react';
import StockCard from '@/components/ui/StockCard';
import SearchStock from '@/components/ui/SearchStock';
import { checkLS, addIndex, formatCurrency, hasMinusSymbol } from '@/lib/utils';

const StockPage = () => {

	const STOCKS_KEY = 'stocks';
	const STOCK_COUNTER_KEY = 'stockCounter';
	const DEFAULT_KEYS = ['index', 'symbol', 'asset', 'sharesOwned', 'priceBought', 'account', 'virtual']
	const DEFAULT_STOCKS = [
		{ 'index': '', 'symbol': 'AAPL', 'asset': 'STOCKS', 'sharesOwned': '', 'priceBought': '', 'account': '', 'virtual': false },
		{ 'index': '', 'symbol': 'AVGO', 'asset': 'STOCKS', 'sharesOwned': '', 'priceBought': '', 'account': '', 'virtual': false },
		{ 'index': '', 'symbol': 'MSFT', 'asset': 'STOCKS', 'sharesOwned': '', 'priceBought': '', 'account': '', 'virtual': false },
		{ 'index': '', 'symbol': 'NVDA', 'asset': 'STOCKS', 'sharesOwned': '', 'priceBought': '', 'account': '', 'virtual': false }
	]
	const [stocks, setStocks] = useState([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [stockData, setStockData] = useState([]);
	const [totalHoldings, setTotalHoldings] = useState({
		dailyGain: 0,
		netGain: 0,
		totalValue: 0,
	});
	const [marketStatus, setMarketStatus] = useState(null)

	const fetchStocks = () => {
		setRefreshKey(prevKey => prevKey + 1);
	};

	const removeStock = (stock) => {
		console.log('Removing stock:', stock);
	
		// Filter out the stock with the matching index
		const newStocks = stocks.filter(item => item.index !== stock.index);
	
		console.log('New stocks array after removal:', newStocks);
	
		// Update the state and localStorage
		setStocks(newStocks);
		localStorage.setItem(STOCKS_KEY, JSON.stringify(newStocks));
	};

	const addStock = (item) => {

		// Check if a stock with the same symbol and account already exists
		const stockExists = stocks.some(
			(stock) => stock.symbol === item.symbol
		);

		function addStock() {
			// Create a new object with default keys and values
			const newStock = DEFAULT_KEYS.reduce((obj, key) => {
				obj[key] = item[key] || ''; // Use value from `item` or default to ''
				return obj;
			}, {});

			// Set the index for the new stock
			newStock.index = addIndex(STOCK_COUNTER_KEY);  // Increment the counter and assign the index

			// Add the new stock to the array and update the state
			const newStocks = [...stocks, newStock];
			console.log('New localStorage stocks array after adding:', newStocks);

			setStocks(newStocks);

			// Persist the updated stocks array to local storage
			localStorage.setItem(STOCKS_KEY, JSON.stringify(newStocks));
		}

		if (!stockExists) {
			console.log('Stock does not exist, execute addStock');
			addStock()
		} else {
			// Show an alert if the stock already exists
			const confirmDupe = confirm(`${item.symbol} already exists in the list, do you want to add it again?`);

			if (confirmDupe) {
				// User clicked "OK" (Yes)
				console.log('User clicked Yes, addStock');
				addStock()
			} else {
				// User clicked "Cancel" (No)
				console.log('User clicked No');
			}
		}
	};

	const updateStock = (item) => {
		console.log('updateStock executing:', item);

		// Map through the stocks array and update the specific stock
		const updatedStocks = stocks.map((stock) =>
			stock.symbol === item.symbol && stock.index === item.index
				? { ...stock, sharesOwned: item.sharesOwned, priceBought: item.priceBought, account: item.account, virtual: item.virtual }
				: stock // Keep the original stock if it's not a match
		);

		// Update the state and local storage
		setStocks(updatedStocks);
		localStorage.setItem(STOCKS_KEY, JSON.stringify(updatedStocks));
		console.log('Updated stock store array:', updatedStocks);
	};

	const getStockData = (newData) => {	
		setStockData((prevHoldings) => {
			const updatedHoldings = prevHoldings.map((existingArray) => {
				// Match by `index` and update, otherwise keep original
				const match = newData.find(
					(newItem) => newItem.index === existingArray[0]?.index
				);
				return match ? [match] : existingArray;
			});
	
			// Add any completely new items
			const newHoldings = newData
				.filter((newItem) => !prevHoldings.some(
					(existingArray) => existingArray[0]?.index === newItem.index
				))
				.map((item) => [item]); // Wrap in arrays
	
			const combinedHoldings = [...updatedHoldings, ...newHoldings];
	
			return combinedHoldings;
		});
	};

	const getMarketStatus = (market) => {
		setMarketStatus(market)
	}

	useEffect(() => {
		if (stocks.length === stockData.length && stocks.length > 0) {
			const calculateTotals = () => {
				return stockData.reduce(
					(totals, item) => {
						// Skip virtual items
						if (item[0]?.virtual === true) return totals;

						const { dailyGain, netGain, totalValue } = item[0]; // Access the first object in each sub-array
						return {
							dailyGain: totals.dailyGain + dailyGain,
							netGain: totals.netGain + netGain,
							totalValue: totals.totalValue + totalValue,
						};
					},
					{ dailyGain: 0, netGain: 0, totalValue: 0 } // Initial totals
				);
			};
			setTotalHoldings(calculateTotals());
		}
	}, [stockData, stocks]);

	useEffect(() => {
		// Setup default stocks with unique indices
		if (!checkLS(STOCKS_KEY)) {
			const initialStocks = DEFAULT_STOCKS.map(stock => {
				stock.index = addIndex(STOCK_COUNTER_KEY);  // Set index for each default stock
				return stock;
			});

			setStocks(initialStocks);
			localStorage.setItem(STOCKS_KEY, JSON.stringify(initialStocks));
		} else {
			setStocks(JSON.parse(localStorage.getItem(STOCKS_KEY)))
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshKey]);

	return (
		<>
			<h1 className="row row-cols-2 row-cols-xs-2 g-2">
				<span className="col">Stock Ticker <button type="button" className="btn btn-primary" onClick={fetchStocks}><i className="bi bi-arrow-clockwise"></i></button></span>
				<SearchStock onSelect={addStock} />
			</h1>
				{ totalHoldings.totalValue > 0 ? (
					<div className="col-xs-6 col-sm-4 row-cols-1 g-2">
						<h2>Your Holdings:</h2>
						<h4>{`Today's Result:`} <strong style={
							hasMinusSymbol(totalHoldings.dailyGain)
									? { color: 'red' }
									: { color: 'green' }
							}>{formatCurrency(totalHoldings.dailyGain)}</strong></h4>
						<h4>{`Total Net Result:`} <strong style={
							hasMinusSymbol(totalHoldings.netGain)
									? { color: 'red' }
									: { color: 'green' }
							}>{formatCurrency(totalHoldings.netGain)}</strong></h4>
						<h4>{`Total Holdings:`} <strong style={
							hasMinusSymbol(totalHoldings.totalValue)
									? { color: 'red' }
									: { color: 'green' }
							}>{formatCurrency(totalHoldings.totalValue)}</strong></h4>
							<h4>Market Status: { marketStatus }</h4>
					</div>
				) : (
					<></>
				)}
			<div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 my-4">
				{stocks.map((item) => (
					<StockCard key={`${item.symbol}-${item.index}`} localStore={item} refresh={refreshKey} setStockData={getStockData} onUpdate={updateStock} onRemove={removeStock} getMarketStatus={getMarketStatus} />
				))}
			</div>
		</>
	)

}

export default StockPage;