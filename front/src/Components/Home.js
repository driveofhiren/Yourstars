// src/Components/Home.js
import React, { useEffect } from 'react'
import { auth, googleProvider, onAuthStateChanged } from './Firebase'
import { signInWithPopup } from 'firebase/auth'
import { Container, Row, Col, Button, Form } from 'react-bootstrap'
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
				Dive into your astrological journey and connect with others who
				share your cosmic influence.
			</p>
			<p className="mt-3 description">
				Explore your unique astrological placements, engage with people
				who share similar cosmic energies, and start meaningful
				conversations about your stars. The universe has a lot to reveal
				— let's discover it together.
			</p>

			<Container className="cta-section">
				<Row className="justify-content-center">
					<Col md={6}>
						{user ? (
							<div className="welcome-container text-center">
								<h2 className="welcome-message">
									Welcome back, {user.displayName}!
								</h2>
								<Button
									onClick={onLogout}
									className="logout-button mt-3"
								>
									Logout
								</Button>
							</div>
						) : (
							<div className="login-container text-center">
								<Button
									onClick={handleLogin}
									className="login-button mt-3"
								>
									Login with Google
								</Button>
							</div>
						)}
					</Col>
				</Row>
			</Container>

			<div className="contribute-section mt-5">
				<h3 className="contribute-heading">
					How You’re Contributing to the Project
				</h3>
				<p className="contribute-description">
					Every time you provide your experience, you help improve and
					enrich our platform. Your insights are invaluable, and we’re
					grateful for your participation. Together, we’re building a
					community that connects people based on their celestial
					influences — thank you for being part of the journey!
				</p>
			</div>

			<div className="description-section mt-5">
				<h3 className="feature-heading">What’s Coming Next?</h3>
				<p className="feature-description">
					We're just getting started at YourStars! In the near future,
					we will be working on improving layouts, UI design, and
					visualizations to enhance the overall user experience.
					Additionally, we are implementing a rating system to assess
					users and chatrooms based on relevance, engagement, and
					other factors to provide a more personalized experience. We
					also aim to enable users to provide feedback and collaborate
					with us to continually improve the app.
				</p>
			</div>
		</div>
	)
}

export default Home
