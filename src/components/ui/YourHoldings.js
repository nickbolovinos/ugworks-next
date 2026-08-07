import React, { useState, useEffect } from 'react';
import { Button, Accordion, ListGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { formatCurrency, makeNumeric, hasMinusSymbol, toPercent } from '@/lib/utils';

const YourHoldings = ({ stock, store, onUpdate, setStockData, refresh }) => {

	const [initialShares, setIinitialShares] = useState(store.initialShares ?? '');
	const [initialPrice, setInitialPrice] = useState(store.initialPrice ?? '');
	const [inputAccount, setInputAccount] = useState(store.account ?? '');
	const [virtualAccount, setVirtualAccount] = useState(store.virtual ?? false);
	const [reinvestDividends, setDividends] = useState(store.dividends ?? false);
	const [currentShares, setCurrentShares] = useState(store.currentShares ?? '');
	const [sold, setSold] = useState(store.sold ?? false);
	const [soldPrice, setSoldPrice] = useState(store.soldPrice ?? null);
	const [realizedGain, setRealizedGain] = useState(store.realizedGain ?? null);
	const [realizedGainPercent, setRealizedGainPercent] = useState(store.realizedGainPercent ?? null);
	const [dailyGain, setDailyGain] = useState(null);
	const [totalValue, setTotalValue] = useState(null);
	const [formSubmitted, setFormSubmitted] = useState(false);
	const [stats, setStats] = useState([]);

	// Form Handler
	const updateShares = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const shares = formData.get('shares');
		const price = formData.get('price');
		const account = formData.get('account');
		if (shares !== null) setIinitialShares(makeNumeric(shares));
		if (price !== null) setInitialPrice(makeNumeric(price));
		if (account !== null) setInputAccount(account);
		setFormSubmitted(true);
	};

	const handleSoldToggle = (e) => {
		const isSold = e.target.checked;
		setSold(isSold);

		if (isSold) {
			let finalGain = realizedGain;
			let finalGainPercent = realizedGainPercent;

			// Recalculate if we have a soldPrice but no realized gain yet
			if (soldPrice && !realizedGain) {
				const finalShares = currentShares || initialShares;
				const initPurchase = initialShares * initialPrice;
				finalGain = (finalShares * soldPrice) - initPurchase;
				finalGainPercent = initPurchase ? finalGain / initPurchase : 0;
				setRealizedGain(finalGain);
				setRealizedGainPercent(finalGainPercent);
			}

			onUpdate({
				index: store.index,
				symbol: store.symbol,
				initialShares,
				initialPrice,
				account: inputAccount,
				virtual: virtualAccount,
				dividends: reinvestDividends,
				currentShares,
				sold: true,
				soldDate: new Date().toISOString(),
				soldPrice: soldPrice ?? null,
				realizedGain: finalGain ?? null,
				realizedGainPercent: finalGainPercent ?? null,
			});
		} else {
			setRealizedGain(null);
			setRealizedGainPercent(null);
			setInputAccount('');

			onUpdate({
				index: store.index,
				symbol: store.symbol,
				account: '',
				sold: false,
				soldDate: null,
				soldPrice: soldPrice ?? null,
				realizedGain: null,
				realizedGainPercent: null,
			});
		}
	};

	const handleSoldPriceChange = (e) => {
		const newPrice = makeNumeric(e.target.value);
		setSoldPrice(newPrice);

		const finalShares = currentShares || initialShares;
		const initPurchase = initialShares * initialPrice;
		const finalGain = (finalShares * newPrice) - initPurchase;
		const finalGainPercent = initPurchase ? finalGain / initPurchase : 0;

		setRealizedGain(finalGain);
		setRealizedGainPercent(finalGainPercent);

		onUpdate({
			index: store.index,
			symbol: store.symbol,
			initialShares,
			initialPrice,
			account: inputAccount,
			virtual: virtualAccount,
			dividends: reinvestDividends,
			currentShares,
			sold: true,
			soldDate: store.soldDate || new Date().toISOString(),
			soldPrice: newPrice,
			realizedGain: finalGain,
			realizedGainPercent: finalGainPercent,
		});
	};

	const buildMathFunctions = () => {
		const initPurchase = initialShares * initialPrice;
		const finalShares = currentShares || initialShares;

		let dailyGain;
		let netGain;
		let totalValue;
		let totalGain;

		if (sold) {
			dailyGain = 0;
			netGain = realizedGain ?? 0;
			totalValue = finalShares * (soldPrice ?? 0);
			totalGain = realizedGainPercent ?? (initPurchase ? netGain / initPurchase : 0);
		} else {
			const lastSalePrice = makeNumeric(stock.lastSalePrice);
			dailyGain = stock.netChange * initialShares;
			const initialGain = (initialShares * lastSalePrice) - (initialShares * initialPrice);
			const currentGain = (currentShares * lastSalePrice) - (initialShares * initialPrice);
			netGain = currentShares ? currentGain : initialGain;
			totalValue = currentShares ? currentShares * lastSalePrice : initialShares * lastSalePrice;
			totalGain = netGain / initPurchase;
		}

		const data = [
			{ 'index': store.index },
			{ 'symbol': store.symbol },
			{ 'name': 'Initial Shares Bought:', 'value': initialShares },
			{ 'name': 'Initial Share Price:', 'value': formatCurrency(initialPrice) },
			{ 'name': 'Total Initial Purchase:', 'value': formatCurrency(initPurchase) },
			{ 'name': 'Current Shares:', 'value': currentShares },
			...(reinvestDividends ? [{ 'name': 'Shares Added by Reinvestment:', 'value': Number(currentShares - initialShares).toFixed(2) }] : []),
			{ 'name': sold ? 'Final Holding Value:' : 'Current Holding Value:', 'value': formatCurrency(totalValue) },
			{ 'name': 'Daily Gain/Loss:', 'value': formatCurrency(dailyGain) },
			{ 'name': sold ? 'Realized Gain/Loss:' : 'Net Dollar Gain/Loss:', 'value': formatCurrency(netGain) },
			{ 'name': sold ? 'Realized Percent Gain/Loss:' : 'Net Percent Gain/Loss:', 'value': toPercent(totalGain) }
		]
		setDailyGain(dailyGain);
		setTotalValue(totalValue);
		setStats(data);
		setStockData([
			{
			'index': store.index,
			'symbol': store.symbol,
			'dailyGain': dailyGain,
			'netGain': netGain,
			'dailyPercent': dailyGain / totalValue,
			'totalValue': totalValue,
			'virtual': virtualAccount,
			'dividends': reinvestDividends,
			'currentShares': currentShares,
			'sold': sold,
			'initialInvestment': initPurchase
		}
		]);
	};

	useEffect(() => {
		buildMathFunctions();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refresh, stock, sold, soldPrice, realizedGain]);

	useEffect(() => {
		if (formSubmitted) {
			console.log('Form submitted')
			const updatedLocalStore = { 
				'index': store.index,
				'symbol': store.symbol,
				'initialShares' : initialShares,
				'initialPrice': initialPrice,
				'account': inputAccount,
				'virtual': virtualAccount,
				'dividends': reinvestDividends,
				'currentShares': currentShares
			};
			onUpdate(updatedLocalStore); // Notify the parent to update this item
			buildMathFunctions()
			setFormSubmitted(false); // Reset formSubmitted
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formSubmitted, initialShares, initialPrice, inputAccount]);

	return (
		<Accordion>
			<Accordion.Item eventKey="0">
				<Accordion.Header>
					{sold ? (
						<>
							<h4>{`Realized Gain:`} <strong className="float-end" style={
								hasMinusSymbol(realizedGain)
									? { color: 'red' }
									: { color: 'green' }
							}>{formatCurrency(realizedGain)}</strong></h4>
						</>
					) : totalValue === 0 ? (
						<>
							Enter Your Holdings
						</>
					) : (
						<>
							<h4>{`Today's Result:`} <strong className="float-end" style={
								hasMinusSymbol(dailyGain)
									? { color: 'red' }
									: { color: 'green' }
							}>{formatCurrency(dailyGain)}</strong></h4>
						</>
					)}
				</Accordion.Header>
				<Accordion.Body>
					{totalValue === 0 ? (
						<></>
					) : (
						<ListGroup className="holdings list-group-flush">
							{stats?.map((stat, index) => (
								stat.name ? (
									<ListGroup.Item key={index}>{stat.name} <strong className="float-end" style={
										hasMinusSymbol(stat.value)
											? { color: 'red' }
											: { color: 'green' }
									}>{stat.value}</strong></ListGroup.Item>
								):(
									null
								)
							))}
						</ListGroup>
					)}
					<Form onSubmit={updateShares}>
						<h3>Initial Purchase</h3>
						<InputGroup>
							<Form.Control
								placeholder="Shares"
								aria-label="Shares"
								aria-describedby="Shares"
								type="number"
								value={initialShares}
								step="0.0001"
								name="shares"
								onChange={(e) => setIinitialShares(e.target.value)}
								disabled={sold}
								required
							/>
							<Form.Control
								placeholder="Price"
								aria-label="Price"
								aria-describedby="Price"
								type="number"
								value={initialPrice}
								step="0.0001"
								name="price"
								onChange={(e) => setInitialPrice(e.target.value)}
								disabled={sold}
								required
							/>
						</InputGroup>
						<InputGroup>
							<Form.Check // prettier-ignore
								type="switch"
								id="dividends"
								name="dividends"
								checked={reinvestDividends}
								onChange={(e) => setDividends(e.target.checked)}
								label="Reinvest Dividends"
								disabled={sold}
							/>
							<p>-- Reinvest dividends</p>
						</InputGroup>
						{reinvestDividends == true ? (
							<>
								<h3>Current Shares</h3>
								<InputGroup>
									<Form.Control
										placeholder="Current Shares"
										aria-label="Current Shares"
										aria-describedby="Current Shares"
										type="number"
										value={currentShares}
										step="0.0001"
										name="currentShares"
										onChange={(e) => setCurrentShares(e.target.value)}
										disabled={sold}
										required
									/>
								</InputGroup>
							</>
						) : (
							<></>
						)}
						<InputGroup>
							<Form.Control
								placeholder="Account (Optional)"
								aria-label="Account"
								aria-describedby="Account"
								type="text"
								value={inputAccount ?? ''}
								name="account"
								onChange={(e) => setInputAccount(e.target.value)}
								disabled={sold}
							/>
						</InputGroup>
						<InputGroup>
							<Form.Check // prettier-ignore
								type="switch"
								id="virtual"
								name="virtual"
								checked={virtualAccount}
								onChange={(e) => setVirtualAccount(e.target.checked)}
								label="Virtual Holding"
								disabled={sold}
							/>
							<p>-- Virtual excludes holdings from total calculations</p>
						</InputGroup>
						<InputGroup>
							<Form.Check // prettier-ignore
								type="switch"
								id="sold"
								name="sold"
								checked={sold}
								onChange={handleSoldToggle}
								label="Sold"
							/>
							<p>-- Freezes this position and locks in its performance permanently</p>
						</InputGroup>
						{sold && (
							<InputGroup>
								<Form.Control
									placeholder="Sold Price"
									aria-label="Sold Price"
									aria-describedby="Sold Price"
									type="number"
									value={soldPrice ?? ''}
									step="0.0001"
									name="soldPrice"
									onChange={handleSoldPriceChange}
								/>
							</InputGroup>
						)}
						<InputGroup>
							<Button type="submit">Submit</Button>
						</InputGroup>
					</Form>
				</Accordion.Body>
			</Accordion.Item>
		</Accordion>
	);
};

export default YourHoldings;