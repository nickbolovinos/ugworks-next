import { configureStore } from '@reduxjs/toolkit';
import stocksReducer from '@/app/stocks/redux/stocksSlice';

const store = configureStore({
	reducer: {
		stocks: stocksReducer
	},
	devTools: process.env.NODE_ENV !== 'production',
});

export default store;

// Correct typing exports (must come *after* `store` is defined)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
