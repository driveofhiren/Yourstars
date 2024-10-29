import React, { useState } from 'react'
import axios from 'axios'
import KarmaVisualizer from './KarmaVisualizer'

const HUGGING_FACE_API_KEY = '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' // Replace with your Hugging Face API key
const emotionModelID = 'bhadresh-savani/distilbert-base-uncased-emotion' // Emotion analysis model
const sentimentModelID = 'cardiffnlp/twitter-roberta-base-sentiment' // Example sentiment analysis model

const planetWeights = {
	Sun: { joy: 2.0, sadness: 0.5, anger: 1.5, fear: 0.3, love: 1.6 },
	Moon: { joy: 1.1, sadness: 2.0, anger: 0.5, fear: 1.0, love: 1.4 },
	Mars: { joy: 1.0, sadness: 0.7, anger: 2.2, fear: 1.5, love: 0.6 },
	Mercury: { joy: 1.5, sadness: 0.4, anger: 0.9, fear: 1.2, love: 1.0 },
	Jupiter: { joy: 1.8, sadness: 0.6, anger: 0.8, fear: 0.5, love: 1.5 },
	Venus: { joy: 2, sadness: 0.5, anger: 0.2, fear: 0.4, love: 2.2 },
	Saturn: { joy: 0.7, sadness: 1.8, anger: 0.7, fear: 1.8, love: 0.6 },
}

// Define sentiment weights for each planet
const planetSentimentWeights = {
	Sun: { positive: 1.2, negative: -1.0, neutral: 0.5 },
	Moon: { positive: 1.0, negative: -1.5, neutral: 0.5 },
	Mars: { positive: 1.5, negative: -1.8, neutral: 0.5 },
	Mercury: { positive: 1.1, negative: -0.5, neutral: 0.5 },
	Jupiter: { positive: 1.4, negative: -0.3, neutral: 0.5 },
	Venus: { positive: 1.3, negative: -0.7, neutral: 0.5 },
	Saturn: { positive: 0.8, negative: -1.2, neutral: 0.5 },
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

// Analyze content to determine karma scores for each planet
const analyzeContent = async (content) => {
	const karmaScores = {}
	try {
		const response = await axios.post('http://localhost:3333/analyze', {
			content: content,
		})
		Object.keys(response.data).forEach((planet) => {
			karmaScores[planet] = response.data[planet] || 0 // Assign API value or default to 0
		})
	} catch (error) {
		console.error('Error analyzing content:', error)
	}

	const emotions = await analyzeContentWithHuggingFace(
		content,
		emotionModelID
	)
	const sentiments = await analyzeContentWithHuggingFace(
		content,
		sentimentModelID
	)

	// Apply weight adjustments based on emotions and planet weights
	emotions[0].forEach(({ label, score }) => {
		Object.keys(planetWeights).forEach((planet) => {
			if (planetWeights[planet][label]) {
				// Use a more dynamic scale for emotion
				const adjustedWeight =
					planetWeights[planet][label] * (1 + score * 0.5) // Adjust the influence based on the score
				karmaScores[planet] += score * adjustedWeight // Apply the adjusted weight
			}
		})
	})

	// Analyze sentiments and assign karma influence based on specific planet weights
	sentiments.forEach(({ label, score }) => {
		Object.keys(planetSentimentWeights).forEach((planet) => {
			if (label === 'LABEL_2') {
				// Positive sentiment
				karmaScores[planet] +=
					score * planetSentimentWeights[planet].positive
			} else if (label === 'LABEL_0') {
				// Negative sentiment
				karmaScores[planet] +=
					score * planetSentimentWeights[planet].negative
			} else if (label === 'LABEL_1') {
				// Neutral sentiment
				karmaScores[planet] +=
					score * planetSentimentWeights[planet].neutral
			}
		})
	})

	// Normalize karma scores to percentages
	const totalScore = Object.values(karmaScores).reduce(
		(sum, score) => sum + score,
		0
	)

	const karmaResult = Object.entries(karmaScores).map(([planet, score]) => ({
		planet,
		percentage: totalScore
			? parseFloat(((score / totalScore) * 100).toFixed(2))
			: 0,
	}))

	return { karmaResult, emotions: emotions[0], sentiments }
}

function PostForm() {
	const [postContent, setPostContent] = useState('')
	const [karmaResult, setKarmaResult] = useState(null)
	const [emotions, setEmotions] = useState(null) // New state for emotions
	const [sentiments, setSentiments] = useState(null) // New state for sentiments

	const handlePostSubmit = async (e) => {
		e.preventDefault()

		// Analyze content to determine karma types and scores
		try {
			const outputs = await analyzeContent(postContent)

			setKarmaResult(outputs.karmaResult)
			setEmotions(outputs.emotions)
			setSentiments(outputs.sentiments)
			console.log(karmaResult)
			console.log(emotions)
			console.log(sentiments)

			await axios.post('http://localhost:3333/posts', {
				content: postContent,
				karmaScores: outputs.karmaResult, // Send karma array with percentages
				userId: '0', // Hardcoding user ID for simplicity
			})
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
					{karmaResult && emotions && sentiments && (
						<KarmaVisualizer
							karmaResult={karmaResult}
							emotions={emotions}
							sentiments={sentiments}
						/>
					)}
					{/* Add the visualizer */}
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
