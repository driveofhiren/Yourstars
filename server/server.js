const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const cors = require('cors')
const mongoose = require('mongoose')
const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config()

const app = express()

const PORT = process.env.PORT

// MongoDB connection to your database
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => console.log('Connected to MongoDB'))

app.use(bodyParser.json())
app.use(cors())

// ======= Existing Schemas =======

// Extended MongoDB schema for User (includes karma tracking)
const ChartSchema = new mongoose.Schema({
	id: String,
	year: Number,
	month: Number,
	date: Number,
	hours: Number,
	minutes: Number,
	seconds: Number,
	latitude: Number,
	longitude: Number,
	timezone: Number,
	settings: {
		observation_point: String,
		ayanamsha: String,
	},
	name: String,
	astrologyData: [], // Array of astrological placements
	karma: {
		Sun: { type: Number, default: 0 },
		Moon: { type: Number, default: 0 },
		Mars: { type: Number, default: 0 },
		Mercury: { type: Number, default: 0 },
		Jupiter: { type: Number, default: 0 },
		Venus: { type: Number, default: 0 },
		Saturn: { type: Number, default: 0 },
	},
	posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
})

const Chart = mongoose.model('Chart', ChartSchema)

// ======= New Schemas for Chatrooms =======

// Schema for Chatrooms
const ChatroomSchema = new mongoose.Schema({
	planets: [{ type: String, required: true }], // Store array of planets for conjunctions
	sign: { type: Number, default: null },
	house: { type: Number, default: null },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Chart' },
	createdAt: { type: Date, default: Date.now },
	members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chart' }],
})

const Chatroom = mongoose.model('Chatroom', ChatroomSchema)

// Schema for Chats/Discussion Threads
const ChatSchema = new mongoose.Schema({
	chatroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatroom' },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'Chart' },
	content: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
})

const Chat = mongoose.model('Chat', ChatSchema)

const discussionSchema = new mongoose.Schema({
	name: String,
	type: String, // e.g., "General", "Question", "Debate", etc.
	chatroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatroom' },
	members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chart' }],
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Chart' },
})

const Discussion = mongoose.model('Discussion', discussionSchema)

const messageSchema = new mongoose.Schema({
	content: { type: String, required: true },
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Chart',
		required: true,
	},
	discussionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'Chart' },
	parentMessage: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Message',
		default: null,
	}, // For handling replies to messages
	createdAt: { type: Date, default: Date.now },
	likes: { type: Number, default: 0 }, // For like count
	likedBy: [
		{
			userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chart' },
			liked: { type: Boolean }, // true for like, false for dislike
		},
	],
	replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], // For nested replies
})

const Message = mongoose.model('Message', messageSchema)

// ======= Google Generative AI Setup =======
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

// Analyze content for astrological influences

app.post('/analyze', async (req, res) => {
	const { content } = req.body

	try {
		async function generate() {
			try {
				// Create a prompt for the Google Gemini API
				const prompt = `Analyze the following content in terms of planetary astrological influences and association. 
                    Based on the content, provide a JSON response with the following format:
                    {
                        "Sun": <percentage>,
                        "Moon": <percentage>,
                        "Mars": <percentage>,
                        "Mercury": <percentage>,
                        "Venus": <percentage>,
                        "Jupiter": <percentage>,
                        "Saturn": <percentage>
                    }
                    Ensure that all percentages sum to 100. 
					can keep value 0 if not related to particular planets
					
                    Content: "${content}"`

				const result = await model.generateContent(prompt)
				console.log(result.response.text())
				const jsonMatch = result.response.text().match(/{[^}]+}/s)

				if (jsonMatch) {
					const jsonString = jsonMatch[0] // Extract the JSON string
					const analysisResponse = JSON.parse(jsonString) // Parse the JSON string into an object

					console.log(analysisResponse)
					res.json(analysisResponse) // Output the JSON object
				} else {
					console.log('No JSON found in the response.')
				}
				// Assuming the response from the model is in the expected JSON format
				// const analysisResponse = JSON.parse(result.response.text())

				// Validate the response (optional)

				// Send the analysis response as JSON
			} catch (error) {
				console.error('Error generating content:', error)
				res.status(500).json({
					error: 'Error generating astrological analysis',
				})
			}
		}

		// Call the async function
		generate()
	} catch (error) {
		console.error('Error calling Google Gemini API:', error)
		res.status(500).json({ error: 'Failed to analyze content' })
	}
})

