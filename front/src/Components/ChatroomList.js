import React from 'react'

const ChatroomList = ({ chatrooms, joinChatroom, leaveChatroom, ObjectId }) => {
	return (
		<div className=" top-div">
			<p>Search Results</p>
			{chatrooms.length > 0 ? (
				<ul className="chatroom-grid">
					{chatrooms.map((chatroom) => {
						// Check if the user is a member of the chatroom
						const isMember = chatroom.members.includes(ObjectId)

						return (
							<li key={chatroom._id}>
								{chatroom.planets.join(', ')} : Sign{' '}
								{chatroom.sign} {'  '}
								House {chatroom.house} by {'  '}
								{chatroom.createdBy.name}
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
							</li>
						)
					})}
				</ul>
			) : (
				<p>Filter more chatrooms!</p>
			)}
		</div>
	)
}

export default ChatroomList
