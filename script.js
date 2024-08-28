import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13/firebase-firestore.js";
import { getAuth, onAuthStateChanged, setPersistence, signOut, browserLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXQJF2HKqIw4GpH1foV7rItLrsSOiSOoU",
  authDomain: "blogtool-d9e10.firebaseapp.com",
  projectId: "blogtool-d9e10",
  storageBucket: "blogtool-d9e10.appspot.com",
  messagingSenderId: "352693217932",
  appId: "1:352693217932:web:29ddbe468408382b9ce9a9",
  measurementId: "G-5L8HWCBC0Z"
};


  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const firestore = getFirestore(app);
  const auth = getAuth(app);


      onAuthStateChanged(auth, (user) => {
      if (user) {
        globalThis.user = auth.currentUser;
        let email = user.email;
        
        var passwordBytes = new TextEncoder().encode(email);
        crypto.subtle.digest('SHA-256', passwordBytes).then(function(hashBuffer) {
        	let big = Array.prototype.map.call(new Uint8Array(hashBuffer), x => ('00' + x.toString(16)).slice(-2)).join('');
        	globalThis.username = big.substring(0, 6);
        	const uidSpan = document.querySelector('.uid');
            if (uidSpan) {
                uidSpan.textContent = globalThis.username;
            }
        });
      } else {
      }
    });


async function sha256(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
}


document.querySelector('.btn-primary').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('text_email').value;
    const password = document.getElementById('text_pwd').value;

    if (email && password) {
        const hashedPassword = await sha256(password);
        try {
            const userCredential = await signInWithEmailAndPassword(getAuth(), email, hashedPassword);
            const user = userCredential.user;
            signOut(auth)
            setPersistence(auth, browserLocalPersistence)
              .then(() => {
                // Sign in with email and password
                return signInWithEmailAndPassword(getAuth(), email, hashedPassword);
              })
            
            alert('Logged in');
        } catch (error) {
            if (error.code === 'auth/invalid-credential') {
                try {
                    const userCredential = await createUserWithEmailAndPassword(getAuth(), email, hashedPassword);
                    const user = userCredential.user;
                    alert('User created');
                } catch (error) {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error('Error creating user:', errorCode, errorMessage);
                }
            } else {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Error logging in user:', errorCode, errorMessage);
            }
        }
    } else {
        console.error('Email and password are required.');
    }
});

