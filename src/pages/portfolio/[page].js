import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ImageCard from '@/components/ImageCard';
import { checkLS } from '@/utilities/utils';

function PortfolioPage() {

	const pages = [
		{ 'page': 'development', 'aid': 2, 'title': 'Web Development'},
		{ 'page': 'archived', 'aid': 9, 'title': 'Archive'},
		{ 'page': 'cgi', 'aid': 3, 'title': '3D'},
		{ 'page': 'print-design', 'aid': 1, 'title': 'Print Design'},
	]

	const router = useRouter();
	const { page } = router.query; // Extract 'page' from query

	const [data, setData] = useState([]);
	const [allImagesLoaded, setAllImagesLoaded] = useState(false);
	const [loadedCount, setLoadedCount] = useState(0);
	const [aid, setAid] = useState(null)

	const dataLimit = 0

	useEffect(() => {
		if (typeof window !== 'undefined') {
			import('jquery');
			import('lightbox2');
		}
	}, []);

	// Update aid when the page parameter changes
	useEffect(() => {
		if (page && page !== 'undefined') {
			console.log('page is ', page);
			const currentPage = pages.find((item) => item.page === page);
			if (currentPage) {
		setAid(currentPage.aid); // Set the aid based on the route
			}
		}
	}, [page]);

	const clickSetAid = (val) => {
		setLoadedCount(0); // Reset the loaded count
		setAllImagesLoaded(false); // Reset the flag
		setAid(val); // Update the aid
	};

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
				aid: aid
			}
		}

		if (aid !== null && !checkLS(aid)) {
			axios
				.post(apiURL, request) // Backend endpoint
				.then(response => {
					console.log('GraphQL response -',response)
					setData(response.data.data.getCards); // Save data to state
					localStorage.setItem(aid, JSON.stringify(response.data.data.getCards));
				})
				.catch(error => {
					console.error('Error fetching data:', error);
				});
		} else {
			setData(JSON.parse(localStorage.getItem(aid)))
		}
	}, [aid]);

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
			<h1>Portfolio Page</h1>
			<div id="categories">
				Sections:
				{pages.map((row, index) => (
					<Link key={index} href={row.page} className={row.aid === aid ? 'active' : 'non'} onClick={() => clickSetAid(row.aid)} >{row.title}</Link>
				))}
			</div>
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

export default PortfolioPage;