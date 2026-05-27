'use client'

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store';
import { setStocks, addStock as addStockAction, updateStock as updateStockAction, removeStock as removeStockAction } from '@/app/stocks/redux/stocksSlice';
import StockCard from '@/components/ui/StockCard';
import SearchStock from '@/components/ui/SearchStock';
import { checkLS, addIndex, formatCurrency, hasMinusSymbol } from '@/lib/utils';
import { ListGroup } from 'react-bootstrap';

const STOCKS_KEY = 'stocks';
const STOCK_COUNTER_KEY = 'stockCounter';

interface Stock {
	index: number;
	symbol: string;
	asset: string;
	initialShares: number | null;
	initialPrice: number | null;
	account: string;
	virtual: boolean;
	dividends: boolean;
	currentShares: number | null;
}

interface StockCalc {
	index: number;
	symbol: string;
	asset: string;
	dailyGain: number;
	netGain: number;
	dailyPercent: number;
	totalValue: number;
	virtual: boolean;
	dividends: boolean;
	currentShares: number;
}

const DEFAULT_KEYS: (keyof Stock)[] = ['index', 'symbol', 'asset', 'initialShares', 'initialPrice', 'account', 'virtual', 'dividends', 'currentShares'];
const DEFAULT_STOCKS: Stock[] = [
	{ index: 0, symbol: 'AAPL', asset: 'STOCKS', initialShares: null, initialPrice: null, account: '', virtual: false, dividends: false, currentShares: null },
	{ index: 1, symbol: 'AVGO', asset: 'STOCKS', initialShares: null, initialPrice: null, account: '', virtual: false, dividends: false, currentShares: null },
	{ index: 2, symbol: 'MSFT', asset: 'STOCKS', initialShares: null, initialPrice: null, account: '', virtual: false, dividends: false, currentShares: null },
	{ index: 3, symbol: 'NVDA', asset: 'STOCKS', initialShares: null, initialPrice: null, account: '', virtual: false, dividends: false, currentShares: null },
];

interface TotalHoldings {
	dailyGain: number;
	netGain: number;
	totalValue: number;
	netPercent: number;
}

const StockPage = () => {
	const dispatch = useDispatch();
	const stocks = useSelector((state: RootState) => state.stocks.items);

	const [refreshKey, setRefreshKey] = useState(0);
	const [stockData, setStockData] = useState<StockCalc[]>([]);
	const [totalHoldings, setTotalHoldings] = useState<TotalHoldings>({ dailyGain: 0, netGain: 0, totalValue: 0, netPercent: 0 });
	const [marketStatus, setMarketStatus] = useState<string | null>(null);

	const fetchStocks = () => setRefreshKey(prev => prev + 1);

	const addStock = (item: Stock) => {
		const exists = stocks.some(stock => stock.symbol === item.symbol);

		const createAndAddStock = () => {
			const newStock = DEFAULT_KEYS.reduce((obj, key) => {
				return { ...obj, [key]: item[key] ?? null };
			}, {} as Stock);

			newStock.index = addIndex(STOCK_COUNTER_KEY);
			dispatch(addStockAction(newStock));
			localStorage.setItem(STOCKS_KEY, JSON.stringify([...stocks, newStock]));
		};

		if (!exists) {
			createAndAddStock();
		} else if (confirm(`${item.symbol} already exists. Add again?`)) {
			createAndAddStock();
		}
	};

	const removeStock = (stock: Stock) => {
		dispatch(removeStockAction(stock.index));
		localStorage.setItem(STOCKS_KEY, JSON.stringify(stocks.filter(s => s.index !== stock.index)));
	};

	const updateStock = (item: Stock) => {
		dispatch(updateStockAction(item));
		const updatedStocks = stocks.map(s =>
			s.index === item.index ? { ...s, ...item } : s
		);
		localStorage.setItem(STOCKS_KEY, JSON.stringify(updatedStocks));
	};

	const getStockData = (newData: StockCalc[]) => {
		setStockData(prev => {
			const updatedMap = new Map<number, StockCalc>();
			prev.forEach(stock => updatedMap.set(stock.index, stock));
			newData.forEach(stock => updatedMap.set(stock.index, stock));
			return Array.from(updatedMap.values());
		});
	};

	const getMarketStatus = (market: string) => {
		setMarketStatus(market);
	};

	useEffect(() => {
		if (stocks.length === stockData.length && stocks.length > 0) {
			const totals = stockData.reduce((acc, s) => {
				if (s.virtual) return acc;
				return {
					dailyGain: acc.dailyGain + s.dailyGain,
					netGain: acc.netGain + s.netGain,
					totalValue: acc.totalValue + s.totalValue,
					netPercent: Number(((acc.dailyGain / (acc.totalValue - acc.dailyGain)) * 100).toFixed(2))
				};
			}, { dailyGain: 0, netGain: 0, totalValue: 0, netPercent: 0 });
			setTotalHoldings(totals);
		}
	}, [stockData, stocks]);

	useEffect(() => {
		if (!checkLS(STOCKS_KEY)) {
			const initial = DEFAULT_STOCKS.map(stock => ({
				...stock,
				index: addIndex(STOCK_COUNTER_KEY)
			}));
			dispatch(setStocks(initial));
			localStorage.setItem(STOCKS_KEY, JSON.stringify(initial));
		} else {
			const raw = localStorage.getItem(STOCKS_KEY);
			if (raw) dispatch(setStocks(JSON.parse(raw)));
		}
	}, [dispatch, refreshKey]);

	return (
		<>
			<h1 className="row row-cols-2 g-2">
				<span className="col">
					Stock Ticker <button className="btn btn-primary" onClick={fetchStocks}><i className="bi bi-arrow-clockwise" /></button>
				</span>
				<SearchStock onSelect={addStock} />
			</h1>

			{totalHoldings.totalValue > 0 && (
				<div className="col-xs-6 col-sm-4 row-cols-1 g-2">
					<h2>Your Holdings:</h2>
					<ListGroup className="holdings list-group-flush">
						<ListGroup.Item><h4>Market Status: {marketStatus}</h4></ListGroup.Item>
						<ListGroup.Item><h4>Value: <strong style={{ color: hasMinusSymbol(totalHoldings.totalValue) ? 'red' : 'green' }}>{formatCurrency(totalHoldings.totalValue)}</strong></h4></ListGroup.Item>
						<ListGroup.Item><h4>{`Today's Gain: `}<strong style={{ color: hasMinusSymbol(totalHoldings.dailyGain) ? 'red' : 'green' }}>{formatCurrency(totalHoldings.dailyGain)}</strong></h4></ListGroup.Item>
						<ListGroup.Item><h4>{`Today's Percent Gain: `}<strong style={{ color: hasMinusSymbol(totalHoldings.netPercent) ? 'red' : 'green' }}>{totalHoldings.netPercent}%</strong></h4></ListGroup.Item>
						<ListGroup.Item><h4>Net Gain: <strong style={{ color: hasMinusSymbol(totalHoldings.netGain) ? 'red' : 'green' }}>{formatCurrency(totalHoldings.netGain)}</strong></h4></ListGroup.Item>
					</ListGroup>
				</div>
			)}

			<div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 my-4">
				{stocks.map((item) => (
					<StockCard
						key={`${item.symbol}-${item.index}`}
						localStore={item}
						refresh={refreshKey}
						setStockData={getStockData}
						onUpdate={updateStock}
						onRemove={removeStock}
						getMarketStatus={getMarketStatus}
					/>
				))}
			</div>
		</>
	);
};

export default StockPage;
