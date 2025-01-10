import React from 'react';
import background from '/images/404.png'

function ErrorPage() {

	return (
		<>
			<section className="error-404 not-found" style={{ backgroundImage: `url(${background})`, minHeight: `600px`, backgroundSize: `100%`}}>
			</section>
		</>
	)

}

export default ErrorPage;