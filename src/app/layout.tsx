import '@/styles/styles.css';
import HeaderContent from '@/components/layout/HeaderContent';
import FooterContent from '@/components/layout/FooterContent';

const Layout = ({ children }: { children: React.ReactNode }) => {

	return (
        <>
			<html>
				<body>
					<div id="wrapper">
						<HeaderContent />
						<div id="content" className="container">
							{children}
						</div>
					</div>
					<FooterContent />
				</body>
			</html>
		</>
		);
};

export default Layout;
