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
	const [dailyGain, setDailyGain] = useState(null);
	const [totalValue, setTotalValue] = useState(null);
	const [formSubmitted, setFormSubmitted] = useState(false);
	const [stats, setStats] = useState([]);

	// Form Handler
	const updateShares = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		setIinitialShares(makeNumeric(formData.get('shares')));
		setInitialPrice(makeNumeric(formData.get('price')));
		setInputAccount(formData.get('account'));
		setFormSubmitted(true);
	};

	const buildMathFunctions = () => {
		const initPurchase = initialShares * initialPrice;
		const lastSalePrice = makeNumeric(stock.lastSalePrice);
		const dailyGain = stock.netChange * initialShares;
		const initialGain = (initialShares * lastSalePrice) - (initialShares * initialPrice);
		const currentGain = (currentShares * lastSalePrice) - (initialShares * initialPrice);
		const netGain = currentShares ? currentGain : initialGain;
		const totalValue = currentShares ? currentShares * lastSalePrice : initialShares * lastSalePrice;
		const totalGain = netGain / initPurchase;
		const data = [
			{ 'index': store.index },
			{ 'symbol': store.symbol },
			{ 'name': 'Initial Shares Bought:', 'value': initialShares },
			{ 'name': 'Initial Share Price:', 'value': formatCurrency(initialPrice) },
			{ 'name': 'Total Initial Purchase:', 'value': formatCurrency(initPurchase) },
			{ 'name': 'Current Shares:', 'value': currentShares },
			{ 'name': 'Shares Added by Reinvestment:', 'value': Number(currentShares - initialShares).toFixed(2) },
			{ 'name': 'Current Holding Value:', 'value': formatCurrency(totalValue) },
			{ 'name': 'Daily Gain/Loss:', 'value': formatCurrency(dailyGain) },
			{ 'name': 'Net Dollar Gain/Loss:', 'value': formatCurrency(netGain) },
			{ 'name': 'Net Percent Gain/Loss:', 'value': toPercent(totalGain) }
		]
		setDailyGain(dailyGain);
		setTotalValue(totalValue);
		setStats(data);
		console.log('totalValue', totalValue);
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
			'currentShares': currentShares
		}
		]);
	};

	useEffect(() => {
		buildMathFunctions();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refresh, stock]);

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
					{totalValue === 0 ? (
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
										required
									/>
								</InputGroup>
							</>
						) : (
							<></>
						)}
						<InputGroup>
							<Button type="submit">Submit</Button>
						</InputGroup>
						<InputGroup>
							<Form.Control
								placeholder="Account (Optional)"
								aria-label="Account"
								aria-describedby="Account"
								type="text"
								value={inputAccount}
								name="account"
								onChange={(e) => setInputAccount(e.target.value)}
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
							/>
							<p>-- Virtual excludes holdings from total calculations</p>
						</InputGroup>
					</Form>
				</Accordion.Body>
			</Accordion.Item>
		</Accordion>
	);
};

export default YourHoldings;