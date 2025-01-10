import React, { useState, useEffect } from 'react';
import { Button, Accordion, ListGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { formatCurrency, makeNumeric, hasMinusSymbol, toPercent } from '../utilities/utils';

const YourHoldings = ({ stock, store, onUpdate, setStockData, refresh }) => {

	const [inputShares, setInputShares] = useState(store.sharesOwned ?? '');
	const [inputPrice, setInputPrice] = useState(store.priceBought ?? '');
	const [inputAccount, setInputAccount] = useState(store.account ?? '');
	const [virtualAccount, setVirtualAccount] = useState(store.virtual ?? false);
	const [dailyGain, setDailyGain] = useState(null);
	const [totalValue, setTotalValue] = useState(null);
	const [formSubmitted, setFormSubmitted] = useState(false);
	const [stats, setStats] = useState([]);

	// Form Handler
	const updateShares = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		setInputShares(makeNumeric(formData.get('shares')));
		setInputPrice(makeNumeric(formData.get('price')));
		setInputAccount(formData.get('account'));
		setFormSubmitted(true);
	};

	const buildMathFunctions = () => {
		const initPurchase = inputShares * inputPrice;
		const lastSalePrice = makeNumeric(stock.lastSalePrice);
		const dailyGain = stock.netChange * inputShares;
		const netGain = (inputShares * lastSalePrice) - (inputShares * inputPrice);
		const totalValue = inputShares * lastSalePrice;
		const totalGain = netGain / initPurchase;
		const data = [
			{ 'index': store.index },
			{ 'symbol': store.symbol },
			{ 'name': 'Your shares:', 'value': inputShares },
			{ 'name': 'Purchase Price:', 'value': formatCurrency(inputPrice) },
			{ 'name': 'Initial Total Purchase:', 'value': formatCurrency(initPurchase) },
			{ 'name': 'Daily Gain/Loss:', 'value': formatCurrency(dailyGain) },
			{ 'name': 'Net Dollar Gain/Loss:', 'value': formatCurrency(netGain) },
			{ 'name': 'Net Percent Gain/Loss:', 'value': toPercent(totalGain) },
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
			'virtual': virtualAccount
		}
		]);
	};

	useEffect(() => {
		buildMathFunctions();
	}, [refresh, stock]);

	useEffect(() => {
		if (formSubmitted) {
			console.log('Form submitted')
			const updatedLocalStore = { 
				'index': store.index,
				'symbol': store.symbol,
				'sharesOwned' : inputShares,
				'priceBought': inputPrice,
				'account': inputAccount,
				'virtual': virtualAccount
			};
			onUpdate(updatedLocalStore); // Notify the parent to update this item
			buildMathFunctions()
			setFormSubmitted(false); // Reset formSubmitted
		}
	}, [formSubmitted, inputShares, inputPrice, inputAccount]);

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
							<h4>Your Holdings: <strong className="float-end" style={
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
						<InputGroup>
							<Form.Control
								placeholder="Shares"
								aria-label="Shares"
								aria-describedby="Shares"
								type="number"
								value={inputShares}
								step="0.0001"
								name="shares"
								onChange={(e) => setInputShares(e.target.value)}
								required
							/>
							<Form.Control
								placeholder="Price"
								aria-label="Price"
								aria-describedby="Price"
								type="number"
								value={inputPrice}
								step="0.0001"
								name="price"
								onChange={(e) => setInputPrice(e.target.value)}
								required
							/>
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