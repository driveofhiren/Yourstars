import React from 'react'
import { Link } from 'react-router-dom'
import { Navbar, Nav } from 'react-bootstrap'
import './Default.css' // Import CSS styles

const Navigation = ({ user, onLogout }) => {
	return (
		<Navbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
			<Navbar.Brand as={Link} to="/" className="brand-name">
				YourStars
			</Navbar.Brand>
			<Navbar.Toggle aria-controls="basic-navbar-nav" />
			<Navbar.Collapse id="basic-navbar-nav">
				<Nav className="ml-auto">
					{user && (
						<>
							<Navbar.Text
								className="user-display"
								style={{ margin: '0 auto', color: '#F6FB7A' }}
							>
								<strong>{user.displayName}</strong>
							</Navbar.Text>
							<Nav.Link
								as={Link}
								to="/fetch"
								className="nav-link"
							>
								Load Your Chart
							</Nav.Link>
							<Nav.Link
								as={Link}
								to="/Chatrooms"
								className="nav-link"
							>
								Chatrooms
							</Nav.Link>

							<Nav.Link
								onClick={onLogout}
								className="nav-link logout-link"
								style={{ cursor: 'pointer', color: '#ff6666' }}
							>
								Logout
							</Nav.Link>
						</>
					)}
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	)
}

export default Navigation
