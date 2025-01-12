import React, { useState } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';

const SearchStock = ({onSelect}) => {
	const [data, setData] = useState([]);
	const [inputValue, setInputValue] = useState('');

	const onUserEntry = (e) => {
		const request = { 'symbol' : e.target.value };
		setInputValue(e.target.value);

		const apiURL = (window.location.host.indexOf('local') > -1) ? 'http://localhost:3002/api/searchstock' : '/api/searchstock/';

		axios
			.post(apiURL, request)
			.then((response) => {
				//console.log('Search Results:', response.data.data);
				setData(response.data.data); // Set the stock data object
			})
			.catch((error) => {
				console.error('Error fetching data:', error);
			});
	};

	const addStock = (stock) => {
		onSelect(stock); // Notify the parent to add this item
		setInputValue(''); // Clear the input field
		setData([]); // Clear the dropdown
	};

	return (
		<InputGroup className="col float-end">
			<InputGroup.Text id="basic-addon1"><strong>Track a new stock:</strong></InputGroup.Text>
			<Form.Control
				placeholder="Symbol"
				aria-label="Symbol"
				aria-describedby="basic-addon1"
				value={inputValue}
				onChange={onUserEntry}
			/>
			{data && data.length > 0 && (
				<Dropdown show="true">
					<Dropdown.Menu>
						{data.map((row, index) => (
							<Dropdown.Item key={index} onClick={() => addStock(row)}>
								{row.symbol}
								<p>{row.name}</p>
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Dropdown>
			)}
		</InputGroup>
	);
};

export default SearchStock;
