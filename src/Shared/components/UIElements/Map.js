import React, { useEffect, useRef } from 'react';
import './map.css';

const Map = (props) => {
	const mapRef = useRef();

	useEffect(() => {
		if (!mapRef.current || !props.center) {
			return;
		}
		const { lat, lng } = props.center;
		const iframe = document.createElement('iframe');
		iframe.width = '100%';
		iframe.height = '100%';
		iframe.style.border = '0';
		iframe.loading = 'lazy';
		iframe.referrerPolicy = 'no-referrer-when-downgrade';
		iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.02}%2C${lng + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`;
		mapRef.current.innerHTML = '';
		mapRef.current.appendChild(iframe);
	}, [props.center]);

	return (
		<div
			ref={mapRef}
			className={`map ${props.className || ''}`}
			style={props.style}
		>
			{!props.center && <p>Map unavailable</p>}
		</div>
	);
};

export default Map;
