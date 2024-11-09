import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Container, Col, Row, Form, Button, Alert } from 'react-bootstrap'
import './Default.css'
import './Layout.css'

const Fetch = ({ userId }) => {
	const [formData, setFormData] = useState({
		id: userId,
		year: null,
		month: null,
		date: null,
		hours: null,
		minutes: null,
		seconds: 0,
		latitude: null,
		longitude: null,
		timezone: null,
		name: 'Atom',
		address: null,
		settings: {
			observation_point: 'topocentric',
			ayanamsha: 'lahiri',
		},
	})
	const [errorMessage, setErrorMessage] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const [existingUser, setExistingUser] = useState(null)
	const [updateExistingData, setUpdateExistingData] = useState(false)
	const [errors, setErrors] = useState({})

	useEffect(() => {
		checkUserExists()
	}, [formData.id])
	useEffect(() => {
		fetchLocationData()
	}, [formData.address])
	const checkUserExists = async () => {
		try {
			const response = await axios.get(
				`https://yourstars-lj6b.vercel.app/user/${formData.id}`
			)
			console.log(response.data.astrologyData)
			const existingUser = response.data.astrologyData
			if (existingUser) {
				setExistingUser(existingUser)
			}
		} catch (error) {
			console.error('Error checking user:', error)
		}
	}
	const handleChange = (e) => {
		const { name, value } = e.target
		let convertedValue = value

		if (
			['year', 'month', 'date', 'hours', 'minutes', 'seconds'].includes(
				name
			)
		) {
			convertedValue = parseInt(value, 10)
		} else if (['latitude', 'longitude', 'timezone'].includes(name)) {
			convertedValue = parseFloat(value)
		}

		setFormData({
			...formData,
			[name]: convertedValue,
		})
		setErrors({
			...errors,
			[name]: '', // Reset individual field error
		})
	}
	const validateForm = () => {
		const errorMessages = [] // Initialize an array to hold each error message

		// Check each field and add specific error messages if validation fails
		if (!formData.name) {
			errorMessages.push('Name is required.')
		}
		if (!formData.address) {
			errorMessages.push('Put your Birthplace.')
		}
		if (!formData.year || formData.year < 1900 || formData.year > 2024) {
			errorMessages.push('Please enter a valid year (1900-2024).')
		}
		if (!formData.month || formData.month < 1 || formData.month > 12) {
			errorMessages.push('Please enter a valid month (1-12).')
		}
		if (!formData.date || formData.date < 1 || formData.date > 31) {
			errorMessages.push('Please enter a valid date (1-31).')
		}
		if (!formData.hours || formData.hours < 0 || formData.hours > 23) {
			errorMessages.push('Please enter valid hours (0-23).')
		}
		if (
			!formData.minutes ||
			formData.minutes < 0 ||
			formData.minutes > 59
		) {
			errorMessages.push('Please enter valid minutes (0-59).')
		}

		// Set the error messages in the errorMessage state as an array
		setErrorMessage(errorMessages)

		// Return true if no errors, false if there are any
		return errorMessages.length === 0
	}

	const fetchLocationData = async () => {
		try {
			const response = await axios.get(
				`https://maps.googleapis.com/maps/api/geocode/json`,
				{
					params: {
						address: formData.address,
						key: 'AIzaSyCum25JoKirPtc-h1EUIiWqezvECXxQjVo', // Replace with actual key
					},
				}
			)
			const location = response.data.results[0].geometry.location
			const latitude = location.lat
			const longitude = location.lng

			const timezoneResponse = await axios.get(
				`https://maps.googleapis.com/maps/api/timezone/json`,
				{
					params: {
						location: `${latitude},${longitude}`,
						timestamp: Math.floor(Date.now() / 1000),
						key: 'AIzaSyCum25JoKirPtc-h1EUIiWqezvECXxQjVo', // Replace with actual key
					},
				}
			)
			const timezone = timezoneResponse.data.rawOffset / 3600

			setFormData((prevFormData) => ({
				...prevFormData,
				latitude: latitude,
				longitude: longitude,
				timezone: timezone,
			}))

			setErrorMessage('')
			return true
		} catch (error) {
			console.error('Problem with fetching Location!', error)

			return false
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setSuccessMessage('')

		if (!validateForm()) {
			return
		}

		if (existingUser && !updateExistingData) {
			setSuccessMessage(
				'If you want to update your Chart! Click Update data and Enter your details.'
			)
			return
		}

		if (formData.latitude) {
			const response = await axios.post(
				'https://yourstars-lj6b.vercel.app/fetchAstrologyData',
				{ ...formData }
			)

			if (response.data) {
				setSuccessMessage('Your chart is updated!')
				setErrorMessage('')
			} else {
				throw new Error('Database did not update.')
			}
		} else {
			setErrorMessage('Location is not updated!')
		}
	}

	return (
		<Container fluid className="h-100">
			<Col xs={12} md={8} lg={6} className="mx-auto">
				<Row className="justify-content-center mt-5">
					<Col xs={12}>
						{errorMessage.length > 0 && (
							<div className="alert">
								<ul>
									{errorMessage.map((msg, index) => (
										<p key={index}>{msg}</p>
									))}
								</ul>
							</div>
						)}{' '}
						{successMessage && (
							<div className="alert alert-success">
								<ul>
									<p>{successMessage}</p>
								</ul>
							</div>
						)}
					</Col>

					{existingUser && !updateExistingData && (
						<Col xs={12} className="text-center mb-3">
							<p>Do you want to update your chart?</p>
							<Button
								variant="warning"
								onClick={() => setUpdateExistingData(true)}
							>
								Yes
							</Button>
						</Col>
					)}
					{(!existingUser || updateExistingData) && (
						<Col xs={12}>
							<Form onSubmit={handleSubmit}>
								<Row>
									<Col md={4}>
										<Form.Group controlId="name">
											<Form.Label>Name</Form.Label>
											<Form.Control
												type="text"
												name="name"
												value={formData.name}
												onChange={handleChange}
												isInvalid={!!errors.name}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.name}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
									<Col md={8}>
										<Form.Group controlId="address">
											<Form.Label>Birth Place</Form.Label>
											<Form.Control
												type="text"
												name="address"
												value={formData.address}
												onChange={handleChange}
												isInvalid={!!errors.address}
												placeholder="City, State, Country"
											/>
											<Form.Control.Feedback type="invalid">
												{errors.address}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
									<Col md={2}>
										<Form.Group controlId="year">
											<Form.Label>Year</Form.Label>
											<Form.Control
												type="number"
												name="year"
												value={formData.year}
												onChange={handleChange}
												isInvalid={!!errors.year}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.year}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
									<Col md={2}>
										<Form.Group controlId="month">
											<Form.Label>Month</Form.Label>
											<Form.Control
												type="number"
												name="month"
												value={formData.month}
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
									<Col md={2}>
										<Form.Group controlId="date">
											<Form.Label>Date</Form.Label>
											<Form.Control
												type="number"
												name="date"
												value={formData.date}
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
									<Col md={2}>
										<Form.Group controlId="hours">
											<Form.Label>Hours:</Form.Label>
											<Form.Control
												type="number"
												name="hours"
												value={formData.hours}
												onChange={handleChange}
												placeholder="0-23"
											/>
										</Form.Group>
									</Col>
									<Col md={2}>
										<Form.Group controlId="minutes">
											<Form.Label>Minutes:</Form.Label>
											<Form.Control
												type="number"
												name="minutes"
												value={formData.minutes}
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
									<Col md={2}>
										<Button variant="primary" type="submit">
											Fetch Data
										</Button>
									</Col>
								</Row>
							</Form>
						</Col>
					)}
				</Row>
			</Col>
		</Container>
	)
}

export default Fetch
