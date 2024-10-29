import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Discussion = ({ discussion, userId, chatroomId }) => {
	const [messages, setMessages] = useState([])
	const [newMessage, setNewMessage] = useState('')

	useEffect(() => {
		const fetchMessages = async () => {
			console.log(discussion._id)
			const response = await axios.get(
				`http://localhost:3333/discussions/${discussion._id}/messages`
			)
			console.log(response.data)
			setMessages(response.data)
		}
		fetchMessages()
	}, [discussion])

	const sendMessage = async () => {
		await axios.post(
			`http://localhost:3333/discussions/${discussion._id}/messages`,
			{
				userId,
				content: newMessage,
				chatroomId,
			}
		)
		setMessages([
			...messages,
			{
				user: { _id: userId },
				content: newMessage,
				chatroomId,
			},
		])
		setNewMessage('')
	}

	return (
		<div>
			<h4>
				{discussion.name} - {discussion.type}
			</h4>
			<div>
				{messages.map((msg, index) => (
					<p key={index}>
						<b>
							{msg.user._id === userId ? 'You' : msg.user.name}:
						</b>{' '}
						{msg.content}
					</p>
				))}
			</div>
			<input
				type="text"
				value={newMessage}
				onChange={(e) => setNewMessage(e.target.value)}
				placeholder="New Message"
			/>
			<button onClick={sendMessage}>Send</button>
		</div>
	)
}

export default Discussion
