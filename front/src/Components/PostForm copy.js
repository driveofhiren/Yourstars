import React, { useState } from 'react'
import axios from 'axios'
import * as tf from '@tensorflow/tfjs'
import * as useNLPModel from '@tensorflow-models/universal-sentence-encoder'

const HUGGING_FACE_API_KEY = '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' // Replace with your Hugging Face API key
const emotionModelID = 'bhadresh-savani/distilbert-base-uncased-emotion' // Emotion analysis model
const sentimentModelID = 'cardiffnlp/twitter-roberta-base-sentiment' // Example sentiment analysis model
const similarityModelID = 'neuml/pubmedbert-base-embeddings' // Model for semantic similarity

// Planet attributes with relevant keywords and feelings
const planetAttributes = {
	Sun: {
		keywords: ['leadership', 'confidence', 'success', 'authority', 'ego'],
		feelings: ['pride', 'vitality', 'energy', 'positivity'],
		positiveWeight: 3,
		negativeWeight: -1,
	},
	Moon: {
		keywords: ['emotions', 'feelings', 'intuition', 'nurturing', 'dreams'],
		feelings: ['sadness', 'nostalgia', 'caring', 'compassion'],
		positiveWeight: 1,
		negativeWeight: 2,
	},
	Mars: {
		keywords: ['action', 'conflict', 'aggression', 'drive', 'passion'],
		feelings: ['anger', 'determination', 'frustration'],
		positiveWeight: 1.5,
		negativeWeight: 2,
	},
	Mercury: {
		keywords: [
			'communication',
			'intellect',
			'decision',
			'analysis',
			'travel',
		],
		feelings: ['curiosity', 'confusion', 'clarity'],
		positiveWeight: 2,
		negativeWeight: 1,
	},
	Jupiter: {
		keywords: ['growth', 'abundance', 'optimism', 'expansion', 'wisdom'],
		feelings: ['joy', 'enthusiasm', 'hopefulness'],
		positiveWeight: 2.5,
		negativeWeight: -1,
	},
	Venus: {
		keywords: ['love', 'beauty', 'relationships', 'harmony', 'pleasure'],
		feelings: ['affection', 'contentment', 'romance'],
		positiveWeight: 2,
		negativeWeight: 0,
	},
	Saturn: {
		keywords: [
			'discipline',
			'structure',
			'responsibility',
			'limitations',
			'patience',
		],
		feelings: ['anxiety', 'seriousness', 'stress'],
		positiveWeight: -1,
		negativeWeight: 2.5,
	},
}

// Analyze content using Hugging Face API for emotion detection
const analyzeContentWithHuggingFace = async (content, modelID) => {
	const response = await fetch(
		`https://api-inference.huggingface.co/models/${modelID}`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ inputs: content }),
		}
	)

	if (!response.ok) {
		throw new Error('Failed to analyze content')
	}

	const data = await response.json()
	console.log(data)
	return data // Expect an array of emotions or sentiments with scores
}

// Calculate cosine similarity between two arrays (vectors)

// Get embeddings for semantic similarity
const getEmbeddings = async (text) => {
	const response = await fetch(
		`https://api-inference.huggingface.co/models/${similarityModelID}`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ inputs: text }),
		}
	)

	if (!response.ok) {
		throw new Error('Failed to get embeddings')
	}

	const data = await response.json()
	return data // Expect embeddings for the input text
}

// Calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
	const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
	const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0))
	const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0))
	return dotProduct / (magnitudeA * magnitudeB)
}

