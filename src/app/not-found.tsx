import React from 'react';
import Image from 'next/image';

const ErrorPage = () => {

	return (
		<>
			<section className="error-404 not-found">
				<Image
					src={`/images/404.png`}
					alt="404 Not Found"
					layout="responsive"
					width={833} 
					height={555} 
				/>
			</section>
		</>
	)

}

export default ErrorPage;