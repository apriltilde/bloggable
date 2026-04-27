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

        fetchPosts(username);
        });
      } else {
        window.location.href = '/bloggable';
      }
    });


async function fetchPosts(chatId) {
  try {
    const postsCollection = collection(db, `blog/${chatId}/posts`);
    const postsSnapshot = await getDocs(postsCollection);

    const postsList = postsSnapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    });

    console.log('Posts:', postsList);
    postsList.sort((a, b) => {
      const aPinned = a.tags?.includes("#pinned") ? 1 : 0;
      const bPinned = b.tags?.includes("#pinned") ? 1 : 0;

      // If one is pinned and the other isn't
      if (aPinned !== bPinned) {
        return bPinned - aPinned; // pinned goes first
      }

      // Otherwise sort by date (newest first)
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;

      return bTime - aTime;
    });
    createPostsTable(postsList);

  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

function getPostSize(post) {
  const jsonString = JSON.stringify(post);
  return new Blob([jsonString]).size;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function createPostsTable(posts) {
  const tableContainer = document.getElementById('postsTableContainer');

  const flexTable = document.createElement('div');
  flexTable.classList.add('flex-table');

  // Header
  const headerRow = document.createElement('div');
  headerRow.classList.add('flex-row', 'header');

  const headers = ['filename', 'size', 'date', 'actions'];

  headers.forEach(text => {
    const cell = document.createElement('div');
    cell.classList.add('flex-cell');
    cell.textContent = text;
    headerRow.appendChild(cell);
  });

  flexTable.appendChild(headerRow);

  // Rows
  posts.forEach(post => {
    const row = document.createElement('div');
    row.classList.add('flex-row');

    // Filename
    const filenameCell = document.createElement('div');
    filenameCell.classList.add('flex-cell');
    filenameCell.textContent = post.id;
    row.appendChild(filenameCell);

    // Size (formatted bytes)
    const sizeCell = document.createElement('div');
    sizeCell.classList.add('flex-cell');

    const sizeInBytes = getPostSize(post);
    sizeCell.textContent = formatSize(sizeInBytes);

    row.appendChild(sizeCell);

    // Date
    const dateCell = document.createElement('div');
    dateCell.classList.add('flex-cell');
    dateCell.textContent = post.createdAt
      ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-GB')
      : 'N/A';
    row.appendChild(dateCell);

    // Actions
    const actionsCell = document.createElement('div');
    actionsCell.classList.add('flex-cell');

    // Delete (p)
    const deleteP = document.createElement('p');
    deleteP.textContent = 'X';
    deleteP.style.cursor = 'pointer';
    deleteP.style.display = 'inline';
    deleteP.style.marginRight = '10px';

    deleteP.addEventListener('click', () => {
      if (confirm('Are you sure you wish to delete this file?')) {
        deletePost(post.id);
      }
    });

    // Edit (p)
    const editP = document.createElement('p');
    editP.textContent = '✎';
    editP.style.cursor = 'pointer';
    editP.style.display = 'inline';

    editP.addEventListener('click', () => {
      saveContentToLocalStorage(post.id, post.tags, post.htmlContent);
      window.location.href = 'add.html';
    });

    actionsCell.appendChild(deleteP);
    actionsCell.appendChild(editP);

    row.appendChild(actionsCell);

    flexTable.appendChild(row);
  });

  tableContainer.innerHTML = '';
  tableContainer.appendChild(flexTable);
}

function saveContentToLocalStorage(postId, title, content) {
	const fileName = postId.replace(/\.html$/, '');
	const contentWithoutComments = content.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s+/, '');;
	console.log(contentWithoutComments)
  localStorage.setItem('fileName', fileName);
  localStorage.setItem('tags', title);
  localStorage.setItem('quillEditorContent', contentWithoutComments);
}

async function deletePost(postId) {
  try {
    const postRef = doc(db, `blog/${globalThis.username}/posts`, postId);
    await deleteDoc(postRef);
    fetchPosts(globalThis.username);
  } catch (error) {
    console.error('Error deleting post:', error);
  }
}
