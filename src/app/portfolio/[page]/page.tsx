
export async function generateStaticParams() {
	// Specify all possible values for the "page" parameter
	const pages = ['development', 'archived', 'cgi', 'print-design']; 
  
	return pages.map((page) => ({ page }));
}

import PortfolioContent from './portfolioContent'

const PortfolioPage = () => {
	return (
		<PortfolioContent />
	);
}

export default PortfolioPage;