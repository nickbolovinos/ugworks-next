'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PortfolioIndex = () => {
	const router = useRouter();

	useEffect(() => {
		// Redirect to `/portfolio/development` by default
		router.replace('/portfolio/development');
	}, [router]);

	return null; // No UI is needed during the redirect
};

export default PortfolioIndex;
