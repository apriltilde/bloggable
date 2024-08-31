import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";
 import { getFirestore, collection, addDoc, setDoc, doc, getDoc} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
 import { getAuth, onAuthStateChanged, setPersistence, signOut, browserLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js"; 
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
   	const auth = getAuth(app);
    const db = getFirestore();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        globalThis.user = auth.currentUser;
        let email = user.email;
        
        var passwordBytes = new TextEncoder().encode(email);
        crypto.subtle.digest('SHA-256', passwordBytes).then(function(hashBuffer) {
        	let big = Array.prototype.map.call(new Uint8Array(hashBuffer), x => ('00' + x.toString(16)).slice(-2)).join('');
        	globalThis.username = big.substring(0, 6);
        fetch(username);
        });
      } else {
        window.location.href = '/bloggable';
      }
    });
    
 


async function fetch(chatId) {
  try {
    // Reference to the specific document in the blog collection
    const docRef = doc(db, `blog/${chatId}/data/settings`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let data = docSnap.data();
      delete data.userId; // Remove userId from the data

      console.log('Document data (excluding userId):', data);
      updateCheckbox(data);
    } else {
      console.log('No such document!');
    }

  } catch (error) {
    console.error('Error fetching document:', error);
  }
}

function updateCheckbox(data) {
  // Iterate through all properties in the data object
  for (const [key, value] of Object.entries(data)) {
    if (value === true) {
      // Find the checkbox element by its ID (key)
      const checkbox = document.getElementById(key);

      // If the checkbox is found and is of type 'checkbox', set it to checked
      if (checkbox && checkbox.type === 'checkbox') {
        checkbox.checked = true;
        console.log(`Checkbox with id "${key}" set to checked.`);
      } else {
        console.warn(`Checkbox with id "${key}" not found or is not a checkbox.`);
      }
    }
  }
}

function getCheckboxStates() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const data = {};
  checkboxes.forEach(checkbox => {
    data[checkbox.id] = checkbox.checked;
  });
  return data;
}

// Function to update Firestore document
async function updateFirestoreDocument(chatId, data) {
  try {
    const docRef = doc(db, `blog/${chatId}/data/settings`);
    await setDoc(docRef, data, { merge: true });
    console.log('Document successfully updated!');
    location.reload();
  } catch (error) {
    console.error('Error updating document:', error);
  }
}

// Event listener for the button
document.querySelector('.btn').addEventListener('click', () => {
  const data = getCheckboxStates();
  updateFirestoreDocument(username, data);
});
