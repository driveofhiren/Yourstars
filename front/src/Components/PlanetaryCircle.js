import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import '../Components/PlanetaryCircle.css'

const getHouseFromDegree = (degree) => Math.ceil(degree / 30)
const degreeToPositionAngle = (degree) => (degree % 30) * (360 / 30)

function PlanetaryCircle({ conjunctions, createChatroom, filterChatrooms }) {
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
		<div className="astrology-chart-container">
			<div className="filter-controls">
				<label className="text-light">
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
				{[...Array(12).keys()].map((houseIndex) => (
					<div key={houseIndex} className="circle-section">
						<div className="circle-section-content">
							{Object.entries(conjunctions).map(
								([houseKey, planets]) => {
									// Filter planets in the current house (sign)
									const planetsInHouse = planets.filter(
										({ degree }) =>
											getHouseFromDegree(degree) ===
											houseIndex + 1
									)

									if (planetsInHouse.length > 0) {
										return (
											<OverlayTrigger
												key={houseKey}
												placement="top"
												trigger="click"
												overlay={
													<Tooltip>
														<div className="tooltip-content">
															<div>
																<strong>
																	Sign{' '}
																	{houseKey}
																</strong>
															</div>
															<div>
																Planets:{' '}
																{planetsInHouse
																	.map(
																		(
																			planetData
																		) =>
																			planetData.planet
																	)
																	.join(', ')}
															</div>
															<div className="icon-options">
																<span
																	className="filter-icon"
																	onClick={() =>
																		handleFilterClick(
																			planetsInHouse,
																			houseKey
																		)
																	}
																>
																	🔍
																</span>
																<span
																	className="create-room-icon"
																	onClick={(
																		e
																	) => {
																		e.stopPropagation()
																		handlePlanetClick(
																			houseKey,
																			planetsInHouse
																		)
																	}}
																>
																	➕
																</span>
															</div>
														</div>
													</Tooltip>
												}
											>
												<div
													className="house-icon"
													style={{
														backgroundColor: `hsl(${
															houseIndex * 30
														}, 80%, 60%)`,
													}}
													data-house={houseKey}
												>
													Sign {houseKey}
												</div>
											</OverlayTrigger>
										)
									}
									return null
								}
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default PlanetaryCircle
