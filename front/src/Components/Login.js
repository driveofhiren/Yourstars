import React, { useEffect, useState } from 'react'
import { auth, googleProvider, signOut, onAuthStateChanged } from './Firebase'
import { signInWithPopup, signInWithRedirect } from 'firebase/auth'

const Login = ({ onLogin }) => {
	const [user, setUser] = useState(null)

	// Detect mobile devices

	useEffect(() => {
		// Listen for auth state changes
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			console.log(user)
			setUser(user)
			onLogin(user) // Pass the authenticated user to the parent
		})
		return unsubscribe
	}, [onLogin])

	const handleLogin = () => {
		// Use redirect on mobile
		// signInWithRedirect(auth, googleProvider).catch((error) => {
		// 	console.error('Error during sign-in (redirect):', error)
		// })
		// Use popup on desktop
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
		<div>
			{user ? (
				<div>
					<h2>Welcome, {user.displayName}</h2>
					<button onClick={handleLogout}>Logout</button>
				</div>
			) : (
				<button onClick={handleLogin}>Login with Google</button>
			)}
		</div>
	)
}

export default Login
