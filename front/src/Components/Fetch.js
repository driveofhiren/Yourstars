import React, { useState } from 'react'
import axios from 'axios'
import { Container, Col, Row, Form, Button } from 'react-bootstrap'

const Fetch = ({ userId }) => {
	const [astrologyData, setAstrologyData] = useState(null)
	const [formData, setFormData] = useState({
		id: userId,
		year: 1999,
		month: 1,
		date: 4,
		hours: 14,
		minutes: 15,
		seconds: 15,
		latitude: 17.38333,
		longitude: 78.4666,
		timezone: 5.5,
		settings: {
			observation_point: 'topocentric',
			ayanamsha: 'lahiri',
		},
		name: '',
	})
	const [errorMessage, setErrorMessage] = useState('')
	const [successMessage, setSuccessMessage] = useState('')

	const handleChange = (e) => {
		const { name, value, type } = e.target
		setFormData({
			...formData,
			[name]: type === 'number' ? Number(value) : value, // Convert to number if the input type is 'number'
		})
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			// Check if the ID already exists
			const usersResponse = await axios.get('http://localhost:3333/users')
			const existingUsers = usersResponse.data
			const userExists = existingUsers.some(
				(user) => user.id === formData.id
			)

			// If user with this ID exists, throw error
			if (userExists) {
				throw new Error('ID already exists. Please use another ID.')
			}

			// Submit form data to fetch astrology data
			const response = await axios.post(
				'http://localhost:3333/fetchAstrologyData',
				formData
			)

			// Success: Set astrology data from the response
			setAstrologyData(response.data)

			// Clear messages
			setErrorMessage('')
			setSuccessMessage('Astrology data fetched and saved successfully!')
		} catch (error) {
			console.error('Error Fetching Data:', error)

			// Set error message
			setErrorMessage(error.response?.data || error.message)
			setSuccessMessage('')
		}
	}

	return (
		<Container fluid className="h-100">
			<Col xs={8} md={5}>
				<Row className="justify-content-center mt-5">
					<Col xs={12} sm={10} md={8} lg={8}>
						<Form onSubmit={handleSubmit}>
							<Row>
								{/* <Col md={4}>
									<Form.Group controlId="id">
										<Form.Label>id:</Form.Label>
										<Form.Control
											type="string"
											name="id"
											value={formData.id}
											onChange={handleChange}
											required
										/>
									</Form.Group>
								</Col> */}

								<Col md={4}>
									<Form.Group controlId="name">
										<Form.Label>Name</Form.Label>
										<Form.Control
											type="text"
											name="name"
											value={formData.name}
											onChange={handleChange}
											required
										/>
									</Form.Group>
								</Col>

								<Col md={4}>
									<Form.Group controlId="year">
										<Form.Label>Year:</Form.Label>
										<Form.Control
											type="number"
											name="year"
											value={formData.year}
											onChange={handleChange}
											required
										/>
									</Form.Group>
								</Col>

								<Col md={4}>
									<Form.Group controlId="month">
										<Form.Label>Month:</Form.Label>
										<Form.Control
											type="number"
											name="month"
											value={formData.month}
											onChange={handleChange}
											required
										/>
									</Form.Group>
								</Col>
								<Col md={4}>
									<Form.Group controlId="date">
										<Form.Label>Date:</Form.Label>
										<Form.Control
											type="number"
											name="date"
											value={formData.date}
											onChange={handleChange}
											required
										/>
									</Form.Group>
								</Col>

								<Col md={4}>
									<Form.Group controlId="hours">
										<Form.Label>Hours:</Form.Label>
										<Form.Control
											type="number"
											name="hours"
											value={formData.hours}
											onChange={handleChange}
											required
										/>
									</Form.Group>
								</Col>
								<Col md={4}>
									<Form.Group controlId="minutes">
										<Form.Label>Minutes:</Form.Label>
										<Form.Control
											type="number"
											name="minutes"
											value={formData.minutes}
											onChange={handleChange}
											required
										/>
									</Form.Group>
								</Col>
								<Col md={4}>
									<Form.Group controlId="seconds">
										<Form.Label>Seconds:</Form.Label>
										<Form.Control
											type="number"
											name="seconds"
											value={formData.seconds}
											onChange={handleChange}
											required
										/>
									</Form.Group>
								</Col>

								<Col md={4}>
									<Form.Group controlId="latitude">
										<Form.Label>Latitude:</Form.Label>
										<Form.Control
											type="number"
											name="latitude"
											value={formData.latitude}
											onChange={handleChange}
											required
										/>
									</Form.Group>
								</Col>
								<Col md={4}>
									<Form.Group controlId="longitude">
										<Form.Label>Longitude:</Form.Label>
										<Form.Control
											type="number"
											name="longitude"
											value={formData.longitude}
											onChange={handleChange}
											required
										/>
									</Form.Group>
								</Col>
								<Col md={4}>
									<Form.Group controlId="timezone">
										<Form.Label>Timezone:</Form.Label>
										<Form.Control
											type="number"
											name="timezone"
											value={formData.timezone}
											onChange={handleChange}
											required
										/>
									</Form.Group>
								</Col>
							</Row>
							<Button variant="primary" type="submit">
								Fetch Data
							</Button>
							{errorMessage && (
								<div
									className="alert alert-danger mt-3"
									role="alert"
								>
									{errorMessage}
								</div>
							)}
							{successMessage && (
								<div
									className="alert alert-success mt-3"
									role="alert"
								>
									{successMessage}
								</div>
							)}
						</Form>

						{/* Display astrology data if available */}
						{astrologyData && (
							<div className="mt-5">
								<h3>Astrology Data</h3>
								<pre>
									{JSON.stringify(astrologyData, null, 2)}
								</pre>
							</div>
						)}
					</Col>
				</Row>
			</Col>
		</Container>
	)
}

export default Fetch
