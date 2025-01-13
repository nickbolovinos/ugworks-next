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
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
