import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

// Define the emotions and their corresponding colors
const emotionColors = {
	joy: '#FFD700', // Golden Yellow
	sadness: '#4682B4', // Steel Blue
	anger: '#FF6347', // Tomato Red
	fear: '#8B0000', // Dark Red
	love: '#FF1493', // Deep Pink
}

// Define the base colors for planets
const planetColors = {
	Sun: '#FFD700', // Sun (Golden)
	Moon: '#F0E68C', // Moon (Light Yellow)
	Mars: '#FF4500', // Mars (Red-Orange)
	Mercury: '#B0C4DE', // Mercury (Light Steel Blue)
	Venus: '#FF69B4', // Venus (Pink)
	Jupiter: '#FFDAB9', // Jupiter (Peach Puff)
	Saturn: '#D2B48C', // Saturn (Tan)
}

// Define the emoji for different emotions per planet
const planetEmojis = {
	Sun: {
		joy: '🌞',
		sadness: '😞',
		anger: '😡',
		fear: '😨',
		love: '❤️',
	},
	Moon: {
		joy: '🌝',
		sadness: '🌚',
		anger: '😠',
		fear: '😱',
		love: '💕',
	},
	Mars: {
		joy: '🔥',
		sadness: '💧',
		anger: '💥',
		fear: '⚡',
		love: '💘',
	},
	Mercury: {
		joy: '🎉',
		sadness: '😢',
		anger: '💣',
		fear: '😳',
		love: '💬',
	},
	Venus: {
		joy: '💖',
		sadness: '💔',
		anger: '😠',
		fear: '😨',
		love: '💞',
	},
	Jupiter: {
		joy: '🌈',
		sadness: '⛅',
		anger: '🌪️',
		fear: '🌩️',
		love: '💫',
	},
	Saturn: {
		joy: '🪐',
		sadness: '🌑',
		anger: '💢',
		fear: '🌘',
		love: '💟',
	},
}

const KarmaVisualizer = ({ karmaResult, emotions, sentiments }) => {
	const svgRef = useRef(null)

	useEffect(() => {
		const svg = d3
			.select(svgRef.current)
			.attr('width', '100%')
			.attr('height', '600px')
			.style('background', '#1A1A1D') // Deep space background color

		// Clear previous drawings
		svg.selectAll('*').remove()

		const width = svgRef.current.clientWidth
		const height = svgRef.current.clientHeight

		const centerX = width / 2
		const centerY = height / 2

		// Emotion and sentiment logic for more complex representation
		const emotionScores = emotions.reduce((acc, { label, score }) => {
			acc[label] = score
			return acc
		}, {})

		// Create an orbital system for each planet based on its karma result
		karmaResult.forEach(({ planet, percentage }, i) => {
			const orbitRadius = (i + 1) * 50 + 100 // Orbit size increases for each planet
			const planetSize = percentage * 3 // Size based on karma score
			const planetColor = planetColors[planet] || '#FFFFFF' // Planet color

			// Determine the dominant emotion
			const dominantEmotion = Object.keys(emotionScores).reduce(
				(max, key) =>
					emotionScores[key] > emotionScores[max] ? key : max
			)

			// Get the emoji based on the planet and dominant emotion
			const planetEmoji = planetEmojis[planet]?.[dominantEmotion] || '🔵'

			// Draw the orbit circle
			svg.append('circle')
				.attr('cx', centerX)
				.attr('cy', centerY)
				.attr('r', orbitRadius)
				.attr('fill', 'none')
				.attr('stroke', '#555')
				.attr('stroke-dasharray', '5,5')

			// Position the planet on the orbit
			svg.append('text')
				.attr('x', centerX + orbitRadius - planetSize)
				.attr('y', centerY + planetSize / 2)
				.attr('font-size', `${planetSize * 2}px`)
				.attr('text-anchor', 'middle')
				.text(planetEmoji)
		})

		// Overall scene sentiment: Adjust background gradient based on sentiment
		let sentimentColor
		if (sentiments === 'positive')
			sentimentColor = 'rgba(255, 223, 186, 0.5)'
		// Warm color for positive
		else if (sentiments === 'negative')
			sentimentColor = 'rgba(173, 216, 230, 0.5)'
		// Cool blue for negative
		else sentimentColor = 'rgba(192, 192, 192, 0.5)' // Neutral gray

		svg.style(
			'background',
			`radial-gradient(circle, ${sentimentColor}, #1A1A1D)`
		)
	}, [karmaResult, emotions, sentiments])

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
			}}
		>
			<svg ref={svgRef}></svg>
		</div>
	)
}

export default KarmaVisualizer
