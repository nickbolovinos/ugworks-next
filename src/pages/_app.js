import Layout from '@/components/layout'
import { AppProvider } from '@/context/AppContext';
import '@/css/styles.css';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
    return (
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
    )
}
