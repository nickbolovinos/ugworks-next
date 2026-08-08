'use client'

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { RootState } from '@/app/store';
import { setStocks } from '@/app/stocks/redux/stocksSlice';
import StockCard from '@/components/ui/StockCard';
import SearchStock from '@/components/ui/SearchStock';
import { addIndex, formatCurrency, hasMinusSymbol } from '@/lib/utils';
import { ListGroup } from 'react-bootstrap';

const STOCKS_KEY = 'stocks';
const STOCK_COUNTER_KEY = 'stockCounter';

interface Stock {
	uid: string;
	index: number;
	symbol: string;
	asset: string;
	initialShares: number | null;
	initialPrice: number | null;
	account: string;
	virtual: boolean;
	dividends: boolean;
	currentShares: number | null;
	sold: boolean;
	soldDate: string | null;
	soldPrice: number | null;
	realizedGain: number | null;
	realizedGainPercent: number | null;
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
	sold: boolean;
}

const DEFAULT_KEYS: (keyof Stock)[] = ['index', 'symbol', 'asset', 'initialShares', 'initialPrice', 'account', 'virtual', 'dividends', 'currentShares'];
const SOLD_DEFAULTS = { sold: false, soldDate: null, soldPrice: null, realizedGain: null, realizedGainPercent: null };
const DEFAULT_STOCKS: Omit<Stock, 'uid'>[] = [
	{ index: 0, symbol: 'AAPL', asset: 'STOCKS', initialShares: null, initialPrice: null, account: '', virtual: false, dividends: false, currentShares: null, ...SOLD_DEFAULTS },
	{ index: 1, symbol: 'AVGO', asset: 'STOCKS', initialShares: null, initialPrice: null, account: '', virtual: false, dividends: false, currentShares: null, ...SOLD_DEFAULTS },
	{ index: 2, symbol: 'MSFT', asset: 'STOCKS', initialShares: null, initialPrice: null, account: '', virtual: false, dividends: false, currentShares: null, ...SOLD_DEFAULTS },
	{ index: 3, symbol: 'NVDA', asset: 'STOCKS', initialShares: null, initialPrice: null, account: '', virtual: false, dividends: false, currentShares: null, ...SOLD_DEFAULTS },
];

interface TotalHoldings {
	dailyGain: number;
	netGain: number;
	totalValue: number;
	netPercent: number;
}

interface SortableStockCardProps {
	item: Stock;
	index: number;
	refresh: number;
	onUpdate: (item: Stock) => void;
	onRemove: (item: Stock) => void;
	setStockData: (newData: StockCalc[]) => void;
	getMarketStatus: (market: string) => void;
}

const sortStocks = (items: Stock[]) => [...items].sort((a, b) => a.index - b.index);

