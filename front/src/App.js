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
import Login from './Components/Login'
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
		} catch (error) {
			console.error('Error during sign-out:', error)
		}
	}

	return (
		<Router>
			<Navigation user={user} onLogout={handleLogout} />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route
					path="/fetch"
					element={
						user ? (
							<Fetch userId={user?.uid} />
						) : (
							<Login onLogin={setUser} />
						)
					}
				/>
				<Route path="/chart" element={<Chart userId={user?.uid} />} />
				<Route path="/user" element={<Profile />} />
				<Route
					path="/postForm"
					element={user ? <PostForm /> : <Login onLogin={setUser} />}
				/>
				<Route path="/Login" element={<Login onLogin={setUser} />} />
				<Route
					path="/ChatroomFilter"
					element={
						user ? (
							<ChatroomFilter userId={user?.uid} />
						) : (
							<Login onLogin={setUser} />
						)
					}
				/>
			</Routes>
		</Router>
	)
}

export default App
