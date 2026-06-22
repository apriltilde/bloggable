import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";
 import { getFirestore, collection, addDoc, setDoc, getDocs,deleteDoc, doc} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
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

        fetchAsks(username);
        });
      } else {
        window.location.href = '/bloggable';
      }
    });


async function fetchAsks(chatId) {
  try {
    const messagesCollection = collection(db, `asks/${chatId}/messages`);
    const messagesSnapshot = await getDocs(messagesCollection);

    const asksList = messagesSnapshot.docs.map(d => {
      return { id: d.id, ...d.data() };
    });

    asksList.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return aTime - bTime;
    });

    console.log(asksList);

    createAsksTable(asksList);

  } catch (error) {
    console.error("Error fetching asks:", error);
  }
}

function createAsksTable(asks) {
  const tableContainer = document.getElementById('postsTableContainer');

  const flexTable = document.createElement('div');
  flexTable.classList.add('flex-table');

  // Header
  const headerRow = document.createElement('div');
  headerRow.classList.add('flex-row', 'header');

  const headers = ['username', 'date', 'actions'];

  headers.forEach(text => {
    const cell = document.createElement('div');
    cell.classList.add('flex-cell');
    cell.textContent = text;
    headerRow.appendChild(cell);
  });

  flexTable.appendChild(headerRow);

  // Rows
  asks.forEach(item => {
    const row = document.createElement('div');
    row.classList.add('flex-row');

    // username
    const userCell = document.createElement('div');
    userCell.classList.add('flex-cell');
    userCell.textContent = item.username || 'anon';
    row.appendChild(userCell);

    // date
    const dateCell = document.createElement('div');
    dateCell.classList.add('flex-cell');

    dateCell.textContent = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('en-GB')
      : 'N/A';

    row.appendChild(dateCell);

    // actions
    const actionsCell = document.createElement('div');
    actionsCell.classList.add('flex-cell');

    const deleteP = document.createElement('p');
    deleteP.textContent = 'X';
    deleteP.style.cursor = 'pointer';
    deleteP.style.display = 'inline';

    deleteP.addEventListener('click', () => {
      if (confirm('Delete this ask?')) {
        deleteAsk(item.id);
      }
    });

   const editP = document.createElement('p');
editP.textContent = '✎';
editP.style.cursor = 'pointer';
editP.style.display = 'inline';
editP.style.marginLeft = '10px';

editP.addEventListener('click', () => {
  saveAskToLocalStorage(item.username, item.message);
  window.location.href = '../add/add.html';
});

    actionsCell.appendChild(deleteP);
actionsCell.appendChild(editP);
    row.appendChild(actionsCell);

    flexTable.appendChild(row);
  });

  tableContainer.innerHTML = '';
  tableContainer.appendChild(flexTable);
}

function saveAskToLocalStorage(username, message) {
    const cleanedMessage = (message || '').replace(/^\s+/, '');

    localStorage.setItem('askUsername', username || 'anon');
    localStorage.setItem('askMessage', cleanedMessage);
    localStorage.removeItem('editflag');
    //localStorage.setItem('date')

    console.log("Ask saved to localStorage:", {
        username,
        message: cleanedMessage
    });
}


async function deleteAsk(messageId) {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("Not authenticated");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const chatId = username;

    if (!chatId) {
      console.error("Missing chatId");
      return;
    }

    const ref = doc(db, `asks/${chatId}/messages`, messageId);

    await deleteDoc(ref);

    fetchAsks(chatId);

  } catch (error) {
    console.error("Error deleting ask:", error);
  }
}
