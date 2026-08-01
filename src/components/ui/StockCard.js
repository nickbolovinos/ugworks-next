import React from 'react';
import { Card, ListGroup, ListGroupItem } from 'react-bootstrap';
import { formatCurrency } from '@/lib/utils';
import YourHoldings from '@/components/ui/YourHoldings';
import { useStockData } from '@/hooks/useStockData';

const StockTicker = ({ localStore, refresh, onUpdate, onRemove, setStockData, getMarketStatus, handleRef }) => {
	const { data, lastSalePrice } = useStockData(localStore, refresh, getMarketStatus);

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
		);
	}

	return (
		<div className="col">
			<Card className="h-100">
				<Card.Body>
					<div className="d-flex justify-content-between align-items-start gap-2">
						<div className="d-flex align-items-start gap-2">
							<div ref={handleRef} className="text-muted" style={{ cursor: 'grab', marginTop: '0.25rem' }} aria-label="Drag to reorder">
								<i className="bi bi-grip-vertical" />
							</div>
							<div>
								<Card.Title as="h2">
									{data.symbol}
								</Card.Title>
								<Card.Text>{data.companyName}</Card.Text>
							</div>
						</div>
						<i className="bi bi-x-square" onClick={removeStock} style={{ cursor: 'pointer' }}></i>
					</div>
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
