import React, { useState, useEffect } from 'react'
import axios from 'axios'

function Comment({ comment, handleReply, level = 0 }) {
	const [showReplyBox, setShowReplyBox] = useState(false)
	const [replyContent, setReplyContent] = useState('')

	const submitReply = async () => {
		await handleReply(comment._id, replyContent)
		setReplyContent('')
		setShowReplyBox(false)
	}

	const levelIndentation = level * 20

	return (
		<div
			className="mt-4 p-4 rounded-md border border-gray-300 bg-gray-50"
			style={{ marginLeft: `${levelIndentation}px` }}
		>
			<p>
				<strong>{comment.user?.name || 'Unknown User'}:</strong>{' '}
				{comment.content}
			</p>

			<button
				onClick={() => setShowReplyBox(!showReplyBox)}
				className="text-sm text-blue-500"
			>
				Reply
			</button>
			{showReplyBox && (
				<div>
					<textarea
						value={replyContent}
						onChange={(e) => setReplyContent(e.target.value)}
						className="border w-full p-2 mt-2"
					/>
					<button
						onClick={submitReply}
						className="bg-blue-500 text-white py-1 px-3 mt-2 rounded hover:bg-blue-600"
					>
						Submit
					</button>
				</div>
			)}

			{comment.replies?.length > 0 && (
				<div className="mt-4">
					{comment.replies.map((reply) => (
						<Comment
							key={reply._id}
							comment={reply}
							handleReply={handleReply}
							level={level + 1}
						/>
					))}
				</div>
			)}
		</div>
	)
}

function Comments({ postId }) {
	const [comments, setComments] = useState([])
	const [newComment, setNewComment] = useState('')

	useEffect(() => {
		const fetchComments = async () => {
			const response = await axios.get(
				`http://localhost:3333/posts/${postId}/comments`
			)
			setComments(response.data)
		}
		fetchComments()
	}, [postId])

	const handleReply = async (parentCommentId, replyContent) => {
		try {
			const response = await axios.post(
				`http://localhost:3333/posts/${postId}/comments`,
				{
					content: replyContent,
					userId: 1, // Replace with the current user's ID
					parentCommentId: parentCommentId,
				}
			)

			const newReply = response.data

			setComments((prevComments) => {
				const updateReplies = (comments) => {
					return comments.map((comment) => {
						if (comment._id === parentCommentId) {
							return {
								...comment,
								replies: [...comment.replies, newReply],
							}
						}
						// Recursively update nested replies
						return {
							...comment,
							replies: updateReplies(comment.replies),
						}
					})
				}

				return updateReplies(prevComments)
			})
		} catch (err) {
			console.error('Error replying to comment:', err)
		}
	}

	const submitNewComment = async () => {
		try {
			const response = await axios.post(
				`http://localhost:3333/posts/${postId}/comments`,
				{
					content: newComment,
					userId: 1, // Replace with current user's ID
					karmaType: 'sun', // Example karma type
				}
			)

			// Add the populated comment to the existing comments
			setComments([...comments, response.data])
			setNewComment('')
		} catch (err) {
			console.error('Error posting comment:', err)
		}
	}

	return (
		<div className="mt-4">
			<h4 className="font-bold">Comments:</h4>
			{comments.map((comment) => (
				<Comment
					key={comment._id}
					comment={comment}
					handleReply={handleReply}
				/>
			))}

			{/* New comment box */}
			<textarea
				value={newComment}
				onChange={(e) => setNewComment(e.target.value)}
				className="border w-full p-2 mt-4"
				placeholder="Add a comment"
			/>
			<button
				onClick={submitNewComment}
				className="bg-blue-500 text-white py-1 px-3 mt-2 rounded hover:bg-blue-600"
			>
				Submit
			</button>
		</div>
	)
}

export default Comments
