// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDtJm9J8egcPvC7KUq9Qui-SQOl4f8M66g',
  authDomain: 'invoice-app-ad.firebaseapp.com',
  projectId: 'invoice-app-ad',
  storageBucket: 'invoice-app-ad.appspot.com',
  messagingSenderId: '748904045877',
  appId: '1:748904045877:web:f584c76a2710042c4c407c'
}

const firebaseApp = initializeApp(firebaseConfig)
const firestore = getFirestore(firebaseApp)

export default firestore
