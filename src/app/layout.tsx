'use client';

import React from 'react';
import { Provider } from 'react-redux';
import store from '@/app/store';
import { AppProvider } from '@/context/AppContext';
import '@/styles/styles.css'; // move your global CSS import here
import HeaderContent from '@/components/layout/HeaderContent';
import FooterContent from '@/components/layout/FooterContent';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<AppProvider>
				<head>
					<title>UG Works | </title>
					<meta
						name="description"
						content="Welcome to UG Works, enjoy your stay!"
					/>
					<link rel="icon" href="/favicon.png" type="image/png" />
				</head>
				<body>
					<Provider store={store}>
						<HeaderContent />
						<div id="content" className="container">
							{children}
						</div>
						<FooterContent />
					</Provider>
				</body>
			</AppProvider>
		</html>
	);
}
