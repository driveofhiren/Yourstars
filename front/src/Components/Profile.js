import React, { useState, useEffect } from 'react'
import axios from 'axios'

function Profile() {
	const [userData, setUserData] = useState(null)

	useEffect(() => {
		const fetchUserData = async () => {
			const response = await axios.get('http://localhost:3333/user/2') // Assuming user ID 1
			setUserData(response.data)
		}
		fetchUserData()
	}, [])

	return (
		<div className="container mx-auto mt-10">
			{userData && (
				<div className=" shadow-lg rounded-lg p-6">
					<h2 className="text-2xl font-bold">
						Welcome, {userData.name}
					</h2>
					<div className="grid grid-cols-2 gap-4 mt-6">
						<div>Sun Karma: {userData.karma.sun}</div>
						<div>Moon Karma: {userData.karma.moon}</div>
						<div>Mars Karma: {userData.karma.mars}</div>
						<div>Mercury Karma: {userData.karma.mercury}</div>
						<div>Jupiter Karma: {userData.karma.jupiter}</div>
						<div>Venus Karma: {userData.karma.venus}</div>
						<div>Saturn Karma: {userData.karma.saturn}</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default Profile