// Analyze content to determine karma scores for each planet
const analyzeContent = async (content) => {
	// const emotions = await analyzeContentWithHuggingFace(
	// 	content,
	// 	emotionModelID
	// )
	// const sentiments = await analyzeContentWithHuggingFace(
	// 	content,
	// 	sentimentModelID
	// )
	const karmaScores = {}

	// Initialize karma scores
	Object.keys(planetAttributes).forEach((planet) => {
		karmaScores[planet] = 0
	})

	// Analyze emotions and assign karma influence
	// emotions[0].forEach(({ label, score }) => {
	// 	switch (label) {
	// 		case 'joy':
	// 			karmaScores.Jupiter += score * 3 // More weight for joy on Jupiter
	// 			break
	// 		case 'sadness':
	// 			karmaScores.Moon += score * 2 // Weight for sadness on Moon
	// 			break
	// 		case 'anger':
	// 			karmaScores.Mars += score * 2 // Weight for anger on Mars
	// 			break
	// 		case 'fear':
	// 			karmaScores.Saturn += score // Fear could be linked to Saturn
	// 			break
	// 		case 'love':
	// 			karmaScores.Venus += score * 2 // Weight for love on Venus
	// 			break
	// 		default:
	// 			break
	// 	}
	// })

	// Analyze sentiments and assign karma influence
	// sentiments.forEach(({ label, score }) => {
	// 	switch (label) {
	// 		case 'LABEL_2':
	// 			Object.keys(karmaScores).forEach((planet) => {
	// 				karmaScores[planet] +=
	// 					score * planetAttributes[planet].positiveWeight // Boost all planets for positive sentiment
	// 			})
	// 			break
	// 		case 'LABEL_0':
	// 			Object.keys(karmaScores).forEach((planet) => {
	// 				karmaScores[planet] +=
	// 					score * planetAttributes[planet].negativeWeight // Detract from all planets for negative sentiment
	// 			})
	// 			break
	// 		default:
	// 			break
	// 	}
	// })

	// Keyword and feeling analysis using semantic similarity
	const contentEmbedding = await getEmbeddings(content)
	const similarityThreshold = 0.7 // Adjust threshold as needed

	await Promise.all(
		Object.entries(planetAttributes).map(async ([planet, attributes]) => {
			const keywordEmbeddings = await Promise.all(
				attributes.keywords.map(getEmbeddings)
			)

			const feelingEmbeddings = await Promise.all(
				attributes.feelings.map(getEmbeddings)
			)

			// Check for keywords
			const keywordMatches = keywordEmbeddings.some(
				(keywordEmbedding) => {
					return (
						cosineSimilarity(
							contentEmbedding[0],
							keywordEmbedding[0]
						) > similarityThreshold
					)
				}
			)

			if (keywordMatches) {
				karmaScores[planet] += attributes.positiveWeight // Adjust based on your logic
			}

			// Check for feelings
			const feelingMatches = feelingEmbeddings.some(
				(feelingEmbedding) => {
					return (
						cosineSimilarity(
							contentEmbedding[0],
							feelingEmbedding[0]
						) > similarityThreshold
					)
				}
			)

			if (feelingMatches) {
				karmaScores[planet] -= attributes.negativeWeight // Adjust based on your logic
			}
		})
	)

	// Normalize karma scores to percentages
	const totalScore = Object.values(karmaScores).reduce(
		(sum, score) => sum + score,
		0
	)

	return Object.entries(karmaScores).map(([planet, score]) => ({
		planet,
		percentage: totalScore
			? parseFloat(((score / totalScore) * 100).toFixed(2))
			: 0,
	}))
}

function PostForm() {
	const [postContent, setPostContent] = useState('')
	const [karmaResult, setKarmaResult] = useState(null)

	const handlePostSubmit = async (e) => {
		e.preventDefault()

		// Analyze content to determine karma types and scores
		try {
			const karmaArray = await analyzeContent(postContent)
			setKarmaResult(karmaArray)

			await axios.post('http://localhost:3333/posts', {
				content: postContent,
				karmaArray, // Send karma array with percentages
				userId: '0', // Hardcoding user ID for simplicity
			})

			setPostContent('')
		} catch (error) {
			console.error('Error analyzing content:', error)
		}
	}

	return (
		<div>
			<form
				className="bg-white shadow-lg rounded-lg p-6"
				onSubmit={handlePostSubmit}
			>
				<textarea
					className="w-full p-2 border border-gray-300 rounded"
					value={postContent}
					onChange={(e) => setPostContent(e.target.value)}
					placeholder="What's on your mind?"
				></textarea>

				<button
					className="mt-4 bg-blue-500 text-white rounded px-4 py-2"
					type="submit"
				>
					Submit
				</button>
			</form>

			{karmaResult && (
				<div className="mt-4">
					<h3>Karma Result:</h3>
					<ul>
						{karmaResult.map(({ planet, percentage }) => (
							<li key={planet}>
								{planet}: {percentage}%
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

export default PostForm
