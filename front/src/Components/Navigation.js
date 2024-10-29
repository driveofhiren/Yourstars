import React from 'react'
import { Link } from 'react-router-dom'
import { Navbar, Nav } from 'react-bootstrap'

const Navigation = () => {
	return (
		<Navbar bg="dark" variant="dark" expand="lg">
			<Navbar.Brand as={Link} to="/">
				Astrology App
			</Navbar.Brand>
			<Navbar.Toggle aria-controls="basic-navbar-nav" />
			<Navbar.Collapse id="basic-navbar-nav">
				<Nav className="mr-auto">
					<Nav.Link as={Link} to="/">
						Home
					</Nav.Link>
					<Nav.Link as={Link} to="/fetch">
						Fetch Data
					</Nav.Link>
					<Nav.Link as={Link} to="/chart">
						Chart
					</Nav.Link>
					<Nav.Link as={Link} to="/user">
						User
					</Nav.Link>
					<Nav.Link as={Link} to="/posts">
						Posts
					</Nav.Link>
					<Nav.Link as={Link} to="/postForm">
						Create a Post
					</Nav.Link>
					{/* Add Karmic Visuals Link */}
					<Nav.Link as={Link} to="/ChatroomFilter">
						Chatroom
					</Nav.Link>
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	)
}

export default Navigation
