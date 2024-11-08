import React from 'react'

const ChatroomList = ({
	chatrooms,
	joinChatroom,
	leaveChatroom,
	selectChatroom,
	ObjectId,
}) => {
	return (
		<div className="top-div">
			{chatrooms.length > 0 ? (
				<div className="chatroom-grid">
					{chatrooms.map((chatroom) => {
						// Check if the user is a member of the chatroom
						const isMember = chatroom.members.includes(ObjectId)

						return (
							<div
								key={chatroom._id}
								className={`chatroom-item ${
									isMember ? 'clickable' : 'non-clickable'
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
											{chatroom.planets.join(', ')}
										</span>
										<span className="chatroom-creator">
											by {chatroom.createdBy.name}
										</span>
									</div>

									<span className="chatroom-sign-house">
										Sign: {chatroom.sign}, House:{' '}
										{chatroom.house}
									</span>
									<span className="chatroom-member-count">
										{chatroom.members.length} Members
									</span>

									{isMember ? (
										<button
											className="leave-button"
											onClick={(e) => {
												e.stopPropagation() // Prevent parent click
												leaveChatroom(chatroom._id)
											}}
										>
											Leave
										</button>
									) : (
										<button
											className="join-button"
											onClick={() =>
												joinChatroom(chatroom._id)
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
				<p className="empty-message">Filter for more chatrooms!</p>
			)}
		</div>
	)
}

export default ChatroomList
