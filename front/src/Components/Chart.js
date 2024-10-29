import React, { useState, useEffect } from 'react'
import { Col, Row, Form, Button } from 'react-bootstrap'
import axios from 'axios'

const Chart = () => {
	const [userId, setUserId] = useState('0')
	const [user, setUser] = useState(null)
	const [astrologyData, setAstrologyData] = useState(null)
	const [clickedUserId, setClickedUserId] = useState(null)
	const [usersWithSimilarPlacement, setUsersWithSimilarPlacement] = useState(
		[]
	)
	const [allAstrologyData, setAllAstrologyData] = useState([])

	const zodiacColors = {
		1: '#7a1515', // Aries
		2: '#7a5815', // Taurus
		3: '#157a17', // Gemini
		4: '#15427a', // Cancer
		5: '#a88f02', // Leo
		6: '#147346', // Virgo
		7: '#9c1f99', // Libra
		8: '#730800', // Scorpio
		9: '#595610', // Sagittarius
		10: '#170F30', // Capricorn
		11: '#000036', // Aquarius
		12: '#635716', // Pisces
	}

	useEffect(() => {
		const fetchAllAstrologyData = async () => {
			try {
				const response = await axios.get('http://localhost:3333/users')
				setAllAstrologyData(response.data)
			} catch (error) {
				console.error('Error fetching all astrology data:', error)
			}
		}
		fetchAllAstrologyData()
	}, [])

	const getColorForSign = (sign) => {
		return zodiacColors[sign] || 'black'
	}

	const handlePlanetClick = async (planet, value) => {
		try {
			const filteredUsers = allAstrologyData.filter(
				(user) =>
					user.astrologyData[1][planet].current_sign ===
					value.current_sign
			)
			setUsersWithSimilarPlacement(filteredUsers)
		} catch (error) {
			console.error('Error filtering users:', error)
		}
	}

	const handleUserClick = (userId) => {
		setClickedUserId(userId)
	}

	const handleFormSubmit = async (e) => {
		e.preventDefault()
		try {
			const response = await axios.get(
				`http://localhost:3333/user/${userId}`
			)
			if (!response.data) {
				setAstrologyData(null)
			} else {
				setAstrologyData(response.data.astrologyData)
				setUser(response.data)
				console.log(response.data)
			}
		} catch (error) {
			console.error('Error fetching astrology data:', error)
		}
	}

	const handleInputChange = (e) => {
		setUserId(e.target.value)
	}

	return (
		<div className="container text-center mt-5">
			{user && (
				<div>
					<h3>User Details:</h3>
					<p>Hey, How are you? {user.name}</p>
				</div>
			)}
			<Form onSubmit={handleFormSubmit} className="mb-4">
				<Form.Group>
					<Form.Group className="text-center">
						<Form.Label>Enter User ID:</Form.Label>
						<Form.Control
							type="text"
							placeholder="Enter user ID"
							value={userId}
							onChange={handleInputChange}
							style={{ width: '200px', margin: 'auto' }}
						/>
					</Form.Group>
				</Form.Group>
				<Button variant="primary" type="submit" size="sm">
					View Your Chart
				</Button>
			</Form>
			<p>Users with Similar Positions:</p>
			<div className="d-flex flex-wrap justify-content-center">
				{usersWithSimilarPlacement.map((user, index) => (
					<span
						key={index}
						onClick={() => handleUserClick(user.id)}
						className="user-link"
					>
						{user.name}
					</span>
				))}
			</div>
			{astrologyData &&
				astrologyData.slice(1).map((item, index) => {
					const sortedItems = Object.entries(item)
						.filter(([_, subValue]) =>
							subValue.hasOwnProperty('current_sign')
						)
						.sort(
							([_, a], [__, b]) =>
								parseInt(a.current_sign) -
								parseInt(b.current_sign)
						)

					return (
						<div key={index} className="mt-4">
							<Row>
								{sortedItems.map(
									([subKey, subValue], planetIndex) => (
										<Col key={subKey} xs={3}>
											<section
												className="planet"
												style={{
													display: 'inline-block',
													borderRadius: '50%',
													padding: '50px',
													margin: '10px',
													width: '100px',
													height: '100px',
													backgroundColor:
														getColorForSign(
															subValue.current_sign
														),
													cursor: 'pointer',
													boxShadow: 'none',
													position: 'relative',
												}}
												onClick={() =>
													handlePlanetClick(
														subKey,
														subValue
													)
												}
											>
												<div
													className="planet-info"
													style={{
														position: 'absolute',
														top: '50%',
														left: '50%',
														transform:
															'translate(-50%, -50%)',
														color: 'white',
														textAlign: 'center',
													}}
												>
													<p>{subKey}</p>
													<p>
														{subValue.current_sign}
													</p>
													<p>
														{subValue.normDegree.toFixed(
															2
														)}
													</p>
												</div>
											</section>
										</Col>
									)
								)}
							</Row>
						</div>
					)
				})}
		</div>
	)
}

export default Chart
