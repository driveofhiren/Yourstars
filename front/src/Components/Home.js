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
			<h1 className="display-4">Welcome to Astrology App</h1>
			<p className="lead">
				Discover the secrets of the cosmos with our Astrology App.
				Explore your horoscope!
			</p>
			<p className="mt-4">
				In the future, we plan to add more exciting features and ideas
				to enhance your astrological journey.
			</p>

			{user ? (
				<div className="welcome-container">
					<h2 className="welcome-message">
						Welcome, {user.displayName}!
					</h2>
					<button onClick={onLogout} className="logout-button">
						Logout
					</button>
				</div>
			) : (
				<button onClick={handleLogin} className="login-button">
					Login with Google
				</button>
			)}
		</div>
	)
}

export default Home
