/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextConfig } from 'next';

interface PathMap {
	[key: string]: {
		page: string;
		params?: { [key: string]: string[] }; // Optional params property
	};
}

const nextConfig: NextConfig = {
	trailingSlash: false,
	reactStrictMode: false,
	output: 'export',
	staticPageGenerationTimeout: 60,
	generateStaticParams: async function (
		defaultPathMap: PathMap,
		{
			dev,
			dir,
			outDir,
			distDir,
			buildId,
		}: {
			dev: boolean;
			dir: string;
			outDir: string;
			distDir: string;
			buildId: string;
		}
	) {
		const paths: PathMap = {
			'/': { page: '/' },
			'/stocks': { page: '/stocks' },
			'/contact': { page: '/contact' },
			'/portfolio/[page]': {
				page: '/portfolio/[page]',
				params: {
					page: ['development', 'archived', 'cgi', 'print-design'],
				},
			},
		};
		return paths;
	},
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
