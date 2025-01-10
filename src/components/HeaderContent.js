'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LoginModal from '@/components/LoginModal';


function HeaderContent() {

	const topnav = [
		{ 'title': 'home', 'url': '/' },
		{ 'title': 'stocks', 'url': '/stocks' },
		{ 'title': 'portfolio', 'url': '/portfolio' },
		{ 'title': 'contact', 'url': '/contact' }
	]

	const [currentPath, setCurrentPath] = useState('');

	useEffect(() => {
		// Ensure this code runs only on the client
		setCurrentPath(window.location.pathname);
	}, []);

	const active = (val) => {
		if (currentPath.includes(val)) {
			return 'current';
		} else if (currentPath === '/' && val === 'home') {
			return 'current';
		}
		return '';
	};

	const [showLoginModal, setShowLoginModal] = useState(false);

	const handleLogin = (userData) => {
		console.log('User Logged in:', userData);
		// Here you would make your api call to login the user.
	};

	const handleSignup = (userData) => {
		console.log('New User Registered:', userData);
		// Here you would make your api call to register the user.
	};

	const handleModalClose = () => setShowLoginModal(false);

	return (
		<div className="container-fluid" id="header">
			<div className="container">
				<ul id="topnav" className="row">
					{topnav.map((item, index) => (
						<li className="col" key={index}>
							<Link href={item.url} className={active(item.title)} >{item.title}</Link>
						</li>
					))}
					<li className="col">
						<Link href="#" onClick={() => setShowLoginModal(true)} >Login</Link>
					</li>
					<LoginModal
						show={showLoginModal}
						onClose={handleModalClose}
						onLogin={handleLogin}
						onSignup={handleSignup}
					/>
				</ul>
				<div id="logo">
					<Link href="/">
						<Image className="img-fluid" src="/images/ugworks_logo.png" alt="logo" width="692" height="139" />
					</Link>
				</div>
				<h2 className="d-none d-lg-block">We specialize in small businesses that need a beautiful, <br />yet functional web presence to help their business grow!</h2>
			</div>
		</div>
	)

}

export default HeaderContent;