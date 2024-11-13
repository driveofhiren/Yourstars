import React from 'react'
import './Layout.css'

const ChatroomList = ({
	chatrooms,
	joinChatroom,
	leaveChatroom,
	selectChatroom,
	ObjectId,
}) => {
	return (
		<div className="bottom-div">
			<p>Search Results</p>
			{chatrooms.length > 0 ? (
				<div className="chatroom-grid">
					{chatrooms.map((chatroom) => {
						// Check if the user is a member of the chatroom
						const isMember = chatroom.members.includes(ObjectId)

						return (
							<div
								key={chatroom._id}
								className={`chatroom-item ${
									isMember
										? 'clickable member'
										: 'non-clickable non-member'
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
										<span className="chatroom-member-count">
											by {chatroom.createdByName}
										</span>
									</div>

									<div className="chatroom-sign-house">
										<span>Sign: {chatroom.sign}</span>
										<span>House: {chatroom.house}</span>
									</div>

									{/* User Statistics Section */}
									<div className="chatroom-stats">
										<div className="chatroom-member-count">
											{chatroom.members.length} Members
										</div>
										<div className="chatroom-discussion-count">
											{chatroom.discussionCount}{' '}
											Discussions
										</div>
										<div className="chatroom-message-count">
											{chatroom.messageCount} Messages
										</div>
									</div>
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
				<p className="empty-message">No chatrooms found.</p>
			)}
		</div>
	)
}

export default ChatroomList
