import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBY0DGjQfhsmpSbmJsEi5umAXZHMxolL2U",
  authDomain: "teach-project-802ff.firebaseapp.com",
  projectId: "teach-project-802ff",
  storageBucket: "teach-project-802ff.appspot.com",
  messagingSenderId: "823831646795",
  appId: "1:823831646795:web:50409e8a026948b179f3ce"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1> TEACH | CHAT</h1>
        <Signout />
      </header>

      <section>
        {user ? <ChatRoom /> : <Signin />}
      </section>
    </div>
  );
}

function Signin(){

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return(
    <button id="signin_but" onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function Signout(){
  return auth.currentUser && (
    <button id="signout_but" onClick={() => auth.signOut()}>Sign out</button>
  )
}

function ChatRoom(){
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limitToLast(25);

  const [messages] = useCollectionData(query, {idField:"id"});

  const [formValue, setFormValue] = useState('');

  const dummy = useRef();

  useEffect(() => {
    dummy.current.scrollIntoView({behavior:'smooth'});
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const {uid, photoURL} = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
  }

  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>
      
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type here..." />
        <button type="submit" disabled={!formValue}>Send</button>
      </form>
    </>
  )
}

function ChatMessage(props){
  const {text, uid, photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return(
    <>
      <div className={'message ${messageClass}'}>
        <img src={photoURL} />
        <p>{text}</p>
      </div>
    </>
  )
}


export default App;
