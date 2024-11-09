// src/Components/Home.js
import React, { useEffect } from 'react'
import { auth, googleProvider, onAuthStateChanged } from './Firebase'
import { signInWithPopup } from 'firebase/auth'
import './Default.css'

const Home = ({ user, onLogin, onLogout }) => {
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				onLogin(user) // Pass user state up to App.js
			}
		})
		return unsubscribe
	}, [onLogin])

	const handleLogin = () => {
		signInWithPopup(auth, googleProvider).catch((error) => {
			console.error('Error during sign-in (popup):', error)
		})
	}

	return (
		<div className="container text-center mt-5 home-container">
			<h1 className="display-3 app-title">Welcome to YourStars</h1>
			<p className="lead tagline">
				Connect with others who share your astrological placements and
				explore together.
			</p>
			<p className="mt-3 description">
				Explore your astrological placements, connect with people who
				share similar cosmic influences, and engage in enriching
				discussions about your stars.
			</p>

			<div className="cta-section text-center mt-5">
				{user ? (
					<div className="welcome-container">
						<h2 className="welcome-message">
							Welcome back, {user.displayName}!
						</h2>
						<button onClick={onLogout} className="logout-button">
							Logout
						</button>
					</div>
				) : (
					<button onClick={handleLogin} className="login-button">
						Login
					</button>
				)}
			</div>

			<div className="description-section mt-5">
				<h3 className="feature-heading">What’s Coming Next?</h3>
				<p className="feature-description">
					At YourStars, we're bringing astrology to life by allowing
					users to connect, communicate, and collaborate based on
					their planets alignments. Soon, you'll be able to privately
					message other users, build meaningful connections, and even
					match with others who share similar astrological placements.
					Whether you're seeking personal insights or looking for
					expert guidance, our platform will offer easy access to
					professional astrologers for personalized support.
				</p>
			</div>
		</div>
	)
}

export default Home
