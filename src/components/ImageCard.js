'use client'

import React from 'react';

const ImageCard = ({ data, onLoad }) => {

    const domain = (window.location.host.indexOf('local') > -1) ? 'https://local.gallery.ugworks.com' : 'https://gallery.ugworks.com';

    return (
        <div className="col">
            <a href={`${domain}/albums/${data.filepath}${data.filename}`} 
                title={data.title} 
                data-lightbox={data.filename} 
                data-title={data.title}>
                    <picture>
                        <img 
                            className="shadow"
                            src={`${domain}/albums/${data.filepath}thumb_${data.filename}`} 
                            alt={data.title}
                            onLoad={onLoad}
                        />
                    </picture>
                    
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