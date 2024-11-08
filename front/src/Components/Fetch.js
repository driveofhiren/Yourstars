import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Container, Col, Row, Form, Button } from 'react-bootstrap'
import './Default.css'
import './Layout.css'

const Fetch = ({ userId }) => {
	const [formData, setFormData] = useState({
		id: userId,
		year: 1999,
		month: 1,
		date: 4,
		hours: 14,
		minutes: 15,
		seconds: 0,
		latitude: null,
		longitude: null,
		timezone: null,
		name: '',
		address: '',
		settings: {
			observation_point: 'topocentric',
			ayanamsha: 'lahiri',
		},
	})
	const [errorMessage, setErrorMessage] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const [existingUser, setExistingUser] = useState(null)
	const [updateExistingData, setUpdateExistingData] = useState(false)
	const [locationData, setLocationData] = useState(null)

	useEffect(() => {
		const checkUserExists = async () => {
			try {
				const response = await axios.get(
					`https://yourstars-lj6b.vercel.app/users/${formData.id}`
				)
				const existingUser = response.data
				if (existingUser) {
					setExistingUser(existingUser)
				}
			} catch (error) {
				console.error('Error checking user:', error)
			}
		}
		checkUserExists()
	}, [formData.id])

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData({
			...formData,
			[name]: value,
		})
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

			setLocationData({
				latitude,
				longitude,
				timezone,
			})
			setErrorMessage('')
			return true
		} catch (error) {
			console.error('Problem with fetching Location!', error)
			setErrorMessage('Problem with fetching Location. Please try again!')
			return false
		}
	}

	useEffect(() => {
		if (locationData) {
			setFormData((prevFormData) => ({
				...prevFormData,
				latitude: locationData.latitude,
				longitude: locationData.longitude,
				timezone: locationData.timezone,
			}))
		}
	}, [locationData])

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (existingUser && !updateExistingData) {
			setSuccessMessage(
				'If you want to update your Chart! Click Update data and Enter your details.'
			)
			return
		}

		await fetchLocationData()

		if (
			!locationData ||
			!locationData.latitude ||
			!locationData.longitude ||
			!locationData.timezone
		) {
			setErrorMessage('Location data is incomplete. Please try again.')
			return
		}

		try {
			const response = await axios.post(
				'https://yourstars-lj6b.vercel.app/fetchAstrologyData',
				{ ...formData, ...locationData }
			)

			if (response.data) {
				setSuccessMessage('Your chart is updated!')
				setErrorMessage('')
			} else {
				throw new Error('Database did not update.')
			}
		} catch (error) {
			console.error('Error Fetching Data:', error)
			setErrorMessage(error.response?.data || error.message)
			setSuccessMessage('')
		}
	}

	return (
		<Container fluid className="h-100">
			<Col xs={12} md={8} lg={6} className="mx-auto">
				<Row className="justify-content-center mt-5">
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
												required
											/>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group controlId="address">
											<Form.Label>Birth Place</Form.Label>
											<Form.Control
												type="text"
												name="address"
												value={formData.address}
												onChange={handleChange}
												required
												placeholder="City,State,Country"
											/>
										</Form.Group>
									</Col>
									{/* Other fields remain as they are */}
									<Col md={4}>
										<Form.Group controlId="year">
											<Form.Label>Year</Form.Label>
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
											<Form.Label>Month</Form.Label>
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
											<Form.Label>Date</Form.Label>
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
					)}
				</Row>
			</Col>
		</Container>
	)
}

export default Fetch
