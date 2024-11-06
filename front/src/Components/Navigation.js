import React from 'react'
import { Link } from 'react-router-dom'
import { Navbar, Nav } from 'react-bootstrap'
import handleLogout from './Login'

const Navigation = ({ user, onLogout }) => {
	console.log(user)
	return (
		<Navbar bg="dark" variant="dark" expand="lg">
			<Navbar.Brand as={Link} to="/">
				YourStars
			</Navbar.Brand>
			<Navbar.Toggle aria-controls="basic-navbar-nav" />
			<Navbar.Collapse id="basic-navbar-nav">
				<Nav className="mr-auto">
					{user ? (
						<>
							<Nav.Link as={Link} to="/fetch">
								Load your Chart
							</Nav.Link>
							<Nav.Link as={Link} to="/ChatroomFilter">
								Chatroom
							</Nav.Link>
							<Nav.Link as={Link} to="/chart">
								Chart
							</Nav.Link>
							<Nav.Link
								onClick={onLogout}
								style={{ cursor: 'pointer' }}
							>
								Logout
							</Nav.Link>{' '}
							{/* Logout button */}
						</>
					) : (
						<Nav.Link as={Link} to="/Login">
							Log in
						</Nav.Link>
					)}
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	)
}

export default Navigation
