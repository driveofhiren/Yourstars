import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Discussion from './Discussion'
import './Layout.css'

const Chatroom = ({ chatroom, userId, closeModal }) => {
	console.log(chatroom)
	const [discussions, setDiscussions] = useState([])
	const [selectedDiscussion, setSelectedDiscussion] = useState(null)
	const [newDiscussionName, setNewDiscussionName] = useState('')
	const [newDiscussionType, setNewDiscussionType] = useState('General')

	useEffect(() => {
		const fetchDiscussions = async () => {
			const response = await axios.get(
				`https://yourstars-lj6b.vercel.app/chatrooms/${chatroom._id}/discussions`
			)

			setDiscussions(response.data)
		}

		fetchDiscussions()
	}, [chatroom])

	const createDiscussion = async () => {
		if (!newDiscussionName.trim()) return // Ensure name is not empty or whitespace
		const response = await axios.post(
			`https://yourstars-lj6b.vercel.app/chatrooms/${chatroom._id}/discussions`,
			{
				name: newDiscussionName,
				type: newDiscussionType,
				createdBy: userId,
			}
		)
		setDiscussions([...discussions, response.data])
		setNewDiscussionName('')
		setNewDiscussionType('General')
	}

	return (
		<div>
			<div className="create-discussion">
				<input
					placeholder="Discussion Name"
					value={newDiscussionName}
					onChange={(e) => setNewDiscussionName(e.target.value)}
				/>

				<select
					value={newDiscussionType}
					onChange={(e) => setNewDiscussionType(e.target.value)}
				>
					<option value="General">General</option>
					<option value="Question">Question</option>
					<option value="Debate">Debate</option>
				</select>

				<select
					onChange={(e) =>
						setSelectedDiscussion(
							discussions.find((d) => d._id === e.target.value)
						)
					}
				>
					<option value="">Select a discussion</option>
					{discussions.map((discussion) => (
						<option key={discussion._id} value={discussion._id}>
							{discussion.name} - {discussion.type}
						</option>
					))}
				</select>
				<div>
					<button
						onClick={createDiscussion}
						disabled={!newDiscussionName.trim()}
					>
						Create Discussion
					</button>
					<button onClick={closeModal} className="close-button">
						Close
					</button>
				</div>
			</div>

			<div>
				{selectedDiscussion && (
					<Discussion
						discussion={selectedDiscussion}
						userId={userId}
						chatroomId={chatroom._id}
						creator={chatroom.createdByName}
					/>
				)}
			</div>
		</div>
	)
}

export default Chatroom
