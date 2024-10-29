import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Comments from './Comment'

function Posts() {
	const [posts, setPosts] = useState([])

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const response = await axios.get('http://localhost:3333/posts')

				setPosts(response.data)
			} catch (error) {
				console.error('Error fetching posts:', error)
			}
		}
		fetchPosts()
	}, [])

	const handleLike = async (postId) => {
		try {
			const response = await axios.post(
				`http://localhost:3333/posts/${postId}/like`,
				{ like: true }
			)
			setPosts((prevPosts) =>
				prevPosts.map((post) =>
					post._id === postId ? response.data : post
				)
			)
		} catch (error) {
			console.error('Error liking post:', error)
		}
	}

	const handleDislike = async (postId) => {
		try {
			const response = await axios.post(
				`http://localhost:3333/posts/${postId}/like`,
				{ like: false }
			)
			setPosts((prevPosts) =>
				prevPosts.map((post) =>
					post._id === postId ? response.data : post
				)
			)
		} catch (error) {
			console.error('Error disliking post:', error)
		}
	}

	const getPlanetaryInfluence = (astrologyData, postType) => {
		console.log(astrologyData)
		if (!astrologyData || !astrologyData[postType]) {
			return {}
		}

		const planetInfo = astrologyData[postType]
		const sign = getSignName(planetInfo.current_sign)
		const degree =
			typeof planetInfo.normDegree === 'number'
				? planetInfo.normDegree
				: 0
		const isRetro = planetInfo.isRetro === true

		return {
			sign,
			degree,
			isRetro,
		}
	}

	const getSignName = (signIndex) => {
		const zodiacSigns = [
			'Aries',
			'Taurus',
			'Gemini',
			'Cancer',
			'Leo',
			'Virgo',
			'Libra',
			'Scorpio',
			'Sagittarius',
			'Capricorn',
			'Aquarius',
			'Pisces',
		]
		return zodiacSigns[signIndex - 1] || 'Unknown'
	}

	return (
		<div className="container mx-auto mt-10">
			{posts.length > 0 ? (
				posts.map((post) => {
					const { sign, degree, isRetro } = getPlanetaryInfluence(
						post.user.astrologyData,
						post.karma_type
					)

					return (
						<div
							key={post._id}
							className={`shadow-lg rounded-lg p-6 mb-4 relative ${post.karma_type}`}
							style={{
								borderColor:
									post.user.karma.sun > 50
										? 'gold'
										: 'silver',
								borderWidth:
									post.user.karma.moon > 30 ? '2px' : '1px',
							}}
						>
							<h4>{post.user.name}</h4>
							<p>{post.content}</p>
							<span className="text-sm text-gray-500">
								Karma Type: {post.karma_type}
							</span>
							<div className="flex items-center mt-4">
								<button
									onClick={() => handleLike(post._id)}
									className="mr-4 text-blue-500 hover:text-blue-700"
								>
									Like
								</button>
								<button
									onClick={() => handleDislike(post._id)}
									className="text-red-500 hover:text-red-700"
								>
									Dislike
								</button>
								<span className="ml-4">
									Likes: {post.likes}
								</span>
							</div>
							<Comments postId={post._id} />
						</div>
					)
				})
			) : (
				<p>No posts available</p>
			)}
		</div>
	)
}

export default Posts