// Fetch astrology data and save/update user
// Existing API: Fetch astrology data and save/update user
app.post('/fetchAstrologyData', async (req, res) => {
	const requestData = req.body

	const options = {
		method: 'POST',
		url: 'https://json.freeastrologyapi.com/planets',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': process.env.ASTROLOGY_API_KEY,
		},
		body: JSON.stringify(requestData),
	}

	request(options, async (error, response, body) => {
		if (error) {
			console.error(error)
			res.status(500).send('Error fetching data from astrology API')
			return
		}

		const astrologyData = JSON.parse(body)

		try {
			let user = await Chart.findOne({ id: requestData.id })

			if (!user) {
				user = new Chart(requestData)
			} else {
				Object.assign(user, requestData)
			}

			user.astrologyData = astrologyData.output
			await user.save()

			res.status(200).send('Astrology data updated successfully')
		} catch (err) {
			if (err.code === 11000) {
				console.error('Duplicate key error:', err)
				res.status(400).send(
					'Duplicate key error: username might be null or already exists.'
				)
			} else {
				console.error('Error saving user data:', err)
				res.status(500).send('Error saving user data')
			}
		}
	})
})

// Fetch all users
app.get('/users', async (req, res) => {
	try {
		const users = await Chart.find({})
		res.status(200).json(users)
	} catch (err) {
		console.error('Error fetching users:', err)
		res.status(500).send('Error fetching users')
	}
})

app.get('/user/:id', async (req, res) => {
	const userId = req.params.id

	try {
		const user = await Chart.findOne({ id: userId })

		if (!user) {
			res.status(404).send('User not found')
			return
		}
		res.status(200).json(user)
	} catch (err) {
		console.error('Error fetching user:', err)
		res.status(500).send('Error fetching user')
	}
})

app.get('/users/:id', async (req, res) => {
	const userId = req.params.id
	console.log('egdg')
	try {
		const user = await Chart.findOne({ id: userId })

		if (!user) return res.status(404).json({ error: 'User not found' })
		res.json({ name: user.name, _id: user._id })
	} catch (error) {
		res.status(500).json({ error: 'Server error' })
	}
})

// Create a new post with karma types
app.post('/posts', async (req, res) => {
	const { content, karmaScores, userId } = req.body // Expecting karmaScores as an array
	console.log(karmaScores)
	try {
		const user = await Chart.findOne({ id: userId })
		if (!user) return res.status(404).send('User not found')

		// Create an object for karma types
		const karmaTypes = {}

		// Populate the karmaTypes object with the user's karma values
		karmaScores.forEach((karma) => {
			karmaTypes[karma.planet] =
				(user.karma[karma.planet] || 0) + karma.percentage // Assign the updated karma value
		})

		// Create post
		const post = new Post({
			content,
			karma_types: karmaTypes, // Store karma types as an object
			user: user._id,
		})
		await post.save()

		// Update user's karma for the relevant planets
		karmaScores.forEach((karma) => {
			user.karma[karma.planet] =
				(user.karma[karma.planet] || 0) + karma.percentage // Increase karma based on percentage
		})
		user.posts.push(post._id)
		await user.save()

		res.status(201).json(post)
	} catch (err) {
		console.error('Error creating post:', err)
		res.status(500).send('Error creating post')
	}
})

// Fetch all posts with user details and karma
app.get('/posts', async (req, res) => {
	try {
		const posts = await Post.find().populate('user')
		res.status(200).json(posts)
	} catch (err) {
		console.error('Error fetching posts:', err)
		res.status(500).send('Error fetching posts')
	}
})

