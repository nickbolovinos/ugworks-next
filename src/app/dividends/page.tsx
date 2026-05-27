// Dividends Page Component
'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { formatCurrency } from '@/lib/utils';
import { RootState } from '@/app/store';

const DividendsPage = () => {
	const dispatch = useDispatch();
	const dividends = useSelector((state: RootState) => state);

	const [stockName, setStockName] = useState('XDTE');
	const [sharePrice, setSharePrice] = useState<number>(43.25);
	const [dividendPerShare, setDividendPerShare] = useState<number>(0.25);
	const [investment, setInvestment] = useState<number>(65400);
	const [cadence, setCadence] = useState<'weekly' | 'monthly' | 'yearly'>(
		'weekly'
	);
	const [years, setYears] = useState<number>(7);

	const [results, setResults] = useState<null | {
		initialShares: number;
		finalShares: number;
		totalDividends: number;
		totalValue: number;
		retirementIncome: number;
	}>(null);

	const DIVIDENDS_KEY = 'dividends';

	const calculate = () => {
		if (
			sharePrice <= 0 ||
			dividendPerShare < 0 ||
			investment <= 0 ||
			years <= 0
		) {
			alert('Please enter valid inputs.');
			return;
		}

		let shares = investment / sharePrice;
		let totalDividends = 0;
		let periods = 0;

		switch (cadence) {
			case 'weekly':
				periods = years * 52;
				break;
			case 'monthly':
				periods = years * 12;
				break;
			case 'yearly':
				periods = years;
				break;
		}

		for (let i = 0; i < periods; i++) {
			const dividends = shares * dividendPerShare; // this is per-period dividend
			const reinvestedShares = dividends / sharePrice;
			shares += reinvestedShares;
			totalDividends += dividends;
		}

		const totalValue = shares * sharePrice;

		setResults({
			initialShares: investment / sharePrice,
			finalShares: shares,
			totalDividends,
			totalValue,
			retirementIncome:
				(shares * dividendPerShare) /
				(cadence === 'weekly'
					? 1
					: cadence === 'monthly'
					? 4.345 // avg weeks/month
					: 52), // yearly
		});

	};

	useEffect(() => {
		localStorage.setItem(DIVIDENDS_KEY, JSON.stringify(dividends));
	}, [dispatch, dividends]);

	return (
		<main className="max-w-xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">
				Dividend Reinvestment Calculator
			</h1>

			<div className="grid gap-4">
				<input
					className="border p-2"
					placeholder="Stock name or symbol"
					value={stockName}
					onChange={(e) => setStockName(e.target.value)}
				/>

				<input
					className="border p-2"
					type="number"
					placeholder="Current share price ($)"
					value={sharePrice || ''}
					onChange={(e) => setSharePrice(parseFloat(e.target.value))}
				/>

				<input
					className="border p-2"
					type="number"
					placeholder={`Dividend per share (${cadence})`}
					value={dividendPerShare || ''}
					onChange={(e) =>
						setDividendPerShare(parseFloat(e.target.value))
					}
				/>

				<input
					className="border p-2"
					type="number"
					placeholder="Initial investment amount ($)"
					value={investment || ''}
					onChange={(e) => setInvestment(parseFloat(e.target.value))}
				/>

				<select
					className="border p-2"
					value={cadence}
					onChange={(e) =>
						setCadence(
							e.target.value as 'weekly' | 'monthly' | 'yearly'
						)
					}>
					<option value="weekly">Weekly Dividend</option>
					<option value="monthly">Monthly Dividend</option>
					<option value="yearly">Yearly Dividend</option>
				</select>

				<input
					className="border p-2"
					type="number"
					placeholder="Number of years to project"
					value={years || ''}
					onChange={(e) => setYears(parseInt(e.target.value))}
				/>

				<button
					className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
					onClick={calculate}>
					Calculate
				</button>

				{results && (
					<div className="mt-6 border-t pt-4">
						<h2 className="text-xl font-semibold mb-2">Results</h2>
						<p>
							Initial shares bought:{' '}
							{results.initialShares.toFixed(2)}
						</p>
						<p>
							Total dividends earned:{' '}
							{formatCurrency(results.totalDividends.toFixed(2))}
						</p>
						<p>
							Total shares count: {results.finalShares.toFixed(2)}
						</p>
						<p>
							Portfolio value after {years} years:{' '}
							{formatCurrency(results.totalValue.toFixed(2))}
						</p>
						<p className="text-green-700 font-bold">
							Retirement income after {years} years:{' '}
							{formatCurrency(
								results.retirementIncome.toFixed(2)
							)}{' '}
							/ {cadence}
						</p>
					</div>
				)}
			</div>
		</main>
	);
};

export default DividendsPage;
