import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';

const SearchStock = ({onSelect}) => {
	const [data, setData] = useState([]);
	const [inputValue, setInputValue] = useState('');
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownRef = useRef(null);

	const onUserEntry = (e) => {
		const request = { 'symbol' : e.target.value };
		setInputValue(e.target.value);

		const apiURL = (window.location.host.indexOf('local') > -1) ? 'http://localhost:3002/api/searchstock' : '/api/searchstock/';

		axios
			.post(apiURL, request)
			.then((response) => {
				setData(response.data.data);
				setShowDropdown(true);
			})
			.catch((error) => {
				console.error('Error fetching data:', error);
			});
	};

	const addStock = (stock) => {
		onSelect(stock);
		setInputValue('');
		setData([]);
		setShowDropdown(false);
	};

	const handleEscape = (e) => {
		if (e.key === 'Escape') {
			setShowDropdown(false);
		}
	};

	useEffect(() => {
		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, []);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setShowDropdown(false);
			}
		};

		if (showDropdown) {
			document.addEventListener('click', handleClickOutside);
		}

		return () => document.removeEventListener('click', handleClickOutside);
	}, [showDropdown]);

	return (
		<InputGroup className="col float-end" ref={dropdownRef}>
			<InputGroup.Text id="basic-addon1"><strong>Track a new stock:</strong></InputGroup.Text>
			<Form.Control
				placeholder="Symbol"
				aria-label="Symbol"
				aria-describedby="basic-addon1"
				value={inputValue}
				onChange={onUserEntry}
			/>
			{data && data.length > 0 && (
				<Dropdown show={showDropdown} onToggle={setShowDropdown}>
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