// Like a post and update karma
app.post('/posts/:postId/like', async (req, res) => {
	const { postId } = req.params
	const { like } = req.body // expect 'like' to be true or false
	try {
		const post = await Post.findById(postId).populate('user')
		if (!post) return res.status(404).send('Post not found')

		const user = await Chart.findById(post.user._id)
		if (!user) return res.status(404).send('User not found')

		// Increment or decrement likes based on the action
		if (like) {
			post.likes += 1
			// Assuming karma_types is a Map
			for (let [karmaType, value] of post.karma_types.entries()) {
				user.karma[karmaType] = (user.karma[karmaType] || 0) + 5 // Increase karma when liked
			}
		} else {
			if (post.likes > 0) {
				post.likes -= 1
				for (let [karmaType, value] of post.karma_types.entries()) {
					user.karma[karmaType] = (user.karma[karmaType] || 0) - 5 // Decrease karma when unliked
				}
			}
		}

		await post.save()
		await user.save()

		res.status(200).json(post)
	} catch (err) {
		console.error('Error updating post likes:', err)
		res.status(500).send('Error updating post likes')
	}
})

// Add comments to posts
app.post('/posts/:postId/comments', async (req, res) => {
	const { postId } = req.params
	const { content, userId, parentComment } = req.body
	try {
		const user = await Chart.findOne({ id: userId })
		const post = await Post.findById(postId)
		if (!user) return res.status(404).send('User not found')
		if (!post) return res.status(404).send('Post not found')

		const comment = new Comment({
			content,
			user: user._id,
			post: post._id,
			parentComment,
		})
		//if comment has parentcomment than push that comment to parentcomment.reply
		if (parentComment) {
			const parentCommentDoc = await Comment.findById(parentComment)
			parentCommentDoc.replies.push(comment._id)
			await parentCommentDoc.save()
		}
		await comment.save()

		post.comments.push(comment._id)
		await post.save()

		res.status(201).json(comment)
	} catch (err) {
		console.error('Error adding comment:', err)
		res.status(500).send('Error adding comment')
	}
})

// Fetch comments for a post
app.get('/posts/:postId/comments', async (req, res) => {
	const { postId } = req.params
	try {
		// Fetch all comments for the post and populate user and replies
		const comments = await Comment.find({ post: postId })
			.populate('user', 'name') // Populate user details
			.populate('replies') // Populate replies with full comment data

		// Prepare the structure to return
		const rootComments = comments.filter(
			(comment) => !comment.parentComment
		)

		// Send the comments as response
		res.status(200).json(rootComments)
	} catch (err) {
		console.error('Error fetching comments:', err)
		res.status(500).send('Error fetching comments')
	}
})

// ======= New Chatroom Routes =======

// Create a new chatroom based on planetary placements
app.post('/chatrooms', async (req, res) => {
	let { planet, sign, house, createdBy } = req.body
	if (typeof planet === 'string') {
		planet = planet.split(',').map((p) => p.trim()) // Split by comma and trim whitespace
	}

	try {
		// Check if room with same conjunction exists
		const existingRoom = await Chatroom.findOne({
			planets: { $all: planet, $size: planet.length },
			sign,
			house,
			createdBy,
		})

		if (existingRoom) {
			return res.status(400).send('Chatroom Already Exists')
		}

		const chatroom = new Chatroom({
			planets: planet,
			sign,
			house,
			createdBy,
			members: [createdBy],
		})
		await chatroom.save()
		res.status(201).json(chatroom)
	} catch (err) {
		console.error('Error creating chatroom:', err)
		res.status(500).send('Error creating chatroom')
	}
})

// Get all chatrooms
app.get('/chatrooms', async (req, res) => {
	try {
		const chatrooms = await Chatroom.find().populate('createdBy members')
		res.status(200).json(chatrooms)
	} catch (err) {
		console.error('Error fetching chatrooms:', err)
		res.status(500).send('Error fetching chatrooms')
	}
})

app.get('/chatrooms/:chatroomId', async (req, res) => {
	try {
		const { chatroomId } = req.params
		const chatroom = await Chatroom.findById(chatroomId)
		res.json(chatroom)
	} catch (err) {
		console.error('Error fetching chatrooms:', err)
		res.status(500).send('Error fetching chatrooms')
	}
})

