import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ChatroomList from './ChatroomList'
import Chatroom from './ChatRoom'
import Modal from 'react-modal'
import './Layout.css'

const modalStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		width: '100%',
		maxWidth: '800px',
		maxHeight: 'auto',
		// overflowY: 'auto',
		padding: '20px',
		borderRadius: '10px',
	},
}

const ChatroomFilter = ({ userId }) => {
	const [astrologyData, setAstrologyData] = useState([])
	const [ObjectId, setObjectId] = useState('')
	const [createRoom, setCreateRoom] = useState({
		planet: [],
		sign: '',
		house: '',
	})
	const [filterRoom, setFilterRoom] = useState({
		planet: [],
		sign: '',
		house: '',
		filterBy: 'both',
	})
	const [chatrooms, setChatrooms] = useState([])
	const [joinedChatrooms, setJoinedChatrooms] = useState([])
	const [YourRooms, setYourRooms] = useState([])
	const [selectedChatroom, setSelectedChatroom] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [chats, setChats] = useState([])
	const [newMessage, setNewMessage] = useState('')
	const [conjunctions, setConjunctions] = useState({})

	const fetchChats = async (chatroomId) => {
		try {
			const response = await axios.get(
				`https://yourstars-lj6b.vercel.app/chatrooms/${chatroomId}/messages`
			)
			setChats(response.data)
		} catch (error) {
			console.error('Error fetching chatroom messages:', error)
		}
	}

	const sendMessage = async () => {
		if (!newMessage || !selectedChatroom) return

		try {
			await axios.post(
				`https://yourstars-lj6b.vercel.app/chatrooms/${selectedChatroom._id}/messages`,
				{
					ObjectId,
					content: newMessage,
				}
			)
			setNewMessage('')
			fetchChats(selectedChatroom._id)
		} catch (error) {
			console.error('Error sending message:', error)
		}
	}

	const selectChatroom = (chatroom) => {
		setSelectedChatroom(chatroom)
		setIsModalOpen(true) // Open the modal
		fetchChats(chatroom._id)
	}
	const fetchJoinedRooms = async () => {
		try {
			const response = await axios.post(
				`https://yourstars-lj6b.vercel.app/chatrooms/joined`,
				{ ObjectId }
			)
			console.log(response.data)

			setJoinedChatrooms(response.data)
		} catch (error) {
			console.error('Error fetching joined chatrooms:', error)
		}
	}
	const fetchYourRooms = async () => {
		try {
			const response = await axios.post(
				`https://yourstars-lj6b.vercel.app/chatrooms/filter`,
				{ ObjectId }
			)
			console.log(response.data)
			setYourRooms(response.data)
		} catch (error) {
			console.error('Error fetching joined chatrooms:', error)
		}
	}
	useEffect(() => {
		fetchAstrologyData()
		console.log(conjunctions)
	}, [userId])

	useEffect(() => {
		if (ObjectId) {
			// Only fetch if ObjectId is valid
			fetchJoinedRooms()
			fetchYourRooms()
		}
	}, [ObjectId])

	const fetchAstrologyData = async () => {
		try {
			const response = await axios.get(
				`https://yourstars-lj6b.vercel.app/user/${userId}`
			)
			setAstrologyData(response.data.astrologyData[1])
			setObjectId(response.data._id)

			const conjunctions = {}
			const excludedPlanets = ['Ascendant', 'Uranus', 'Neptune', 'Pluto'] // List of planets to exclude

			Object.entries(response.data.astrologyData[1]).forEach(
				([planet, data]) => {
					// Check if the planet is in the excluded list
					if (excludedPlanets.includes(planet)) {
						return // Skip this iteration if the planet is excluded
					}

					const { current_sign } = data
					const signKey = `sign-${current_sign}`
					// const houseKey = `house-${current_house}`

					if (!conjunctions[signKey]) conjunctions[signKey] = []
					// if (!conjunctions[houseKey]) conjunctions[houseKey] = []

					conjunctions[signKey].push(planet)
				}
			)

			setConjunctions(conjunctions)
		} catch (err) {
			console.error('Error fetching astrology data', err)
		}
	}

	const calculateHouse = (current_sign) => {
		if (current_sign >= astrologyData.Ascendant.current_sign)
			return current_sign - astrologyData.Ascendant.current_sign + 1
		else
			return (
				12 - (astrologyData.Ascendant.current_sign - current_sign) + 1
			)
	}

	const handleCreatePlanetChange = (selectedConjunction) => {
		const planets = selectedConjunction.split(', ')
		const primaryPlanet = planets[0]
		setCreateRoom((prev) => ({
			...prev,
			planet: selectedConjunction,
			sign: astrologyData[primaryPlanet]?.current_sign || '',
			house: calculateHouse(
				astrologyData[primaryPlanet]?.current_sign || 0
			),
		}))
	}

	const handleFilterPlanetChange = (selectedConjunction) => {
		const planets = selectedConjunction
			.split(',')
			.map((planet) => planet.trim())
		const primaryPlanet = planets[0]
		setFilterRoom((prev) => ({
			...prev,
			planet: planets,
			sign: astrologyData[primaryPlanet]?.current_sign || '',
			house: calculateHouse(
				astrologyData[primaryPlanet]?.current_sign || 0
			),
		}))
	}

	const createChatroom = async () => {
		try {
			const newRoomData = {
				planet: createRoom.planet,
				sign: createRoom.sign,
				house: createRoom.house,
				createdBy: ObjectId,
			}

			await axios.post(
				'https://yourstars-lj6b.vercel.app/chatrooms',
				newRoomData
			)
			alert('Chatroom created successfully!')
			setCreateRoom({ planet: [], sign: '', house: '' })
		} catch (err) {
			console.error('Error creating chatroom', err)
			alert(err.response.data)
		}
		await fetchJoinedRooms()
		await fetchYourRooms()
	}

	const filterChatrooms = async () => {
		const { planet, sign, house, filterBy } = filterRoom
		console.log(filterRoom)
		setChatrooms([])
		if (!planet.length || !filterBy) {
			alert(
				'Please select at least one planet and either a sign or a house.'
			)
			return
		}

		try {
			const filterData = {
				planet,
				ObjectId,
			}

			if (filterBy === 'sign' && sign) filterData.sign = sign
			if (filterBy === 'both' && sign && house) {
				filterData.sign = sign
				filterData.house = house
			} else if (filterBy === 'house' && house) filterData.house = house

			const response = await axios.post(
				'https://yourstars-lj6b.vercel.app/chatrooms/filter',
				filterData
			)
			setChatrooms(response.data)
		} catch (err) {
			console.error('Error fetching chatrooms', err)
		}
	}

	const joinChatroom = async (chatroomId) => {
		try {
			await axios.post(
				'https://yourstars-lj6b.vercel.app/chatrooms/join',
				{
					chatroomId,
					ObjectId,
				}
			)
			setChatrooms((prevChatrooms) => {
				return prevChatrooms.map((room) => {
					if (room._id === chatroomId) {
						// Add ObjectId to the members array
						return {
							...room,
							members: [...(room.members || []), ObjectId],
						}
					}
					return room
				})
			})
			setSelectedChatroom(
				chatrooms.find((room) => room._id === chatroomId)
			)
			await fetchChats(chatroomId)
			alert('Joined chatroom successfully!')
		} catch (err) {
			console.error('Error joining chatroom', err)
			alert(err.response.data)
		}
		await fetchJoinedRooms()
		await fetchYourRooms()
	}

	const leaveChatroom = async (chatroomId) => {
		try {
			await axios.post(
				`https://yourstars-lj6b.vercel.app/chatrooms/${chatroomId}/leave`,
				{ ObjectId }
			)
			setChatrooms((prevChatrooms) => {
				return prevChatrooms.map((room) => {
					if (room._id === chatroomId) {
						// Remove ObjectId from the members array
						const updatedMembers = room.members.filter(
							(memberId) => memberId !== ObjectId
						)
						return {
							...room,
							members: updatedMembers,
						}
					}
					return room
				})
			})
			// Optionally, refresh the list of chatrooms or update state
			alert('You have left the chatroom')
		} catch (error) {
			console.error('Error leaving chatroom:', error)
			alert('Failed to leave the chatroom')
		}
		await fetchJoinedRooms()
		await fetchYourRooms()
	}
	const closeModal = () => {
		setIsModalOpen(false)
		setSelectedChatroom(null)
	}
	return (
		<div className="chatroom-filter-container">
			<h2 className="chatroom-title">Astrological Chatrooms</h2>
			<div className="box">
				{/* your Chatrooms */}
				<div className="chatroom-section left-div">
					<h3>Your Chatrooms</h3>
					{YourRooms.length > 0 ? (
						<div className="joined-chatrooms">
							{YourRooms.map((chatroom) => {
								// Check if the user is a member of the chatroom
								const isMember =
									chatroom.members.includes(ObjectId)

								return (
									<div
										key={chatroom._id}
										className="chatroom-item"
									>
										{chatroom.planets.join(', ')} Sign :{' '}
										{chatroom.sign} House: {chatroom.house}{' '}
										{isMember ? (
											<button
												onClick={() =>
													leaveChatroom(chatroom._id)
												}
											>
												Leave
											</button>
										) : (
											<button
												onClick={() =>
													joinChatroom(chatroom._id)
												}
											>
												Join
											</button>
										)}
									</div>
								)
							})}
						</div>
					) : (
						<p className="empty-message">No chatrooms found.</p>
					)}
				</div>
				{/* joined Chatrooms */}
				<div className="chatroom-section middle-divs">
					<ChatroomList
						chatrooms={chatrooms}
						joinChatroom={joinChatroom}
						leaveChatroom={leaveChatroom}
						ObjectId={ObjectId}
					/>
					<h3>Joined Chatrooms</h3>
					{joinedChatrooms.length > 0 ? (
						<div className="joined-chatrooms bottom-div">
							{joinedChatrooms.map((chatroom) => (
								<div
									key={chatroom._id}
									className="chatroom-item"
									onClick={() => selectChatroom(chatroom)}
								>
									{chatroom.planets.join(', ')} Sign :{' '}
									{chatroom.sign} House: {chatroom.house} by{' '}
									{chatroom.createdBy.name}
									<button
										onClick={() =>
											leaveChatroom(chatroom._id)
										}
									>
										Leave
									</button>
								</div>
							))}
						</div>
					) : (
						<p className="empty-message">
							No joined chatrooms found.
						</p>
					)}
				</div>

				<div className="create-filter-section right-div">
					<div className="create-chatroom">
						<label>
							Research
							<select
								value={createRoom.planet}
								onChange={(e) =>
									handleCreatePlanetChange(e.target.value)
								}
							>
								<option value="">Select Conjunction</option>
								{Object.entries(conjunctions).map(
									([key, planets]) => (
										<option
											key={key}
											value={planets.join(', ')}
										>
											{planets.join(', ')}
										</option>
									)
								)}
							</select>
						</label>

						<button
							className="primary-button"
							onClick={createChatroom}
						>
							Create Chatroom
						</button>
					</div>

					<div className="filter-chatrooms">
						<label>
							Search room
							<select
								value={filterRoom.planet.join(', ')}
								onChange={(e) =>
									handleFilterPlanetChange(e.target.value)
								}
							>
								<option value="">Select Conjunction</option>
								{Object.entries(conjunctions).map(
									([key, planets]) => (
										<option
											key={key}
											value={planets.join(', ')}
										>
											{planets.join(', ')}
										</option>
									)
								)}
							</select>
							<div className="inline-labels">
								<select
									value={filterRoom.filterBy}
									onChange={(e) =>
										setFilterRoom({
											...filterRoom,
											filterBy: e.target.value,
										})
									}
								>
									<option value="both">Both</option>
									<option value="sign">Sign</option>
									<option value="house">House</option>
								</select>
								{filterRoom.filterBy !== 'house' && (
									<p className="inline-label">
										Sign {filterRoom.sign}
									</p>
								)}

								{filterRoom.filterBy !== 'sign' && (
									<p className="inline-label">
										House {filterRoom.house}
									</p>
								)}
							</div>
						</label>

						<button
							className="primary-button"
							onClick={filterChatrooms}
						>
							Filter Chatrooms
						</button>
					</div>
				</div>

				<Modal
					isOpen={isModalOpen}
					onRequestClose={closeModal}
					style={modalStyles}
					contentLabel="Chatroom"
				>
					<button onClick={closeModal} className="close-button">
						Close
					</button>
					{selectedChatroom && (
						<Chatroom
							chatroom={selectedChatroom}
							userId={userId}
							chats={chats}
							newMessage={newMessage}
							setNewMessage={setNewMessage}
							sendMessage={sendMessage}
						/>
					)}
				</Modal>
			</div>
		</div>
	)
}

export default ChatroomFilter
