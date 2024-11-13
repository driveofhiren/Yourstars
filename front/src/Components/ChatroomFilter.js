import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ChatroomList from './ChatroomList'
import Chatroom from './ChatRoom'
import Modal from 'react-modal'
import './Layout.css'
import PlanetaryCircle from './PlanetaryCircle'

const modalStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		background: '#a3d8ff',
		boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // corrected property name
		transition: 'background-color 0.3s ease, transform 0.2s ease',
		width: '100%',
		maxWidth: '90%',
		maxHeight: 'auto',
		// overflowY: 'auto',
		padding: '20px',
		borderRadius: '10px',
	},
}

const ChatroomFilter = ({ userId }) => {
	const [astrologyData, setAstrologyData] = useState([])
	const [ObjectId, setObjectId] = useState('')
	const [relatedRooms, setRelatedRooms] = useState([])
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

	const fetchRelatedRooms = async () => {
		if (!conjunctions) return
		const fetchedRelatedRooms = []

		// Iterate over conjunctions and fetch rooms for each conjunction
		for (const [signKey, planetsData] of Object.entries(conjunctions)) {
			// Extract only the planet names from planetsData
			const planetNames = planetsData.map((p) => p.planet)

			// Determine the sign and house based on the first planet in the conjunction
			const primaryPlanet = planetNames[0]
			const sign = astrologyData[primaryPlanet]?.current_sign || ''
			const house = calculateHouse(sign)

			// Prepare filter data for this conjunction
			const filterData = {
				planet: planetNames, // List of planet names in the conjunction
				sign, // Calculated sign for the conjunction
				house, // Calculated house for the conjunction
				ObjectId: ObjectId, // User's ObjectId for createdBy filtering
			}

			try {
				const response = await axios.post(
					'https://yourstars-lj6b.vercel.app/chatrooms/filter',
					filterData
				)

				// Aggregate results into `fetchedRelatedRooms`
				if (response.data) {
					fetchedRelatedRooms.push(...response.data)
				}
			} catch (err) {
				console.error('Error fetching related chatrooms:', err)
			}
		}

		// Update the related rooms state after all requests complete
		setRelatedRooms(fetchedRelatedRooms)
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

			setJoinedChatrooms(response.data)
		} catch (error) {
			console.error('Error fetching joined chatrooms:', error)
		}
	}
	const fetchYourRooms = async () => {
		try {
			const response = await axios.post(
				`https://yourstars-lj6b.vercel.app/chatrooms/filter`,
				{
					ObjectId,
				}
			)
			console.log(response.data)
			setYourRooms(response.data)
		} catch (error) {
			console.error('Error fetching joined chatrooms:', error)
		}
	}
	useEffect(() => {
		fetchAstrologyData()
	}, [userId])

	useEffect(() => {
		if (ObjectId) {
			// Only fetch if ObjectId is valid
			fetchJoinedRooms()
			fetchYourRooms()
			fetchRelatedRooms()
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
			const excludedPlanets = ['Uranus', 'Neptune', 'Pluto'] // List of planets to exclude

			Object.entries(response.data.astrologyData[1]).forEach(
				([planet, data]) => {
					// Check if the planet is in the excluded list
					if (excludedPlanets.includes(planet)) {
						return // Skip this iteration if the planet is excluded
					}

					const { current_sign } = data
					const { fullDegree } = data
					const signKey = current_sign
					// const houseKey = `house-${current_house}`

					if (!conjunctions[signKey]) conjunctions[signKey] = []
					// if (!conjunctions[houseKey]) conjunctions[houseKey] = []

					conjunctions[signKey].push({
						planet,
						degree: fullDegree,
					})
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
		const planets = selectedConjunction
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
		console.log(selectedConjunction)
		const planets = selectedConjunction // Make sure to split string into an array
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

	// const createChatroom = async () => {
	// 	try {
	// 		// Check if planets are empty
	// 		if (!createRoom.planet || createRoom.planet.length === 0) {
	// 			alert('Please Select Planets')
	// 			return // Exit the function if planets are empty
	// 		}

	// 		const newRoomData = {
	// 			planet: createRoom.planet,
	// 			sign: createRoom.sign,
	// 			house: createRoom.house,
	// 			createdBy: ObjectId,
	// 		}

	// 		await axios.post(
	// 			'https://yourstars-lj6b.vercel.app/chatrooms',
	// 			newRoomData
	// 		)

	// 		// Reset the form data after successful creation
	// 		setCreateRoom({ planet: [], sign: '', house: '' })
	// 	} catch (err) {
	// 		// Handle errors during chatroom creation
	// 		console.error('Error creating chatroom', err)
	// 		alert(err.response ? err.response.data : 'An error occurred')
	// 	}

	// 	// Fetch updated rooms after the chatroom creation attempt
	// 	await fetchJoinedRooms()
	// 	await fetchYourRooms()
	// }

	const createChatroom = async (newRoomData) => {
		try {
			// Check if planet data is valid
			if (!newRoomData.planet || newRoomData.planet.length === 0) {
				alert('Please Select Planets')
				return
			}

			// Add more properties as needed if newRoomData is correct
			const data = {
				planet: newRoomData.planet,
				sign: newRoomData.sign,
				house: newRoomData.house,
				createdBy: ObjectId, // Assume this is set correctly elsewhere
			}

			await axios.post(
				'https://yourstars-lj6b.vercel.app/chatrooms',
				data
			)

			// Reset the form data after successful creation
			setCreateRoom({ planet: [], sign: '', house: '' })
		} catch (err) {
			console.error('Error creating chatroom', err)
			alert(err.response ? err.response.data : 'An error occurred')
		}

		// Fetch updated rooms after the chatroom creation attempt
		await fetchJoinedRooms()
		await fetchYourRooms()
	}

	const filterChatrooms = async (filterRoom) => {
		const { planet, sign, house, filterBy } = filterRoom

		setChatrooms([])
		if (!planet || !filterBy) {
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
			// alert('Joined chatroom successfully!')
		} catch (err) {
			console.error('Error joining chatroom', err)
			alert(err.response.data)
		}
		await fetchJoinedRooms()
		await fetchYourRooms()
		await fetchRelatedRooms()
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
			// alert('You have left the chatroom')
		} catch (error) {
			console.error('Error leaving chatroom:', error)
			alert('Failed to leave the chatroom')
		}
		await fetchJoinedRooms()
		await fetchYourRooms()
		await fetchRelatedRooms()
	}
	const closeModal = () => {
		setIsModalOpen(false)
		setSelectedChatroom(null)
	}
	return (
		<div className="chatroom-filter-container">
			<div className="box">
				<div className="chatrooms-section left-div">
					{joinedChatrooms.length > 0 ? (
						<div className="chatrooms-section">
							<h6>Joined Chatrooms</h6>
							<div className="chatroom-grid">
								{joinedChatrooms.map((chatroom) => (
									<div
										key={chatroom._id}
										className="chatroom-item member"
										onClick={() => selectChatroom(chatroom)}
									>
										{/* Compact Chatroom Details */}
										<div className="chatroom-details">
											<div className="chatroom-info">
												<span className="chatroom-planets">
													{chatroom.planets.join(
														', '
													)}
												</span>
												<span className="chatroom-member-count">
													by {chatroom.createdBy}
												</span>
											</div>

											<div className="chatroom-sign-house">
												<span>
													Sign: {chatroom.sign}
												</span>
												<span>
													House: {chatroom.house}
												</span>
											</div>

											{/* User Statistics Section */}
											<div className="chatroom-stats">
												<div className="chatroom-member-count">
													{chatroom.members.length}{' '}
													Members
												</div>
												<div className="chatroom-discussion-count">
													{chatroom.discussionCount}{' '}
													Discussions
												</div>
												<div className="chatroom-message-count">
													{chatroom.messageCount}{' '}
													Messages
												</div>
											</div>
											<span>
												<button
													className="leave-button"
													onClick={(e) => {
														e.stopPropagation() // Prevent click on parent
														leaveChatroom(
															chatroom._id
														)
													}}
												>
													Leave
												</button>
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					) : (
						<p className="empty-message">
							No joined chatrooms found.
						</p>
					)}
					<div className="chatrooms-section">
						<h6>Chatrooms based on your placements</h6>

						{relatedRooms.length > 0 ? (
							<div className="chatroom-grid">
								{relatedRooms.map((chatroom) => {
									const isMember =
										chatroom.members.includes(ObjectId)

									return (
										<div
											key={chatroom._id}
											className={`chatroom-item ${
												isMember
													? 'clickable'
													: 'non-clickable'
											} ${
												isMember
													? 'member'
													: 'non-member'
											}`}
											onClick={
												isMember
													? () =>
															selectChatroom(
																chatroom
															)
													: null
											}
										>
											<div className="chatroom-details">
												<div className="chatroom-info">
													<span className="chatroom-planets">
														{chatroom.planets.join(
															', '
														)}
													</span>
													<span className="chatroom-member-count">
														by{' '}
														{chatroom.createdByName}
													</span>
													{/* User Statistics Section */}
													<div className="chatroom-stats">
														<div className="chatroom-member-count">
															{
																chatroom.members
																	.length
															}{' '}
															Members
														</div>
														<div className="chatroom-discussion-count">
															{
																chatroom.discussionCount
															}{' '}
															Discussions
														</div>
														<div className="chatroom-message-count">
															{
																chatroom.messageCount
															}{' '}
															Messages
														</div>
													</div>
												</div>
												{isMember ? (
													<button
														className="leave-button"
														onClick={(e) => {
															e.stopPropagation() // Prevent parent click
															leaveChatroom(
																chatroom._id
															)
														}}
													>
														Leave
													</button>
												) : (
													<button
														className="join-button"
														onClick={() =>
															joinChatroom(
																chatroom._id
															)
														}
													>
														Join
													</button>
												)}
											</div>
										</div>
									)
								})}
							</div>
						) : (
							<p className="empty-message">
								No related chatrooms found.
							</p>
						)}
					</div>
				</div>

				{/* joined Chatrooms */}
				<div className="middle-divs">
					{/* Related Rooms Section */}
					<PlanetaryCircle
						conjunctions={conjunctions}
						createChatroom={createChatroom}
						filterChatrooms={filterChatrooms}
					/>
					<ChatroomList
						chatrooms={chatrooms}
						joinChatroom={joinChatroom}
						leaveChatroom={leaveChatroom}
						selectChatroom={selectChatroom}
						ObjectId={ObjectId}
					/>
				</div>

				{/* <div className="create-filter-section right-div">
					<div className="create-chatroom">
						<label>
							<select
								value={createRoom.planet.join(', ')}
								onChange={(e) =>
									handleCreatePlanetChange(
										e.target.value.split(', ')
									)
								}
							>
								<option value="">Search room</option>

								{Object.entries(conjunctions).map(
									([signKey, planetsData]) => (
										<option
											key={signKey}
											value={planetsData
												.map((p) => p.planet)
												.join(', ')}
										>
											{planetsData
												.map((p) => p.planet)
												.join(', ')}
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
							<select
								value={filterRoom.planet.join(', ')}
								onChange={(e) =>
									handleFilterPlanetChange(
										e.target.value.split(', ')
									)
								}
							>
								<option value="">Search room</option>

								{Object.entries(conjunctions).map(
									([signKey, planetsData]) => (
										<option
											key={signKey}
											value={planetsData
												.map((p) => p.planet)
												.join(', ')}
										>
											{planetsData
												.map((p) => p.planet)
												.join(', ')}
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
									<div className="inline-label">
										Sign {filterRoom.sign}
									</div>
								)}

								{filterRoom.filterBy !== 'sign' && (
									<div className="inline-label">
										House {filterRoom.house}
									</div>
								)}
							</div>
						</label>

						<button
							className="primary-button"
							onClick={() => filterChatrooms(filterRoom)}
						>
							Filter Chatrooms
						</button>
					</div>
				</div> */}

				<div className="right-div">
					<h6>Your Chatrooms</h6>
					{YourRooms.length > 0 ? (
						<div className="chatroom-grid joined-chatrooms">
							{YourRooms.map((chatroom) => {
								// Check if the user is a member of the chatroom
								const isMember =
									chatroom.members.includes(ObjectId)

								return (
									<div
										key={chatroom._id}
										className={`chatroom-item ${
											isMember
												? 'clickable'
												: 'non-clickable'
										} ${
											isMember ? 'member' : 'non-member'
										}`}
										onClick={
											isMember
												? () => selectChatroom(chatroom)
												: null
										}
									>
										<div className="chatroom-details">
											<div className="chatroom-info">
												<span className="chatroom-planets">
													{chatroom.planets.join(
														', '
													)}
												</span>
											</div>

											<div className="chatroom-sign-house">
												<span>
													Sign:{chatroom.sign}
												</span>
												<span>
													House:{chatroom.house}
												</span>
											</div>

											{/* User Statistics Section */}
											<div className="chatroom-stats">
												<div className="chatroom-member-count">
													{chatroom.members.length}{' '}
													Members
												</div>
												<div className="chatroom-discussion-count">
													{chatroom.discussionCount}{' '}
													Discussions
												</div>
												<div className="chatroom-message-count">
													{chatroom.messageCount}{' '}
													Messages
												</div>
											</div>

											{isMember ? (
												<button
													className="leave-button"
													onClick={(e) => {
														e.stopPropagation() // Prevent parent click
														leaveChatroom(
															chatroom._id
														)
													}}
												>
													Leave
												</button>
											) : (
												<button
													className="join-button"
													onClick={() =>
														joinChatroom(
															chatroom._id
														)
													}
												>
													Join
												</button>
											)}
										</div>
									</div>
								)
							})}
						</div>
					) : (
						<p className="empty-message">Make your first room!</p>
					)}
				</div>
				<Modal
					isOpen={isModalOpen}
					onRequestClose={closeModal}
					style={modalStyles}
					contentLabel="Chatroom"
				>
					{selectedChatroom && (
						<Chatroom
							chatroom={selectedChatroom}
							userId={userId}
							chats={chats}
							closeModal={closeModal}
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
