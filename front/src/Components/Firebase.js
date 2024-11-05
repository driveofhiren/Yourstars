// src/Components/Firebase.js
import { initializeApp } from 'firebase/app'
import {
	getAuth,
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
	onAuthStateChanged,
} from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyAEoXxL7Zzxh1UoNO0ZkR5TUN6GdjcUl0c',
	authDomain: 'yourstars-911b9.firebaseapp.com',
	projectId: 'yourstars-911b9',
	storageBucket: 'yourstars-911b9.firebasestorage.app',
	messagingSenderId: '974750799107',
	appId: '1:974750799107:web:f122704a55cbf80566c536',
	measurementId: 'G-D5C281002S',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged }
