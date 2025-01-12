import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, ListGroup, ListGroupItem } from 'react-bootstrap';
import { formatCurrency, makeNumeric } from '@/lib/utils';
import YourHoldings from '@/components/ui/YourHoldings';

const StockTicker = ({ localStore, refresh, onUpdate, onRemove, setStockData, getMarketStatus }) => {
	const [data, setData] = useState(null);
	const [lastSalePrice, setLastSalePrice] = useState(null);

	useEffect(() => {
		const request = localStore;

		const apiURL = (window.location.host.indexOf('local') > -1) ? 'http://localhost:3001/api/stockticker' : '/api/stockticker/';

		axios
			.post(apiURL, request)
			.then((response) => {
				const data = response.data.data;
				//console.log('Stock Data:', data);
				getMarketStatus(data.marketStatus)
				if (data.marketStatus !== 'Open' && data.marketStatus !== 'Closed') {
					data.primaryData = data.secondaryData;
				}
				setLastSalePrice(makeNumeric(data.primaryData.lastSalePrice));
				setData(data); // Set the stock data object
			})
			.catch((error) => {
				console.error('Error fetching data:', error);
			});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refresh]);

	const removeStock = () => {
		onRemove(localStore); // Notify the parent to remove this item
	};

	if (!data) {
		return (
			<div className="d-flex justify-content-center">
				<div className="spinner-border m-5" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		)
	}

	return (
		<div className="col">
			<Card className="h-100">
				<Card.Body>
					<Card.Title as="h2">
						{data.symbol}{' '}
						<i className="bi bi-x-square float-end" onClick={removeStock}></i>
					</Card.Title>
					<Card.Text>{data.companyName}</Card.Text>
				</Card.Body>
				<Card.Footer>
					<ListGroup className="list-group-flush">
						{localStore.account ? (
							<ListGroupItem className="account">Account: <strong>{localStore.account}</strong></ListGroupItem>
						) : (
							<></>
						)}
						<ListGroup.Item>{formatCurrency(lastSalePrice)}</ListGroup.Item>
						<ListGroup.Item>
							<span
								style={
									data.primaryData.deltaIndicator === 'down'
										? { color: 'red' }
										: { color: 'green' }
								}
							>
								{data.primaryData.netChange}
							</span>{' '}
							({data.primaryData.percentageChange})
						</ListGroup.Item>
						<ListGroup.Item>
							{/* This is the Your Holdings Accordion Section */}
							<YourHoldings stock={data.primaryData} store={localStore} onUpdate={onUpdate} setStockData={setStockData} refresh={refresh} />
						</ListGroup.Item>
					</ListGroup>
				</Card.Footer>
			</Card>
		</div>
	);
};

export default StockTicker;