app.post('/chatrooms/filter', async (req, res) => {
	let { planet, sign, house, ObjectId } = req.body

	try {
		// Ensure user exists
		const user = await Chart.findById(ObjectId)
		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		// Initialize an empty query
		const query = {}

		// If planets are provided, add conjunction condition
		if (planet && planet.length > 0) {
			query.planets = { $all: planet, $size: planet.length }
		}

		// Add sign or house to the query if provided
		if (sign) query.sign = sign
		if (house) query.house = house

		// Only add `createdBy` filter if no other filters are provided
		if (!planet?.length && !sign && !house) {
			query.createdBy = ObjectId
		}

		// Fetch chatrooms based on constructed query and add discussion/message count
		const chatrooms = await Chatroom.aggregate([
			{ $match: query },
			{
				$lookup: {
					from: 'discussions', // Name of the discussions collection
					localField: '_id',
					foreignField: 'chatroomId',
					as: 'discussions',
				},
			},
			{
				$lookup: {
					from: 'messages', // Name of the messages collection
					localField: 'discussions._id',
					foreignField: 'discussionId',
					as: 'messages',
				},
			},
			{
				$addFields: {
					discussionCount: { $size: '$discussions' },
					messageCount: { $size: '$messages' },
				},
			},
			{
				$project: {
					planets: 1,
					sign: 1,
					house: 1,
					createdBy: 1,
					createdAt: 1,
					members: 1,
					discussionCount: 1,
					messageCount: 1,
				},
			},
		])

		if (!chatrooms.length) {
			return res.status(404).json({ message: 'No chatrooms found' })
		}

		res.status(200).json(chatrooms)
	} catch (err) {
		console.error('Error fetching chatrooms:', err)
		res.status(500).json({ message: 'Server error' })
	}
})

app.post('/chatrooms/filterUser', async (req, res) => {
	let { planet, sign, house, ObjectId } = req.body

	try {
		// Ensure user exists
		const user = await Chart.findById(ObjectId)
		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		// Initialize an empty query
		const query = {}

		// If planets are provided, add conjunction condition
		if (planet && planet.length > 0) {
			query.planets = { $all: planet, $size: planet.length }
		}

		// Add sign or house to the query if provided
		if (sign) query.sign = sign
		if (house) query.house = house

		// Only add createdBy filter if no other filters are provided
		if (!planet?.length && !sign && !house) {
			query.createdBy = ObjectId
		}

		// Fetch chatrooms based on constructed query
		const chatrooms = await Chatroom.find(query)
			.populate('createdBy', 'name')
			.lean() // Use lean() to get plain JavaScript objects (not Mongoose docs)

		if (!chatrooms.length) {
			return res.status(404).json({ message: 'No chatrooms found' })
		}

		// Add message and discussion counts to each chatroom
		for (const chatroom of chatrooms) {
			// Count messages in the chatroom
			chatroom.messageCount = await Chat.countDocuments({
				chatroomId: chatroom._id,
			})

			// Count discussions in the chatroom
			chatroom.discussionCount = await Discussion.countDocuments({
				chatroomId: chatroom._id,
			})
		}
		console.log(chatrooms)
		res.status(200).json(chatrooms)
	} catch (err) {
		console.error('Error fetching chatrooms:', err)
		res.status(500).json({ message: 'Server error' })
	}
})

// Join a chatroom
app.post('/chatrooms/join', async (req, res) => {
	const { chatroomId, ObjectId } = req.body

	try {
		const chatroom = await Chatroom.findById(chatroomId)
		if (!chatroom) {
			return res.status(404).send('Chatroom not found')
		}

		if (!chatroom.members.includes(ObjectId)) {
			chatroom.members.push(ObjectId)
			await chatroom.save()
		} else {
			return res.status(400).send('Member already in chatroom')
		}
		res.status(200).json(chatroom)
	} catch (err) {
		console.error('Error joining chatroom:', err)
		res.status(500).send('Error joining chatroom')
	}
})

