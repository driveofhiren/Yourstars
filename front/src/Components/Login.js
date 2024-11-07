import React, { useEffect, useState } from 'react'
import { auth, googleProvider, signOut, onAuthStateChanged } from './Firebase'
import { signInWithPopup, signInWithRedirect } from 'firebase/auth'
import './Default.css'

const Login = ({ onLogin }) => {
	const [user, setUser] = useState(null)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			console.log(user)
			setUser(user)
			onLogin(user)
		})
		return unsubscribe
	}, [onLogin])

	const handleLogin = () => {
		signInWithPopup(auth, googleProvider).catch((error) => {
			console.error('Error during sign-in (popup):', error)
		})
	}

	const handleLogout = () => {
		signOut(auth)
			.then(() => setUser(null))
			.catch((error) => {
				console.error('Error during sign-out:', error)
			})
	}

	return (
		<div className="login-container">
			{user ? (
				<div className="welcome-container">
					<h2 className="welcome-message">
						Welcome, {user.displayName}!
					</h2>
					<button onClick={handleLogout} className="logout-button">
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

export default Login
