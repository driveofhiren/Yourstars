// src/App.js
import React, { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { signOut } from './Components/Firebase'
import Navigation from './Components/Navigation'
import Home from './Components/Home'
import Fetch from './Components/Fetch'
import Chart from './Components/Chart'
import Profile from './Components/Profile'
import PostForm from './Components/PostForm'
import ChatroomFilter from './Components/ChatroomFilter'
import { auth } from './Components/Firebase'

function App() {
	const [user, setUser] = useState(null)

	const handleLogin = (user) => {
		setUser(user)
	}

	const handleLogout = async () => {
		try {
			await signOut(auth)
			setUser(null)
			// Redirect to home page after logout
		} catch (error) {
			console.error('Error during sign-out:', error)
		}
	}

	return (
		<Router>
			<Navigation user={user} onLogout={handleLogout} />
			<Routes>
				<Route
					path="/"
					element={
						<Home
							user={user}
							onLogin={handleLogin}
							onLogout={handleLogout}
						/>
					}
				/>
				<Route
					path="/fetch"
					element={
						user ? (
							<Fetch userId={user?.uid} />
						) : (
							<Home onLogin={setUser} />
						)
					}
				/>
				<Route
					path="/chart"
					element={
						user ? (
							<Chart userId={user?.uid} />
						) : (
							<Home onLogin={setUser} />
						)
					}
				/>
				<Route
					path="/user"
					element={user ? <Profile /> : <Home onLogin={setUser} />}
				/>
				<Route
					path="/postForm"
					element={user ? <PostForm /> : <Home onLogin={setUser} />}
				/>
				<Route
					path="/Chatrooms"
					element={
						user ? (
							<ChatroomFilter userId={user?.uid} />
						) : (
							<Home onLogin={setUser} />
						)
					}
				/>
			</Routes>
		</Router>
	)
}

export default App