const createStockUid = () => {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `stock-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const persistStocks = (items: Stock[]) => {
	return items.map((stock, index) => ({
		...stock,
		uid: stock.uid ?? createStockUid(),
		index,
		sold: stock.sold ?? false,
		soldDate: stock.soldDate ?? null,
		soldPrice: stock.soldPrice ?? null,
		realizedGain: stock.realizedGain ?? null,
		realizedGainPercent: stock.realizedGainPercent ?? null,
	}));
};

const saveStocksToStorage = (items: Stock[]) => {
	const normalizedStocks = items.map((stock, index) => {
		const normalizedStock = { ...stock };
		delete normalizedStock.uid;
		return {
			...normalizedStock,
			index,
		};
	});
	localStorage.setItem(STOCKS_KEY, JSON.stringify(normalizedStocks));
};

const persistAndSaveStocks = (items: Stock[]) => {
	const nextStocks = persistStocks(items);
	if (typeof window !== 'undefined') {
		saveStocksToStorage(nextStocks);
	}
	return nextStocks;
};

const loadStocksFromStorage = (): Stock[] | null => {
	const raw = localStorage.getItem(STOCKS_KEY);
	if (!raw) {
		return null;
	}

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed) || parsed.length === 0) {
			return null;
		}

		return parsed.map((stock, index) => ({
			...stock,
			index,
			uid: stock.uid ?? createStockUid(),
			sold: stock.sold ?? false,
			soldDate: stock.soldDate ?? null,
			soldPrice: stock.soldPrice ?? null,
			realizedGain: stock.realizedGain ?? null,
			realizedGainPercent: stock.realizedGainPercent ?? null,
		}));
	} catch {
		return null;
	}
};

const SortableStockCard = ({ item, index, refresh, onUpdate, onRemove, setStockData, getMarketStatus }: SortableStockCardProps) => {
	const { handleRef, ref, isDragging } = useSortable({
		id: item.uid,
		index,
		data: { stock: item },
	});

	return (
		<div ref={ref} className="col" data-stock-uid={item.uid} style={{ opacity: isDragging ? 0.75 : 1 }}>
			<StockCard
				localStore={item}
				refresh={refresh}
				setStockData={setStockData}
				onUpdate={onUpdate}
				onRemove={onRemove}
				getMarketStatus={getMarketStatus}
				handleRef={handleRef}
			/>
		</div>
	);
};

const StockPage = () => {
	const dispatch = useDispatch();
	const stocks = useSelector((state: RootState) => state.stocks.items);

	const [refreshKey, setRefreshKey] = useState(0);
	const [stockData, setStockData] = useState<StockCalc[]>([]);
	const [totalHoldings, setTotalHoldings] = useState<TotalHoldings>({ dailyGain: 0, netGain: 0, totalValue: 0, netPercent: 0 });
	const [marketStatus, setMarketStatus] = useState<string | null>(null);
	const initialLoadComplete = React.useRef(false);
	const realizedGainsTotal = React.useMemo(
		() => stocks.reduce((sum, stock) => sum + (stock.sold ? Number(stock.realizedGain ?? 0) : 0), 0),
		[stocks]
	);

	const fetchStocks = () => setRefreshKey(prev => prev + 1);

	const addStock = (item: Stock) => {
		const exists = stocks.some(stock => stock.symbol === item.symbol);

		const createAndAddStock = () => {
			const newStock = DEFAULT_KEYS.reduce((obj, key) => {
				return { ...obj, [key]: item[key] ?? null };
			}, { ...SOLD_DEFAULTS } as Stock);

			newStock.index = addIndex(STOCK_COUNTER_KEY);
			newStock.uid = createStockUid();
			const nextStocks = persistAndSaveStocks([...stocks, newStock]);
			dispatch(setStocks(nextStocks));
		};

		if (!exists) {
			createAndAddStock();
		} else if (confirm(`${item.symbol} already exists. Add again?`)) {
			createAndAddStock();
		}
	};

	const removeStock = (stock: Stock) => {
		const nextStocks = persistAndSaveStocks(stocks.filter(s => s.index !== stock.index));
		dispatch(setStocks(nextStocks));
	};

	const updateStock = (item: Stock) => {
		const updatedStocks = stocks.map(s =>
			s.index === item.index ? { ...s, ...item } : s
		);
		const nextStocks = persistAndSaveStocks(updatedStocks);
		dispatch(setStocks(nextStocks));
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

	const handleDragEndActive = (event: DragEndEvent) => {
		const activeId = event.operation?.source?.id;
		const overId = event.operation?.target?.id;

		if (activeId == null || overId == null || activeId === overId) {
			return;
		}

		const activeStockItem = activeStocks.find(s => String(s.uid) === String(activeId));
		const overStockItem = activeStocks.find(s => String(s.uid) === String(overId));

		if (!activeStockItem || !overStockItem) {
			return;
		}

		const orderedSectionStocks = activeStocks;
		const fromIndex = orderedSectionStocks.findIndex(stock => String(stock.uid) === String(activeId));
		const toIndex = orderedSectionStocks.findIndex(stock => String(stock.uid) === String(overId));

		if (fromIndex === -1 || toIndex === -1) {
			return;
		}

		const reorderedSection = [...orderedSectionStocks];
		const [movedStock] = reorderedSection.splice(fromIndex, 1);
		const adjustedIndex = toIndex > fromIndex ? toIndex - 1 : toIndex;
		reorderedSection.splice(adjustedIndex, 0, movedStock);

		const otherSection = soldStocks;
		const nextStocks = persistAndSaveStocks([...reorderedSection, ...otherSection]);
		dispatch(setStocks(nextStocks));
	};

	const handleDragEndSold = (event: DragEndEvent) => {
		const activeId = event.operation?.source?.id;
		const overId = event.operation?.target?.id;

		if (activeId == null || overId == null || activeId === overId) {
			return;
		}

		const activeStockItem = soldStocks.find(s => String(s.uid) === String(activeId));
		const overStockItem = soldStocks.find(s => String(s.uid) === String(overId));

		if (!activeStockItem || !overStockItem) {
			return;
		}

		const orderedSectionStocks = soldStocks;
		const fromIndex = orderedSectionStocks.findIndex(stock => String(stock.uid) === String(activeId));
		const toIndex = orderedSectionStocks.findIndex(stock => String(stock.uid) === String(overId));

		if (fromIndex === -1 || toIndex === -1) {
			return;
		}

		const reorderedSection = [...orderedSectionStocks];
		const [movedStock] = reorderedSection.splice(fromIndex, 1);
		const adjustedIndex = toIndex > fromIndex ? toIndex - 1 : toIndex;
		reorderedSection.splice(adjustedIndex, 0, movedStock);

		const otherSection = activeStocks;
		const nextStocks = persistAndSaveStocks([...otherSection, ...reorderedSection]);
		dispatch(setStocks(nextStocks));
	};

	useEffect(() => {
		if (stocks.length === stockData.length && stocks.length > 0) {
			const totals = stockData.reduce((acc, s) => {
				if (s.virtual || s.sold) return acc;
				return {
					dailyGain: acc.dailyGain + s.dailyGain,
					netGain: acc.netGain + s.netGain,
					totalValue: acc.totalValue + s.totalValue,
				};
			}, { dailyGain: 0, netGain: 0, totalValue: 0 });

			totals.netGain += realizedGainsTotal;

			const priorValue = totals.totalValue - totals.dailyGain;
			const netPercent = priorValue ? Number(((totals.dailyGain / priorValue) * 100).toFixed(2)) : 0;
			setTotalHoldings({ ...totals, netPercent });
		}
	}, [stockData, stocks, realizedGainsTotal]);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const storedStocks = loadStocksFromStorage();
		if (storedStocks) {
			const nextStocks = persistStocks(storedStocks);
			dispatch(setStocks(nextStocks));
		} else {
			const initialStocks = DEFAULT_STOCKS.map(stock => ({
				...stock,
				index: addIndex(STOCK_COUNTER_KEY),
				uid: createStockUid(),
			}));
			const nextStocks = persistStocks(initialStocks);
			dispatch(setStocks(nextStocks));
		}

	}, [dispatch]);

	useEffect(() => {
		if (!initialLoadComplete.current && stocks.length > 0) {
			initialLoadComplete.current = true;
		}
	}, [stocks]);

	useEffect(() => {
		if (!initialLoadComplete.current) {
			return;
		}

		saveStocksToStorage(stocks);
	}, [stocks]);

	const activeStocks = sortStocks(stocks.filter(s => !s.sold));
	const soldStocks = sortStocks(stocks.filter(s => s.sold));

		return (
			<>
				<h1 className="row row-cols-2 g-2">
					<span className="col">
						Stock Ticker <button className="btn btn-primary" onClick={fetchStocks}><i className="bi bi-arrow-clockwise" /></button>
					</span>
					<SearchStock onSelect={addStock} />
				</h1>

				{(totalHoldings.totalValue > 0 || realizedGainsTotal !== 0) && (
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

				<DragDropProvider onDragEnd={handleDragEndActive}>
					<h2 className="mt-4">Active Stocks</h2>
					<div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 my-4">
						{activeStocks.map((item) => {
							return (
								<SortableStockCard
									key={item.uid}
									item={item}
									index={item.index}
									refresh={refreshKey}
									setStockData={getStockData}
									onUpdate={updateStock}
									onRemove={removeStock}
									getMarketStatus={getMarketStatus}
								/>
							);
						})}
					</div>
				</DragDropProvider>

				{soldStocks.length > 0 && (
					<DragDropProvider onDragEnd={handleDragEndSold}>
						<hr className="my-5" />
						<h2>Sold Stocks</h2>
						<div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 my-4">
							{soldStocks.map((item) => {
								return (
									<SortableStockCard
										key={item.uid}
										item={item}
										index={item.index}
										refresh={refreshKey}
										setStockData={getStockData}
										onUpdate={updateStock}
										onRemove={removeStock}
										getMarketStatus={getMarketStatus}
									/>
								);
							})}
						</div>
					</DragDropProvider>
				)}
			</>
		);
};

export default StockPage;
