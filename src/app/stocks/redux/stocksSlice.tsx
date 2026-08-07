// store/stocksSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface StocksState {
	items: Stock[];
}

const initialState: StocksState = {
	items: [],
};

const stocksSlice = createSlice({
	name: 'stocks',
	initialState,
	reducers: {
		setStocks(state, action: PayloadAction<Stock[]>) {
			state.items = action.payload;
		},
		reorderStocks(state, action: PayloadAction<Stock[]>) {
			state.items = action.payload;
		},
		addStock(state, action: PayloadAction<Stock>) {
			state.items.push(action.payload);
		},
		updateStock(state, action: PayloadAction<Partial<Stock> & { index: number }>) {
			const index = state.items.findIndex(s => s.index === action.payload.index);
			if (index !== -1) {
				state.items[index] = { ...state.items[index], ...action.payload };
			}
		},
		removeStock(state, action: PayloadAction<number>) {
			state.items = state.items.filter(stock => stock.index !== action.payload);
		}
	}
});

export const { setStocks, reorderStocks, addStock, updateStock, removeStock } = stocksSlice.actions;
export default stocksSlice.reducer;
