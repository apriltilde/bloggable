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
    const db = getFirestore();


async function fetchPosts(chatId) {
  try {
    const postsCollection = collection(db, `blog/${chatId}/posts`);
    const postsSnapshot = await getDocs(postsCollection);

    const postsList = postsSnapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() };
    });

    console.log('Posts:', postsList);
    createPostsList(postsList);

  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

function createPostsList(posts) {
  const listContainer = document.getElementById('postsTableContainer');

  // Create a list element
  const list = document.createElement('ul');
  list.classList.add('post-list');

  // Populate the list with posts data
  posts.forEach(post => {
    const listItem = document.createElement('li');
    
    // Create a link for the post name and date together
    const postLink = document.createElement('a');
    const postIdWithoutHtml = post.id.replace('.html', ''); // Remove .html extension
    postLink.href = `https://arpilmyroomim.neocities.org/embed/post/post.html?userId=${chatId}&postname=${postIdWithoutHtml}`;

    // Add the date to the link text
    const postDate = post.createdAt 
      ? new Date(post.createdAt.seconds * 1000).toLocaleString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit', 
          hour12: false 
        }) 
      : 'N/A';

    // Set the text content of the link to include the date and post name
    postLink.textContent = `${postDate} - ${postIdWithoutHtml}`;

    // Append the link (with date and name) to the list item
    listItem.appendChild(postLink);

    // Append the list item to the list
    list.appendChild(listItem);
  });

  // Clear any existing content in the container and append the new list
  listContainer.innerHTML = '';
  listContainer.appendChild(list);
}

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    globalThis.chatId = urlParams.get('userId');
    fetchPosts(chatId);
};

