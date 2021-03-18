import './App.css';
import React, { useState } from 'react';

import firebase from 'firebase/app';
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

if (firebase.apps.length === 0) {
  firebase.initializeApp({ 
  apiKey: "AIzaSyCaDipX_NhQPje7QEYGLFnNxl37VJvATTo",
  authDomain: "superchat-ba6d7.firebaseapp.com",
  projectId: "superchat-ba6d7",
  storageBucket: "superchat-ba6d7.appspot.com",
  messagingSenderId: "548434030975",
  appId: "1:548434030975:web:8615dd1f1a0503ed636a4a"});
} else {
  firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {

  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Superchat</h1>
      </header>

      <section>
        { user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const SignInWithGoogle = () => {
    const provider =  new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }

  return(
    <button onClick={SignInWithGoogle}>Sign In with Google</button>
  )
}

function SignOut() {

  return auth.currentUser && (
    <button onClick={() => auth.signOut}>Sign Out</button>
  )
}

function ChatRoom() {
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)

  const [messages] = useCollectionData(query, {idField: 'id'})
  const [formValue, setFormValue] = useState('')

  const sendMessage = async (e) => {
    e.preventDefault()

    const {uid, photoURL} = auth.currentUser

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    
    setFormValue('')
  }

  return(
    <>
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </div>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>

        <button type="submit">Send</button>

      </form>
    </>

  )
}

function ChatMessage(props) {

  const {text, uid, photoURL } = props.message
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL}/>
      <p>{text}</p>
    </div>
  )
}

export default App;
