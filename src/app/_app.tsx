import Layout from '@/app/layout';
import { AppProvider } from '@/context/AppContext';
import { Provider } from 'react-redux';
import store from '@/app/store';
import '@/styles/styles.css';
import Head from 'next/head';
import type { AppProps } from 'next/app';

const MyApp = ({ Component, pageProps }: AppProps) => {
	return (
		<Provider store={store}>
			<AppProvider>
				<Layout>
					<Head>
						<title>UG Works | </title>
						<meta name="description" content="Welcome to UG Works, enjoy your stay!" />
						<link rel="icon" href="/favicon.png" type="image/png" />
					</Head>
					<Component {...pageProps} />
				</Layout>
			</AppProvider>
		</Provider>
	);
};

export default MyApp;
