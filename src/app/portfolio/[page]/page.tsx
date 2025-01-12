
export async function generateStaticParams() {
	// Specify all possible values for the "page" parameter
	const pages = ['development', 'archived', 'cgi', 'print-design']; // Replace these with your actual dynamic paths
  
	return pages.map((page) => ({ page }));
}

import PortfolioContent from './portfolioContent'

export default function PortfolioPage({ params }: { params: { page: string } }) {
	return (
		<PortfolioContent />
	);
}