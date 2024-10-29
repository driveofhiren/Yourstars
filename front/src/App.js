import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Navigation from './Components/Navigation'
import Home from './Components/Home'
import Fetch from './Components/Fetch'
import Chart from './Components/Chart'
import Profile from './Components/Profile'
import Posts from './Components/Posts'
import PostForm from './Components/PostForm'
import ChatroomFilter from './Components/ChatroomFilter' // Ensure KarmicVisuals component is imported

function App() {
	const userId = 3
	return (
		<Router>
			<Navigation />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/fetch" element={<Fetch />} />
				<Route path="/chart" element={<Chart />} />
				<Route path="/user" element={<Profile />} />
				<Route path="/posts" element={<Posts />} />
				<Route path="/postForm" element={<PostForm />} />
				{/* Add Karmic Visuals Route */}
				<Route
					path="/ChatroomFilter"
					element={<ChatroomFilter userId={userId} />}
				/>
			</Routes>
		</Router>
	)
}

export default App
