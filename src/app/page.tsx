'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageCard from '@/components/ui/ImageCard';
import { checkLS } from '@/lib/utils';

const HomePage = () => {

    const [data, setData] = useState([]);
	const [allImagesLoaded, setAllImagesLoaded] = useState(false);
	const [loadedCount, setLoadedCount] = useState(0);
	const dataLimit = 8

	const homepageAID = 2;

	// Fetch data from backend API
	useEffect(() => {

		const apiURL = (window.location.host.indexOf('local') > -1) ? 'http://localhost:3500/api/graphql' : '/api/graphql/';

		const request = {
			operationName: 'getCards',
			query: `query getCards($aid: Int!) {
						getCards(aid: $aid) {
							pid
							filename
							filepath
							title
							caption
							user1
						}
					}`,
			variables: {
				aid: homepageAID
			}
		}

		if (!checkLS(homepageAID)) {
			axios
				.post(apiURL, request) // Backend endpoint
				.then(response => {
					console.log('GraphQL response -',response)
					setData(response.data.data.getCards); // Save data to state
					localStorage.setItem(homepageAID.toString(), JSON.stringify(response.data.data.getCards));
				})
				.catch(error => {
					console.error('Error fetching data:', error);
				});
		} else {
			const storedData = localStorage.getItem(homepageAID.toString());
			if (storedData) {
				setData(JSON.parse(storedData));
			}
		}
	}, []);

	useEffect(() => {
		if (loadedCount === (dataLimit > 0 ? dataLimit : data?.length)) {
			setAllImagesLoaded(true);
		}
	}, [loadedCount, data, dataLimit ]);

	const handleImageLoad = () => {
		setLoadedCount(prev => prev + 1);
	};

    return (
		<>
			<h1>Recent Works</h1>		
			{ data?.length > 0 ? (
				<>
					<div className={`d-flex justify-content-center ${ allImagesLoaded ? 'd-none'  : {}}`}>
						<div className="spinner-border m-5" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
					<div id="gallery" className={`row gx-5 ${ allImagesLoaded ? {} : 'd-none' }`}>
						{data?.slice(0, (dataLimit > 0 ? dataLimit : data?.length)).map((row, index) => (
							<ImageCard key={index} data={row} onLoad={handleImageLoad}/>
						))}
					</div>
				</>
			) : (
				<p>No data found</p>
			)}
		</>
    )
}

export default HomePage;