import HeaderContent from '@/components/HeaderContent';
import FooterContent from '@/components/FooterContent';

const Layout = ({ children }) => {
	return (
        <>
			<div id="wrapper">
				<HeaderContent />
				<div id="content" className="container">
					{children}
				</div>
			</div>
			<FooterContent />
		</>
		);
};

export default Layout;
