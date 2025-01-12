import axios from 'axios';
import checkLS from '../utilities/localStorage';

export default function callApi(aid) {

	const request = { 'aid' : aid }

	if (!checkLS(aid)) {
		axios
			.post('http://localhost:3500/api/portfolio', request) // Backend endpoint
			.then(response => {
				localStorage.setItem(aid, JSON.stringify(response.data));
				console.log(response.data)
				return response.data;
			})
			.catch(error => {
				console.error('Error fetching data:', error);
				return
			});
	} else {
		return JSON.parse(localStorage.getItem(aid))
	}

}