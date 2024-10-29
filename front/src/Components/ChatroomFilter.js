import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Chatroom from './ChatRoom'

const ChatroomFilter = ({ userId }) => {
	const [astrologyData, setAstrologyData] = useState([])
	const [ObjectId, setObjectId] = useState('')

	const [createRoom, setCreateRoom] = useState({
		planet: [], // Now an array to store multiple planets for conjunctions
		sign: '',
		house: '',
	})

	const [filterRoom, setFilterRoom] = useState({
		planet: [],
		sign: '',
		house: '',
		filterBy: '',
	})

	const [chatrooms, setChatrooms] = useState([])
	const [joinedChatrooms, setJoinedChatrooms] = useState([])
	const [selectedChatroom, setSelectedChatroom] = useState(null)
	const [chats, setChats] = useState([])
	const [newMessage, setNewMessage] = useState('')
	const [conjunctions, setConjunctions] = useState('')

	const fetchChats = async (chatroomId) => {
		try {
			console.log(chatroomId)
			const response = await axios.get(
				`http://localhost:3333/chatrooms/${chatroomId}/messages`
			)
			console.log('msgs' + response.data)
			setChats(response.data)
		} catch (error) {
			console.error('Error fetching chatroom messages:', error)
		}
	}

	const sendMessage = async () => {
		if (!newMessage || !selectedChatroom) return

		try {
			await axios.post(
				`http://localhost:3333/chatrooms/${selectedChatroom._id}/messages`,
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
		fetchChats(chatroom._id)
	}

	useEffect(() => {
		fetchAstrologyData()
	}, [userId])

	useEffect(() => {
		if (ObjectId) {
			// Only proceed if ObjectId is not an empty string
			const fetchJoinedRooms = async () => {
				try {
					const response = await axios.post(
						`http://localhost:3333/chatrooms/joined`,
						{ ObjectId } // Send ObjectId as an object to match server expectation
					)
					setJoinedChatrooms(response.data)
				} catch (error) {
					console.error('Error fetching joined chatrooms:', error)
				}
			}
			fetchJoinedRooms()
		}
	}, [selectedChatroom])

	const fetchAstrologyData = async () => {
		try {
			const response = await axios.get(
				`http://localhost:3333/user/${userId}`
			)
			setAstrologyData(response.data.astrologyData[1])
			setObjectId(response.data._id)

			const conjunctions = {}
			Object.entries(response.data.astrologyData[1]).forEach(
				([planet, data]) => {
					const { current_sign, current_house } = data
					const signKey = `sign-${current_sign}`
					const houseKey = `house-${current_house}`

					if (!conjunctions[signKey]) conjunctions[signKey] = []
					if (!conjunctions[houseKey]) conjunctions[houseKey] = []

					conjunctions[signKey].push(planet)
					conjunctions[houseKey].push(planet)
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
		const primaryPlanet = planets[0] // assume the first as primary for simplicity
		setCreateRoom((prev) => ({
			...prev,
			planet: selectedConjunction, // store entire conjunction string
			sign: astrologyData[primaryPlanet]?.current_sign || '',
			house: calculateHouse(
				astrologyData[primaryPlanet]?.current_sign || 0
			),
		}))
	}
	const handleFilterPlanetChange = (selectedConjunction) => {
		const planets = selectedConjunction
			.split(',')
			.map((planet) => planet.trim()) // Ensure each planet is trimmed and split into an array

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
				planet: createRoom.planet, // stores either a single planet or conjunction string
				sign: createRoom.sign,
				house: createRoom.house,
				createdBy: ObjectId,
			}

			await axios.post('http://localhost:3333/chatrooms', newRoomData)
			alert('Chatroom created successfully!')
			setCreateRoom({ planet: [], sign: '', house: '' })
		} catch (err) {
			console.error('Error creating chatroom', err)
			alert(err.response.data)
		}
	}

	const filterChatrooms = async () => {
		const { planet, sign, house, filterBy } = filterRoom

		if (!planet.length || !filterBy) {
			alert(
				'Please select at least one planet and either a sign or a house.'
			)
			return
		}

		try {
			const filterData = {
				planet, // Send array of planets for conjunctions
				ObjectId,
			}

			if (filterBy === 'sign' && sign) filterData.sign = sign
			else if (filterBy === 'house' && house) filterData.house = house

			const response = await axios.post(
				'http://localhost:3333/chatrooms/filter',
				filterData
			)

			setChatrooms(response.data)
		} catch (err) {
			console.error('Error fetching chatrooms', err)
		}
	}

	const joinChatroom = async (chatroomId) => {
		try {
			await axios.post('http://localhost:3333/chatrooms/join', {
				chatroomId,
				ObjectId,
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
	}

	return (
		<div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
			<h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
				Astrological Chatrooms
			</h2>

			{/* Create Chatroom Section */}
			<div
				style={{
					marginBottom: '30px',
					padding: '10px',
					border: '1px solid #ddd',
					borderRadius: '8px',
				}}
			>
				<h3>Create a New Chatroom</h3>
				{/* <label>
					Planet:
					<select
						value={createRoom.planet}
						onChange={(e) =>
							handleCreatePlanetChange(e.target.value)
						}
						style={{ marginLeft: '10px' }}
					>
						<option value="">Select Planet</option>
						{astrologyData &&
							Object.keys(astrologyData).map((planet) => (
								<option key={planet} value={planet}>
									{planet}
								</option>
							))}
					</select>
				</label> */}

				<label>
					<select
						value={createRoom.planet}
						onChange={(e) =>
							handleCreatePlanetChange(e.target.value)
						}
						style={{ marginLeft: '10px' }}
					>
						<option value="">Select Conjunction</option>
						{Object.entries(conjunctions).map(([key, planets]) => (
							<option key={key} value={planets.join(', ')}>
								{planets.join(', ')}
							</option>
						))}
					</select>
				</label>

				<div style={{ marginTop: '10px' }}>
					<label>Sign: </label>
					<input
						type="text"
						value={createRoom.sign}
						readOnly
						style={{ marginLeft: '10px' }}
					/>
				</div>

				<div style={{ marginTop: '10px' }}>
					<label>House: </label>
					<input
						type="text"
						value={createRoom.house}
						readOnly
						style={{ marginLeft: '10px' }}
					/>
				</div>

				<button
					onClick={createChatroom}
					style={{
						marginTop: '15px',
						padding: '10px 20px',
						backgroundColor: '#4CAF50',
						color: 'white',
						border: 'none',
						borderRadius: '5px',
						cursor: 'pointer',
					}}
				>
					Create Chatroom
				</button>
			</div>

			{/* Filter Chatrooms Section */}
			<div
				style={{
					marginBottom: '30px',
					padding: '10px',
					border: '1px solid #ddd',
					borderRadius: '8px',
				}}
			>
				<h3>Filter Chatrooms</h3>
				{/* <label>
					Planet:
					<select
						value={filterRoom.planet.join(', ')}
						onChange={(e) =>
							handleFilterPlanetChange(e.target.value)
						}
						style={{ marginLeft: '10px' }}
					>
						<option value="">Select Planet</option>
						{Object.keys(astrologyData).map((planet) => (
							<option key={planet} value={planet}>
								{planet}
							</option>
						))}
					</select>
				</label> */}

				<div style={{ marginTop: '10px' }}>
					<label>Planet Conjunction:</label>
					<select
						value={filterRoom.planet.join(', ')}
						onChange={(e) =>
							handleFilterPlanetChange(e.target.value)
						}
						style={{ marginLeft: '10px' }}
					>
						<option value="">Select Conjunction</option>
						{Object.entries(conjunctions).map(([key, planets]) => (
							<option key={key} value={planets.join(', ')}>
								{planets.join(', ')}
							</option>
						))}
					</select>
				</div>

				<div style={{ marginTop: '10px' }}>
					<label>Filter by:</label>
					<select
						value={filterRoom.filterBy}
						onChange={(e) =>
							setFilterRoom((prev) => ({
								...prev,
								filterBy: e.target.value,
							}))
						}
						style={{ marginLeft: '10px' }}
					>
						<option value="">Select Filter</option>
						<option value="sign">Sign</option>
						<option value="house">House</option>
					</select>
				</div>

				{filterRoom.filterBy === 'sign' && (
					<div style={{ marginTop: '10px' }}>
						<label>Sign:</label>
						<input
							type="text"
							value={filterRoom.sign}
							readOnly
							placeholder="Sign auto-filled based on planet"
							style={{ marginLeft: '10px' }}
						/>
					</div>
				)}

				{filterRoom.filterBy === 'house' && (
					<div style={{ marginTop: '10px' }}>
						<label>House:</label>
						<input
							type="text"
							value={filterRoom.house}
							readOnly
							placeholder="House auto-filled based on planet"
							style={{ marginLeft: '10px' }}
						/>
					</div>
				)}

				<button
					onClick={filterChatrooms}
					style={{
						marginTop: '15px',
						padding: '10px 20px',
						backgroundColor: '#2196F3',
						color: 'white',
						border: 'none',
						borderRadius: '5px',
						cursor: 'pointer',
					}}
				>
					Find Chatrooms
				</button>
			</div>

			{/* Available Chatrooms */}
			<div>
				<h3>Available Chatrooms</h3>
				<ul>
					{chatrooms.map((room) => (
						<li key={room._id}>
							{Array.isArray(room.planets)
								? room.planets.join(', ')
								: room.planets || 'No planets specified'}

							{room.sign
								? `in ${room.sign}`
								: `in House ${room.house}`}
							<button
								onClick={() => joinChatroom(room._id)}
								style={{
									marginLeft: '10px',
									padding: '5px 10px',
									backgroundColor: '#f44336',
									color: 'white',
									border: 'none',
									borderRadius: '5px',
									cursor: 'pointer',
								}}
							>
								Join
							</button>
						</li>
					))}
				</ul>
			</div>

			{/* Render Joined Chatrooms */}
			<div>
				<h3>Your Joined Chatrooms:</h3>
				<ul>
					{joinedChatrooms.map((chatroom) => (
						<li key={chatroom._id}>
							<span
								onClick={() => selectChatroom(chatroom)}
								style={{
									cursor: 'pointer',
									textDecoration: 'underline',
								}}
							>
								{`Planet: ${chatroom.planets}, Sign: ${
									chatroom.sign || 'N/A'
								}, House: ${chatroom.house || 'N/A'}`}
							</span>
						</li>
					))}
				</ul>
			</div>

			{selectedChatroom && (
				<div>
					<h3>Chatroom: {selectedChatroom.planets}</h3>
					<div
						style={{
							maxHeight: '200px',
							overflowY: 'auto',
							padding: '10px',
							border: '1px solid #ddd',
							borderRadius: '8px',
							marginBottom: '20px',
						}}
					>
						{chats.map((chat, index) => (
							<div key={index}>
								<span>{chat.content}</span>
							</div>
						))}
					</div>

					<input
						type="text"
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder="Type a message"
						style={{
							padding: '10px',
							width: '80%',
							marginRight: '10px',
						}}
					/>
					<button
						onClick={sendMessage}
						style={{
							padding: '10px 20px',
							backgroundColor: '#4CAF50',
							color: 'white',
							border: 'none',
							borderRadius: '5px',
							cursor: 'pointer',
						}}
					>
						Send
					</button>
					<div>
						{selectedChatroom && (
							<Chatroom
								chatroom={selectedChatroom}
								userId={ObjectId}
							/>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default ChatroomFilter
