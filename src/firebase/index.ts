import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyBPDCkC4ntfvCJe2aNYKFzKpvN6RCPUe_E',
  authDomain: 'graimer-recursion.firebaseapp.com',
  projectId: 'graimer-recursion',
  storageBucket: 'graimer-recursion.appspot.com',
  messagingSenderId: '978055071400',
  appId: '1:978055071400:web:527c8d9b8e7c0b3dbba49d',
  measurementId: 'G-3FHTD4YJ7Z',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
