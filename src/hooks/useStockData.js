import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { makeNumeric } from '@/lib/utils';

// Global cache to store stock data by symbol
const stockDataCache = new Map();
const requestsInFlight = new Map();
const subscribers = new Map();

export const useStockData = (localStore, refresh, getMarketStatus) => {
	const [data, setData] = useState(null);
	const [lastSalePrice, setLastSalePrice] = useState(null);
	const isMountedRef = useRef(true);
	const symbolRef = useRef(localStore?.symbol);
	const lastRefreshRef = useRef(refresh);
	const shouldBypassCacheRef = useRef(false);

	useEffect(() => {
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	// Track when refresh changes and mark to bypass cache on next fetch
	useEffect(() => {
		if (refresh !== lastRefreshRef.current) {
			lastRefreshRef.current = refresh;
			shouldBypassCacheRef.current = true;
		}
	}, [refresh]);

	const handleDataUpdate = useCallback((stockData) => {
		if (!isMountedRef.current) return;
		
		setData(stockData);
		if (stockData?.primaryData?.lastSalePrice) {
			setLastSalePrice(makeNumeric(stockData.primaryData.lastSalePrice));
		}
		if (stockData?.marketStatus) {
			getMarketStatus(stockData.marketStatus);
		}
	}, [getMarketStatus]);

	useEffect(() => {
		const symbol = localStore?.symbol;
		symbolRef.current = symbol;
		
		if (!symbol) {
			setData(null);
			setLastSalePrice(null);
			return;
		}

		const bypassCache = shouldBypassCacheRef.current;
		shouldBypassCacheRef.current = false;

		// Check if data exists in cache (unless bypassing for refresh)
		if (!bypassCache && stockDataCache.has(symbol)) {
			const cachedData = stockDataCache.get(symbol);
			if (isMountedRef.current) {
				handleDataUpdate(cachedData);
			}
			return;
		}

		// Check if a request is already in flight for this symbol
		if (requestsInFlight.has(symbol)) {
			// Subscribe to updates for this symbol
			if (!subscribers.has(symbol)) {
				subscribers.set(symbol, []);
			}
			subscribers.get(symbol).push(handleDataUpdate);
			return;
		}

		// Mark request as in-flight
		requestsInFlight.set(symbol, true);

		const apiURL = (typeof window !== 'undefined' && window.location.host.indexOf('local') > -1) 
			? 'http://localhost:3001/api/stockticker' 
			: '/api/stockticker/';

		console.log(`Fetching data for ${symbol}`);

		axios
			.post(apiURL, localStore)
			.then((response) => {
				const responseData = response.data.data;
				
				if (!responseData) {
					requestsInFlight.delete(symbol);
					return;
				}

				console.log('Stock Data:', responseData);

				// Normalize data if market is not Open/Closed
				if (responseData?.marketStatus !== 'Open' && responseData?.marketStatus !== 'Closed' && responseData?.marketStatus !== null) {
					if (responseData?.secondaryData) {
						responseData.primaryData = responseData.secondaryData;
					}
				}

				// Cache the data
				stockDataCache.set(symbol, responseData);

				// Update current component
				if (isMountedRef.current && symbolRef.current === symbol) {
					handleDataUpdate(responseData);
				}

				// Notify all subscribers
				const subs = subscribers.get(symbol);
				if (subs) {
					subs.forEach(callback => {
						try {
							callback(responseData);
						} catch (err) {
							console.error('Error in subscriber callback:', err);
						}
					});
					subscribers.delete(symbol);
				}

				// Clean up in-flight request
				requestsInFlight.delete(symbol);
			})
			.catch((error) => {
				console.error(`Error fetching data for ${symbol}:`, error);
				
				// Notify subscribers of error
				const subs = subscribers.get(symbol);
				if (subs) {
					subscribers.delete(symbol);
				}
				
				requestsInFlight.delete(symbol);
			});

	}, [refresh, localStore, handleDataUpdate]);

	return { data, lastSalePrice };
};

// Function to clear cache (useful for testing or manual refresh)
export const clearStockCache = (symbol) => {
	if (symbol) {
		stockDataCache.delete(symbol);
		subscribers.delete(symbol);
	} else {
		stockDataCache.clear();
		subscribers.clear();
	}
};
