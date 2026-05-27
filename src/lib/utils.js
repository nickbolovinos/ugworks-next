// Check if the key exists in localStorage
export function checkLS(key) {
	const locStore = JSON.parse(localStorage.getItem(key));

	if (locStore?.length > 0) {
		// If the key exists, return true
		return true
	} else {
		// If the key does not exist, return false
		return false
	}
}

// Format a number as currency
export function formatCurrency(value) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(value);
}

// Strip a string as currency to numeric
export function makeNumeric(value) {
	return parseFloat(value.replace(/[^0-9.-]+/g, ''));
}

// Check if a value has a minus symbol
export function hasMinusSymbol(value) {
	// Convert the value to a string
	const strValue = String(value);

	// Check if the first character is a minus sign
	return strValue.startsWith('-');
}

// Convert a number to a percentage
export function toPercent(value, decimals = 2) {
    const percentValue = (value * 100).toFixed(decimals); // Convert to percentage and format with decimals
    return `${percentValue}%`;
}

// Stock Counter in Local Storage Incrementer
export function addIndex(key) {
	const currentCounter = parseInt(localStorage.getItem(key), 10) || 0;
	const newCounter = currentCounter + 1;

	localStorage.setItem(key, newCounter.toString());
	return newCounter;
}
