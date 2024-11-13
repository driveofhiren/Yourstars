import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../Components/PlanetaryCircle.css'

const getHouseFromDegree = (degree) => Math.ceil(degree / 30)

const planetColors = {
	Sun: '#FFD700',
	Moon: '#ADD8E6',
	Mercury: '#DAA520',
	Venus: '#FF69B4',
	Mars: '#FF4500',
	Jupiter: '#D2691E',
	Saturn: '#B8860B',
	Uranus: '#4682B4',
	Neptune: '#4169E1',
	Pluto: '#8B008B',
	Ascendant: '#FF1493',
}

function PlanetaryCircle({
	conjunctions,
	createChatroom,
	filterChatrooms,
	zodiacSigns,
}) {
	const [filterRoom, setFilterRoom] = useState({
		planet: [],
		sign: '',
		house: '',
		filterBy: 'both',
	})

	const calculateHouse = (current_sign) => {
		let ascendantDegree = null
		let ascendantHouse = null
		for (const [house, planets] of Object.entries(conjunctions)) {
			const ascendant = planets.find(
				(planet) => planet.planet === 'Ascendant'
			)
			if (ascendant) {
				ascendantDegree = ascendant.degree
				ascendantHouse = house
				break
			}
		}
		if (ascendantDegree === null || ascendantHouse === null) {
			console.error('Ascendant not found in conjunctions')
			return null
		}
		const ascendantSign = Math.floor(ascendantDegree / 30) + 1
		return current_sign >= ascendantSign
			? current_sign - ascendantSign + 1
			: 12 - (ascendantSign - current_sign) + 1
	}

	const handlePlanetClick = (houseKey, planetsInHouse) => {
		const signNumber = parseInt(houseKey)
		const houseNumber = calculateHouse(signNumber)

		const newRoomData = {
			planet: planetsInHouse.map((planetData) => planetData.planet),
			sign: signNumber,
			house: houseNumber,
		}
		createChatroom(newRoomData)
	}

	const handleFilterClick = (planetsInHouse, houseKey) => {
		const planets = planetsInHouse.map(({ planet }) => planet)
		const signNumber = parseInt(houseKey)
		const filterData = {
			planet: planets,
			sign: signNumber,
			house: calculateHouse(signNumber),
			filterBy: filterRoom.filterBy,
		}
		filterChatrooms(filterData)
	}

	return (
		<div className="astrology-container">
			<div className="astrology-chart-container">
				<div className="filter-controls">
					<label className="text-light small-font">
						Filter by:
						<select
							className="filter-select ms-2"
							value={filterRoom.filterBy}
							onChange={(e) =>
								setFilterRoom({
									...filterRoom,
									filterBy: e.target.value,
								})
							}
						>
							<option value="both">Both</option>
							<option value="sign">Sign</option>
							<option value="house">House</option>
						</select>
					</label>
				</div>
				<div className="circle-container">
					{Object.entries(conjunctions).map(([houseKey, planets]) => {
						return planets.map((planetData) => {
							const rotationAngle = planetData.degree + 90

							return (
								<div
									key={planetData.planet}
									className="planet-icon"
									style={{
										'--planet-color':
											planetColors[planetData.planet],
										transform: `rotate(-${rotationAngle}deg) translate(12vw) rotate(${rotationAngle}deg) `,
									}}
								>
									<div className="hover-details">
										{zodiacSigns[houseKey - 1]}
										<div>{'|'}</div>

										{parseFloat(planetData.degree).toFixed(
											2
										)}
									</div>

									<p>{planetData.planet}</p>
									<div className="icon-options">
										<span
											className="filter-icon"
											onClick={() =>
												handleFilterClick(
													planets,
													houseKey
												)
											}
										>
											🔍
										</span>
										<span
											className="create-room-icon"
											onClick={() =>
												handlePlanetClick(
													houseKey,
													planets
												)
											}
										>
											➕
										</span>
									</div>
								</div>
							)
						})
					})}
				</div>
			</div>
		</div>
	)
}

export default PlanetaryCircle
