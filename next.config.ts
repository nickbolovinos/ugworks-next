/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	trailingSlash: false,	
	appDir: true,
	output: 'export',
	staticPageGenerationTimeout: 60,
	exportPathMap: async function (
		defaultPathMap,
		{ dev, dir, outDir, distDir, buildId }
		) {
			const paths = {
			'/': { page: '/' },
			'/stocks': { page: '/stocks' },
			'/contact': { page: '/contact' },
			'/portfolio/[page]': { page: '/portfolio/[page]', params: { page: ['development', 'archived', 'cgi', 'print-design'] } }
			}
			return paths
		},
	images: {
		unoptimized : true
	}
};

export default nextConfig;
