import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Discussion from './Discussion'

const Chatroom = ({ chatroom, userId }) => {
	const [discussions, setDiscussions] = useState([])
	const [selectedDiscussion, setSelectedDiscussion] = useState(null)
	const [newDiscussionName, setNewDiscussionName] = useState('')
	const [newDiscussionType, setNewDiscussionType] = useState('')

	useEffect(() => {
		const fetchDiscussions = async () => {
			const response = await axios.get(
				`http://localhost:3000/chatrooms/${chatroom._id}/discussions`
			)
			console.log(userId)
			setDiscussions(response.data)
		}

		fetchDiscussions()
	}, [chatroom])

	const createDiscussion = async () => {
		const response = await axios.post(
			`http://localhost:3000/chatrooms/${chatroom._id}/discussions`,
			{
				name: newDiscussionName,
				type: newDiscussionType,
				createdBy: userId,
			}
		)
		setDiscussions([...discussions, response.data])
		setNewDiscussionName('')
		setNewDiscussionType('')
	}

	return (
		<div>
			<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
				<input
					placeholder="Discussion Name"
					value={newDiscussionName}
					onChange={(e) => setNewDiscussionName(e.target.value)}
					style={{ width: '150px' }}
				/>
				<select
					value={newDiscussionType}
					onChange={(e) => setNewDiscussionType(e.target.value)}
					style={{ width: '100px' }}
				>
					<option value="General">General</option>
					<option value="Question">Question</option>
					<option value="Debate">Debate</option>
				</select>
				<button onClick={createDiscussion}>Create Discussion</button>

				<ul>
					{discussions.map((discussion) => (
						<li
							key={discussion._id}
							onClick={() => setSelectedDiscussion(discussion)}
						>
							{discussion.name} - {discussion.type}
						</li>
					))}
				</ul>
			</div>
			<div>
				{selectedDiscussion && (
					<Discussion
						discussion={selectedDiscussion}
						userId={userId}
						chatroomId={chatroom._id}
						creator={chatroom.createdBy.name}
					/>
				)}
			</div>
		</div>
	)
}

export default Chatroom
