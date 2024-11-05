import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Default.css'

const Discussion = ({ discussion, userId, chatroomId, creator }) => {
	const [messages, setMessages] = useState([])
	const [newMessage, setNewMessage] = useState('')
	const [replyMessage, setReplyMessage] = useState('')
	const [replyingTo, setReplyingTo] = useState(null)

	const [chatroom, setChatroom] = useState([])
	const [currentUserMongoId, setCurrentUserMongoId] = useState(null)

	useEffect(() => {
		fetchMessages()

		fetchUserMongoId()
		fetchChatroom()
		console.log(creator)
	}, [discussion._id, userId])

	const fetchMessages = async () => {
		const response = await axios.get(
			`http://localhost:3333/discussions/${discussion._id}/messages`
		)
		setMessages(response.data)
	}

	const fetchChatroom = async () => {
		const response = await axios.get(
			`http://localhost:3333/chatrooms/${chatroomId}`
		)
		setChatroom(response.data)
	}
	const fetchUserMongoId = async () => {
		// Replace this with the actual endpoint that returns user data based on your frontend userId
		const response = await axios.get(
			`http://localhost:3333/users/${userId}`
		)

		setCurrentUserMongoId(response.data._id) // Set MongoDB ObjectId to state
	}

	const sendMessage = async () => {
		const response = await axios.post(
			`http://localhost:3333/discussions/${discussion._id}/messages`,
			{ userId, content: newMessage }
		)
		setMessages((prevMessages) => [...prevMessages, response.data])
		setNewMessage('')
	}

	const likeMessage = async (messageId, like) => {
		try {
			const response = await axios.post(
				`http://localhost:3333/messages/${messageId}/like`,
				{ userId, like }
			)
			setMessages((prevMessages) =>
				prevMessages.map((msg) =>
					msg._id === messageId ? response.data : msg
				)
			)
		} catch (error) {
			console.error('Error liking/disliking message:', error)
		}
	}

	const replyToMessage = async () => {
		const response = await axios.post(
			`http://localhost:3333/messages/${replyingTo}/reply`,
			{
				userId,
				content: replyMessage,
			}
		)
		setMessages((prevMessages) => [...prevMessages, response.data])
		setReplyMessage('')
		setReplyingTo(null)
	}

	const renderMessages = (msgs, parentMessage = null) => {
		return msgs
			.filter((msg) => msg.parentMessage === parentMessage)
			.map((msg) => {
				// Determine user's current reaction status for styling
				const userReaction = msg.likedBy.find(
					(entry) => entry.userId.toString() === currentUserMongoId
				)

				// console.log(userReaction)

				const isLiked = userReaction?.liked === true
				const isDisliked = userReaction?.liked === false

				return (
					<div key={msg._id} className="message-container">
						<div className="message">
							<p className="message-author">{msg.user.name}</p>
							<p className="message-content">{msg.content}</p>
							<p className="message-likes">Likes: {msg.likes}</p>
							<div className="message-actions">
								<button
									className={`like-button ${
										isLiked ? 'active-like' : ''
									}`}
									onClick={() => likeMessage(msg._id, true)}
								>
									Like
								</button>
								<button
									className={`dislike-button ${
										isDisliked ? 'active-dislike' : ''
									}`}
									onClick={() => likeMessage(msg._id, false)}
								>
									Dislike
								</button>
								<button onClick={() => setReplyingTo(msg._id)}>
									Reply
								</button>
							</div>
						</div>
						{replyingTo === msg._id && (
							<div className="reply-input">
								<input
									type="text"
									value={replyMessage}
									onChange={(e) =>
										setReplyMessage(e.target.value)
									}
									placeholder="Reply Message"
								/>
								<button onClick={replyToMessage}>Reply</button>
								<button onClick={() => setReplyingTo(null)}>
									Cancel
								</button>
							</div>
						)}
						<div className="replies">
							{renderMessages(msgs, msg._id)}
						</div>
					</div>
				)
			})
	}

	return (
		<div className="discussion">
			<h4 className="discussion-title">
				{Array.isArray(chatroom.planets) && chatroom.planets.length > 0
					? chatroom.planets.join(' ')
					: ''}
				{` `}
				House : {chatroom.house} {` `}
				Sign : {chatroom.sign}
				{` `}
				Created By : {creator}
				<p>
					{discussion.name} - {discussion.type}
				</p>
			</h4>
			<div className="messages-container">{renderMessages(messages)}</div>
			<div className="new-message-container">
				<input
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder="New Message"
					className="new-message-input"
				/>
				<button onClick={sendMessage}>Send</button>
			</div>
		</div>
	)
}

export default Discussion
