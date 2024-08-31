import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";
 import { getFirestore, collection, addDoc, setDoc, getDocs,deleteDoc, doc} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
 import { getAuth, onAuthStateChanged, setPersistence, signOut, browserLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13/firebase-auth.js"; 
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
    createPostsTable(postsList);

  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

function createPostsTable(posts) {
  const tableContainer = document.getElementById('postsTableContainer');

  // Create a table element
  const table = document.createElement('table');
  table.classList.add('standard-dialog', 'center', 'scale-down');
  // Create table headers
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = ['Filename', 'Date', 'Tags', 'Actions'];

  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body and populate it with posts data
  const tbody = document.createElement('tbody');
  posts.forEach(post => {
    const row = document.createElement('tr');

    // Create and append cells for each post property
    const idCell = document.createElement('td');
    idCell.textContent = post.id;
    idCell.style.textAlign = 'left';
    row.appendChild(idCell);

    const titleCell = document.createElement('td');
titleCell.textContent = post.createdAt 
        ? new Date(post.createdAt.seconds * 1000).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) 
        : 'N/A';
        row.appendChild(titleCell);


    const contentCell = document.createElement('td');
    contentCell.textContent = post.tags || 'N/A'; // Default to 'No content' if content is missing
    row.appendChild(contentCell);

    const actionsCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.style.backgroundColor = 'white';
    deleteButton.style.color = 'black';
    deleteButton.style.border = 'none';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.padding = '5px 10px';
    deleteButton.style.borderRadius = '3px';
    deleteButton.addEventListener('click', () => {
      if (confirm('Are you sure you wish to delete this file?')) {
        deletePost(post.id);
      }
    });
    actionsCell.appendChild(deleteButton);

        const editButton = document.createElement('button');
    editButton.textContent = '✎';
    editButton.style.backgroundColor = 'white';
    editButton.style.color = 'black';
    editButton.style.border = 'none';
    editButton.style.cursor = 'pointer';
    editButton.style.padding = '5px 10px';
    editButton.style.borderRadius = '3px';

    // Add click event listener for edit button
    editButton.addEventListener('click', () => {
      // Save content to local storage
      saveContentToLocalStorage(post.id, post.tags, post.htmlContent);
      // Redirect to add.html
      window.location.href = 'add.html';
    });
    actionsCell.appendChild(editButton);
    row.appendChild(actionsCell);
    tbody.appendChild(row);

   
  });

  table.appendChild(tbody);

  // Clear any existing content in the container and append the new table
  tableContainer.innerHTML = '';
  tableContainer.appendChild(table);
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
