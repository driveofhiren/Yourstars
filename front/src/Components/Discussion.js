import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './Default.css'
import './Layout.css'

const Discussion = ({ discussion, userId, chatroomId, creator }) => {
	const [messages, setMessages] = useState([])
	const [newMessage, setNewMessage] = useState('')
	const [replyMessage, setReplyMessage] = useState('')
	const [replyingTo, setReplyingTo] = useState(null)
	const [chatroom, setChatroom] = useState([])
	const [currentUserMongoId, setCurrentUserMongoId] = useState(null)
	const newMessageInputRef = useRef(null)

	// New state to manage scroll behavior
	const [shouldScroll, setShouldScroll] = useState(false)
	const messagesEndRef = useRef(null)

	// Fetch initial data
	useEffect(() => {
		fetchMessages()
		fetchUserMongoId()
		fetchChatroom()
	}, [discussion._id, userId])

	// Scroll to bottom whenever new messages are added
	useEffect(() => {
		if (shouldScroll) {
			scrollToBottom()
			setShouldScroll(false) // Reset scroll flag after scrolling
		}
	}, [messages])

	// Fetch messages from the server
	const fetchMessages = async () => {
		const response = await axios.get(
			`https://yourstars-lj6b.vercel.app/discussions/${discussion._id}/messages`
		)
		setMessages(response.data)
	}

	// Fetch chatroom details
	const fetchChatroom = async () => {
		const response = await axios.get(
			`https://yourstars-lj6b.vercel.app/chatrooms/${chatroomId}`
		)
		setChatroom(response.data)
	}

	// Fetch current user MongoDB ID
	const fetchUserMongoId = async () => {
		const response = await axios.get(
			`https://yourstars-lj6b.vercel.app/users/${userId}`
		)
		setCurrentUserMongoId(response.data._id)
	}

	// Send a new message
	const sendMessage = async () => {
		const response = await axios.post(
			`https://yourstars-lj6b.vercel.app/discussions/${discussion._id}/messages`,
			{ userId, content: newMessage }
		)
		setMessages((prevMessages) => [...prevMessages, response.data])
		setNewMessage('')
		setShouldScroll(true) // Set scroll to true when sending a message
		await fetchMessages()

		// Focus back on the input box
		if (newMessageInputRef.current) {
			newMessageInputRef.current.focus()
		}
	}

	// Like or dislike a message
	const likeMessage = async (messageId, like) => {
		try {
			const response = await axios.post(
				`https://yourstars-lj6b.vercel.app/messages/${messageId}/like`,
				{ userId, like }
			)
			setMessages((prevMessages) =>
				prevMessages.map((msg) =>
					msg._id === messageId ? response.data : msg
				)
			)
			await fetchMessages()
		} catch (error) {
			console.error('Error liking/disliking message:', error)
		}
	}

	// Reply to a specific message
	const replyToMessage = async () => {
		const response = await axios.post(
			`https://yourstars-lj6b.vercel.app/messages/${replyingTo}/reply`,
			{ userId, content: replyMessage }
		)
		setMessages((prevMessages) => [...prevMessages, response.data])
		setReplyMessage('')
		setReplyingTo(null)
		await fetchMessages()
	}

	// Scroll to the bottom of the messages container
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	// Render the messages and handle replies
	const renderMessages = (msgs, parentMessage = null) => {
		return msgs
			.filter((msg) => msg.parentMessage === parentMessage)
			.map((msg) => {
				const userReaction = msg.likedBy.find(
					(entry) => entry.userId.toString() === currentUserMongoId
				)

				const isLiked = userReaction?.liked === true
				const isDisliked = userReaction?.liked === false

				return (
					<div
						key={msg._id}
						className="message-container scroll-smooth"
					>
						<div className="message">
							<p className="message-author">{msg.user.name}</p>
							<p className="message-content">{msg.content}</p>

							<div className="message-actions">
								Likes: {msg.likes}
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
								<button
									className="reply-button"
									onClick={() => setReplyingTo(msg._id)}
								>
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
								<button
									className="reply-button"
									onClick={replyToMessage}
									disabled={!replyMessage.trim()} // Disable button when replyMessage is empty
								>
									Reply
								</button>
								<button onClick={() => setReplyingTo(null)}>
									Cancel
								</button>
							</div>
						)}

						<div className="replies scroll-smooth">
							{renderMessages(msgs, msg._id)}
						</div>
					</div>
				)
			})
	}

	return (
		<div className="discussion">
			<h4 className="discussion-title">
				<span className="planets">
					{Array.isArray(chatroom.planets) &&
					chatroom.planets.length > 0
						? chatroom.planets.join(' ')
						: ''}
				</span>

				<span className="house-sign">House : {chatroom.house}</span>

				<span className="house-sign">Sign : {chatroom.sign}</span>

				<span className="creator">Created By : {creator}</span>

				<span className="discussion-info">
					{discussion.name} -{' '}
					<span className="discussion-type">{discussion.type}</span>
				</span>
			</h4>

			<div className="messages-container">
				{renderMessages(messages)}
				<p></p>
				<div ref={messagesEndRef} />
			</div>
			<div className="new-message-container">
				<input
					ref={newMessageInputRef}
					type="text"
					value={newMessage}
					// Disable Send button when input is empty
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder="New Message"
					className="new-message-input"
				/>
				<button
					className="send-button"
					Click={sendMessage}
					disabled={!newMessage.trim()}
				>
					Send
				</button>
			</div>
		</div>
	)
}

export default Discussion