app.post('/chatrooms/joined', async (req, res) => {
	const { ObjectId } = req.body

	// Step 1: Ensure ObjectId is a valid MongoDB ObjectId
	let userObjectId
	try {
		userObjectId = new mongoose.Types.ObjectId(ObjectId)
	} catch (error) {
		console.log('Invalid ObjectId format:', ObjectId) // Log the original value
		return res.status(400).json({ message: 'Invalid ObjectId format' })
	}

	// Step 2: Log the userObjectId to verify its value
	console.log('User ObjectId:', userObjectId)

	try {
		// Step 3: Simple query to check if any chatrooms match the user
		const joinedChatrooms = await Chatroom.find({
			members: { $in: [ObjectId] }, // Use $in to check if userObjectId is in the members array
		})

		// Step 4: Check if any chatrooms were found
		if (!joinedChatrooms.length) {
			console.warn('No chatrooms found for user:', ObjectId)
			return res
				.status(404)
				.json({ message: 'No chatrooms found for this user' })
		}

		// Step 5: If chatrooms are found, perform aggregation to count discussions and messages
		const populatedChatrooms = await Chatroom.aggregate([
			{
				$match: {
					_id: { $in: joinedChatrooms.map((room) => room._id) },
				},
			}, // Match only the chatrooms found above
			{
				$lookup: {
					from: 'discussions',
					localField: '_id',
					foreignField: 'chatroomId',
					as: 'discussions',
				},
			},
			{
				$addFields: {
					discussionCount: { $size: '$discussions' },
				},
			},
			{
				$lookup: {
					from: 'messages',
					localField: 'discussions._id',
					foreignField: 'discussionId',
					as: 'allMessages',
				},
			},
			{
				$addFields: {
					messageCount: { $size: '$allMessages' },
				},
			},
			{
				$project: {
					discussions: 0, // Optionally remove discussions if not needed
					allMessages: 0, // Optionally remove messages if not needed
				},
			},
		])

		// Step 6: Return the populated chatrooms with counts

		res.json(populatedChatrooms)
	} catch (err) {
		console.error('Error fetching joined chatrooms:', err)
		res.status(500).json({ message: 'Server error' })
	}
})

// Leave a chatroom
app.post('/chatrooms/:id/leave', async (req, res) => {
	const chatroomId = req.params.id
	const { ObjectId } = req.body

	try {
		const chatroom = await Chatroom.findById(chatroomId)
		if (!chatroom) {
			return res.status(404).send('Chatroom not found')
		}

		chatroom.members = chatroom.members.filter(
			(member) => member.toString() !== ObjectId
		)
		await chatroom.save()
		res.status(200).json(chatroom)
	} catch (err) {
		console.error('Error leaving chatroom:', err)
		res.status(500).send('Error leaving chatroom')
	}
})

// Send a message to a chatroom
app.post('/chatrooms/:id/messages', async (req, res) => {
	const chatroomId = req.params.id
	const { userId, content } = req.body

	try {
		const chat = new Chat({ chatroomId, user: userId, content })
		await chat.save()
		res.status(201).json(chat)
	} catch (err) {
		console.error('Error sending message:', err)
		res.status(500).send('Error sending message')
	}
})

// Get messages from a chatroom
app.get('/chatrooms/:chatroomId/messages', async (req, res) => {
	const { chatroomId } = req.params

	try {
		const messages = await Chat.find({ chatroomId })
		res.status(200).json(messages)
	} catch (err) {
		console.error('Error fetching messages:', err)
		res.status(500).send('Error fetching messages')
	}
})

app.get('/chatrooms/:chatroomId/discussions', async (req, res) => {
	const { chatroomId } = req.params
	const discussions = await Discussion.find({ chatroomId })
	res.json(discussions)
})

// Create a new discussion
app.post('/chatrooms/:chatroomId/discussions', async (req, res) => {
	const { chatroomId } = req.params
	const { name, type, createdBy } = req.body

	const user = await Chart.findOne({ id: createdBy })
	const discussion = new Discussion({
		name,
		type,
		chatroomId,
		createdBy: user._id,
	})
	await discussion.save()
	res.status(201).json(discussion)
})

app.post(
	'/chatrooms/:chatroomId/discussions/:discussionId/join',
	async (req, res) => {
		const { discussionId } = req.params
		const { userId } = req.body
		const discussion = await Discussion.findById(discussionId)
		if (!discussion.members.includes(userId)) {
			discussion.members.push(userId)
			await discussion.save()
		}
		res.json(discussion)
	}
)

