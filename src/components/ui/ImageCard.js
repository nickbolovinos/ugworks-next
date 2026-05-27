import React, { useState } from 'react';
import Image from 'next/image';

const ImageCard = ({ data, onLoad }) => {

	const domain = (window.location.host.indexOf('local') > -1) ? 'https://local.gallery.ugworks.com' : 'https://gallery.ugworks.com';

	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	const handleLoad = (event) => {
		// Call the provided onLoad prop, if available
		if (onLoad) onLoad(event);
	
		// Set dynamic dimensions after the image is loaded
		setDimensions({
			width: event.target.naturalWidth,
			height: event.target.naturalHeight,
		});
	};

	return (
		<div className="col">
			<a href={`${domain}/albums/${data.filepath}${data.filename}`}
				title={data.title}
				data-lightbox={data.filename}
				data-title={data.title}>
				<Image
						className="shadow"
						src={`${domain}/albums/${data.filepath}thumb_${data.filename}`}
						alt={data.title}
						priority={false}
						onLoad={handleLoad}
						width={dimensions.width || 1}
						height={dimensions.height || 1}
					/>
			</a>
			<h2>
				<a href={data.user1}
					target="_blank"
					rel="noreferrer"
					title={`Click to go to ${data.title}'s website.`}
					dangerouslySetInnerHTML={{ __html: data.title }}>
				</a>
			</h2>
			<p className="d-none d-md-block" dangerouslySetInnerHTML={{ __html: data.caption }} ></p>
		</div>
	)

}

export default ImageCard;