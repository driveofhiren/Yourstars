import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Container, Col, Row, Form, Button } from 'react-bootstrap'

// Location Search Component: Fetches latitude and longitude
const LocationSearch = ({ setLatitude, setLongitude }) => {
	const [location, setLocation] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSearch = async () => {
		if (!location) return
		setLoading(true)
		try {
			console.log(location)
			// Fetch coordinates using OpenWeather API
			const response = await axios.get(
				`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=0840a2ba27dc5e44300ba5ac5043ef94`
			)
			if (response.data.length > 0) {
				const { lat, lon } = response.data[0]
				setLatitude(lat)
				setLongitude(lon)
			} else {
				alert('Location not found, please try again.')
			}
		} catch (error) {
			console.error('Error fetching location:', error)
			alert('Error fetching location, please try again later.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div>
			<Form.Control
				type="text"
				placeholder="Enter city, state, country"
				value={location}
				onChange={(e) => setLocation(e.target.value)}
			/>
			<Button
				variant="secondary"
				onClick={handleSearch}
				disabled={loading}
			>
				{loading ? 'Loading...' : 'Search Location'}
			</Button>
		</div>
	)
}

// Main Fetch Component: Handles form and astrology data fetching
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
		name: '',
	})
	const [errorMessage, setErrorMessage] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const [existingUser, setExistingUser] = useState(null) // For checking if user already exists
	const [updateExistingData, setUpdateExistingData] = useState(false) // Flag to confirm update action

	useEffect(() => {
		const checkUserExists = async () => {
			try {
				const response = await axios.get(
					'https://yourstars-lj6b.vercel.app/users'
				)
				const existingUser = response.data.find(
					(user) => user.id === formData.id
				)
				if (existingUser) {
					setExistingUser(existingUser)
					setAstrologyData(existingUser.astrologyData) // Assuming astrology data is saved under `astrologyData` field
				}
			} catch (error) {
				console.error('Error checking user:', error)
			}
		}
		checkUserExists()
	}, [formData.id])

	const handleChange = (e) => {
		const { name, value, type } = e.target

		// Handle empty input when backspace is pressed
		const newValue =
			value === '' ? '' : type === 'number' ? Number(value) : value

		setFormData({
			...formData,
			[name]: newValue,
		})
	}

	// Validate inputs
	const validateForm = () => {
		const {
			year,
			month,
			date,
			hours,
			minutes,
			seconds,
			latitude,
			longitude,
		} = formData
		const currentYear = new Date().getFullYear()

		if (year < 1900 || year > currentYear) {
			setErrorMessage('Please enter a valid year.')
			return false
		}

		if (month < 1 || month > 12) {
			setErrorMessage('Please enter a valid month (1-12).')
			return false
		}

		// Check for valid date based on the month and year
		const daysInMonth = new Date(year, month, 0).getDate()
		if (date < 1 || date > daysInMonth) {
			setErrorMessage(`Please enter a valid date (1-${daysInMonth}).`)
			return false
		}

		if (hours < 0 || hours > 23) {
			setErrorMessage('Please enter a valid hour (0-23).')
			return false
		}

		if (minutes < 0 || minutes > 59) {
			setErrorMessage('Please enter a valid minute (0-59).')
			return false
		}

		if (seconds < 0 || seconds > 59) {
			setErrorMessage('Please enter a valid second (0-59).')
			return false
		}

		if (latitude < -90 || latitude > 90) {
			setErrorMessage('Please enter a valid latitude (-90 to 90).')
			return false
		}

		if (longitude < -180 || longitude > 180) {
			setErrorMessage('Please enter a valid longitude (-180 to 180).')
			return false
		}

		setErrorMessage('')
		return true
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!validateForm()) return

		try {
			if (existingUser && !updateExistingData) {
				setSuccessMessage('Using existing astrology data.')
				return
			}

			// Submit form data to fetch astrology data
			const response = await axios.post(
				'https://yourstars-lj6b.vercel.app/fetchAstrologyData',
				formData
			)

			// Success: Set astrology data from the response
			setAstrologyData(response.data)

			// Clear messages
			setErrorMessage('')
			setSuccessMessage('Astrology data fetched and saved successfully!')
		} catch (error) {
			console.error('Error Fetching Data:', error)
			setErrorMessage(error.response?.data || error.message)
			setSuccessMessage('')
		}
	}

	return (
		<Container fluid className="h-100">
			{/* Prompt user for data update or retention */}
			{existingUser && !updateExistingData && (
				<div className="mt-3">
					<p>User data already exists. Do you want to update?</p>
					<Button
						variant="warning"
						onClick={() => setUpdateExistingData(true)}
					>
						Yes, Update Data
					</Button>
				</div>
			)}
			<Col xs={12} md={8} lg={6} className="mx-auto">
				<Row className="justify-content-center mt-5">
					<Col xs={12}>
						<Form onSubmit={handleSubmit}>
							<Row>
								{/* Form Fields */}
								<Col md={6}>
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
								<Col md={6}>
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

							{/* Location Search */}
							<Row>
								<Col md={12}>
									<LocationSearch
										setLatitude={(lat) =>
											setFormData({
												...formData,
												latitude: lat,
											})
										}
										setLongitude={(lon) =>
											setFormData({
												...formData,
												longitude: lon,
											})
										}
									/>
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
					</Col>
				</Row>
			</Col>
		</Container>
	)
}

export default Fetch