app.post(
	'/chatrooms/:chatroomId/discussions/:discussionId/leave',
	async (req, res) => {
		const { discussionId } = req.params
		const { userId } = req.body
		const discussion = await Discussion.findById(discussionId)
		discussion.members = discussion.members.filter(
			(member) => member.toString() !== userId
		)
		await discussion.save()
		res.json(discussion)
	}
)

app.post('/discussions/:discussionId/messages', async (req, res) => {
	const { discussionId } = req.params
	const { userId, content } = req.body
	const user = await Chart.findOne({ id: userId })

	const message = new Message({ discussionId, user: user._id, content })
	await message.save()
	res.status(201).json(message)
})

// Fetch messages in a discussion
app.get('/discussions/:discussionId/messages', async (req, res) => {
	const { discussionId } = req.params

	try {
		const messages = await Message.find({ discussionId })
			.populate('user', 'name') // Populate the user field with only the name
			.populate('replies') // Populate replies if needed

		res.json(messages)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Internal server error' })
	}
})

app.post('/messages/:messageId/like', async (req, res) => {
	const { messageId } = req.params
	const { userId, like } = req.body // `like` can be true or false

	try {
		// Validate and fetch the user
		const user = await Chart.findOne({ id: userId })
		if (!user) {
			return res.status(404).send('User not found')
		}

		// Fetch the message
		const message = await Message.findById(messageId)
		if (!message) return res.status(404).send('Message not found')

		// Find if the user has already liked/disliked the message
		const existingLikeIndex = message.likedBy.findIndex((entry) =>
			entry.userId.equals(user._id)
		)

		if (existingLikeIndex > -1) {
			// User has already liked/disliked
			const existingLike = message.likedBy[existingLikeIndex]

			if (existingLike.liked === like) {
				// If the user clicks the same button again (toggle to neutral)
				if (like) {
					message.likes-- // Remove a "like" (subtract 1)
				} else {
					message.likes++ // Remove a "dislike" (add 1)
				}
				// Remove the entry from likedBy
				message.likedBy.splice(existingLikeIndex, 1)
			} else {
				// Toggle action: change from like to dislike or vice versa
				if (like) {
					message.likes += 2 // Change from dislike to like (net +1)
				} else {
					message.likes -= 2 // Change from like to dislike (net -1)
				}
				existingLike.liked = like // Update the like status
			}
		} else {
			// User has not liked/disliked before; add new entry if `like` is true or false
			message.likedBy.push({ userId: user._id, liked: like })
			if (like) {
				message.likes++ // Like adds 1
			} else {
				message.likes-- // Dislike subtracts 1
			}
		}

		// Save changes to the message
		await message.save()
		res.status(200).json(message)
	} catch (err) {
		console.error('Error updating message likes:', err)
		res.status(500).send('Error updating message likes')
	}
})

// Reply to a message
app.post('/messages/:messageId/reply', async (req, res) => {
	const { messageId } = req.params
	const { userId, content } = req.body

	const user = await Chart.findOne({ id: userId })
	console.log(userId)
	// const message = new Message({ discussionId, user: user._id, content })

	try {
		const parentMessage = await Message.findById(messageId)
		if (!parentMessage) return res.status(404).send('Message not found')

		const reply = new Message({
			content,
			user: user._id,
			discussionId: parentMessage.discussionId,
			parentMessage: parentMessage._id,
		})

		await reply.save()

		// Add reply to the parent message's replies array
		parentMessage.replies.push(reply._id)
		await parentMessage.save()

		res.status(201).json(reply)
	} catch (err) {
		console.error('Error replying to message:', err)
		res.status(500).send('Error replying to message')
	}
})

// Fetch replies for a message
app.get('/messages/:messageId/replies', async (req, res) => {
	const { messageId } = req.params

	try {
		const replies = await Message.find({
			parentMessage: messageId,
		}).populate('user')
		res.status(200).json(replies)
	} catch (err) {
		console.error('Error fetching replies:', err)
		res.status(500).send('Error fetching replies')
	}
})

// ======= Existing Analyze Route (Retained) =======
// (Note: Already included above)
app.get('*', (req, res) => {
	res.send('Hello from server.js!')
})
// ======= Server Setup =======
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
