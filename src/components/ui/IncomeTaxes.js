'use client';

import { useState } from "react";

export default function TaxCalculator() {
	const individualBrackets2017 = [
		{ min: 0, max: 11600, rate: 10 },
		{ min: 11601, max: 47150, rate: 12 },
		{ min: 47151, max: 100525, rate: 22 },
		{ min: 100526, max: 191950, rate: 24 },
		{ min: 191951, max: 243725, rate: 32 },
		{ min: 243726, max: 609350, rate: 35 },
		{ min: 609351, max: Infinity, rate: 37 },
	];

	const marriedBrackets2017 = [
		{ min: 0, max: 23200, rate: 10 },
		{ min: 23201, max: 94300, rate: 12 },
		{ min: 94301, max: 201050, rate: 22 },
		{ min: 201051, max: 383900, rate: 24 },
		{ min: 383901, max: 487450, rate: 32 },
		{ min: 487451, max: 731200, rate: 35 },
		{ min: 731201, max: Infinity, rate: 37 },
	];

	const individualBrackets2016 = [
		{ min: 0, max: 9275, rate: 10 },
		{ min: 9276, max: 37650, rate: 15 },
		{ min: 37651, max: 91150, rate: 25 },
		{ min: 91151, max: 190150, rate: 28 },
		{ min: 190151, max: 413350, rate: 33 },
		{ min: 413351, max: 415050, rate: 35 },
		{ min: 415051, max: Infinity, rate: 39.6 },
	];

	const marriedBrackets2016 = [
		{ min: 0, max: 18550, rate: 10 },
		{ min: 18551, max: 75300, rate: 15 },
		{ min: 75301, max: 151900, rate: 25 },
		{ min: 151901, max: 231450, rate: 28 },
		{ min: 231451, max: 413350, rate: 33 },
		{ min: 413351, max: 466950, rate: 35 },
		{ min: 466951, max: Infinity, rate: 39.6 },
	];

	const [filingStatus, setFilingStatus] = useState("individual");
	const [brackets2017, setBrackets2017] = useState(individualBrackets2017);
	const [brackets2016, setBrackets2016] = useState(individualBrackets2016);
	const [income, setIncome] = useState(0);
	const [federalTax2017, setFederalTax2017] = useState(0);
	const [federalTax2016, setFederalTax2016] = useState(0);
	const [ficaTax, setFicaTax] = useState(0);
	const [totalTax2017, setTotalTax2017] = useState(0);
	const [totalTax2016, setTotalTax2016] = useState(0);
	const FICA_RATE = 7.65;

	const handleFilingStatusChange = (status) => {
		setFilingStatus(status);
		setBrackets2017(status === "married" ? marriedBrackets2017 : individualBrackets2017);
		setBrackets2016(status === "married" ? marriedBrackets2016 : individualBrackets2016);
	};

	const calculateTax = (brackets) => {
		let tax = 0;
		let remainingIncome = income;

		for (let bracket of brackets) {
			if (remainingIncome > bracket.min) {
				const taxableAmount = Math.min(remainingIncome, bracket.max) - bracket.min;
				tax += (taxableAmount * bracket.rate) / 100;
			}
		}
		return tax;
	};

	const handleCalculate = () => {
		const tax2017 = calculateTax(brackets2017);
		const tax2016 = calculateTax(brackets2016);
		const fica = (income * FICA_RATE) / 100;

		setFederalTax2017(tax2017);
		setFederalTax2016(tax2016);
		setFicaTax(fica);
		setTotalTax2017(tax2017 + fica);
		setTotalTax2016(tax2016 + fica);
	};

	return (
		<div className="p-4 max-w-2xl mx-auto bg-white rounded-xl shadow-md flex">
			<div className="w-1/2 p-2">
				<h3 className="text-lg font-semibold">Comparison</h3>
				<div className="mb-4">
					<label className="mr-4">
						<input
							type="radio"
							name="filingStatus"
							value="individual"
							checked={filingStatus === "individual"}
							onChange={() => handleFilingStatusChange("individual")}
						/>
						Individual
					</label>
					<label>
						<input
							type="radio"
							name="filingStatus"
							value="married"
							checked={filingStatus === "married"}
							onChange={() => handleFilingStatusChange("married")}
						/>
						Married
					</label>
				</div>
				<input
					type="number"
					value={income}
					onChange={(e) => setIncome(Number(e.target.value))}
					placeholder="Enter your income"
					className="mb-2 border p-2 w-full"
				/>
				<button onClick={handleCalculate} className="mb-4 w-full bg-blue-500 text-white p-2 rounded">
					Calculate
				</button>
			</div>
			<div className="w-1/2 p-2">
				<h3 className="text-lg font-semibold">Comparison</h3>
				<div className="text-md">2016 Federal Income Tax: ${federalTax2016.toFixed(2)}</div>
				<div className="text-md">After Trump Tax Cut: ${federalTax2017.toFixed(2)}</div>
				<div className="text-md">FICA Taxes: ${ficaTax.toFixed(2)}</div>
				<div className="text-md">2016 Total Federal Taxes: ${totalTax2016.toFixed(2)}</div>
				<div className="text-md">After Trump Tax Cut: ${totalTax2017.toFixed(2)}</div>
				<div className="text-md">Total Tax Savings: ${(totalTax2016 - totalTax2017).toFixed(2)}</div>
			</div>
		</div>
	);
}
