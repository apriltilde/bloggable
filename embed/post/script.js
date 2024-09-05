// Import the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyBXQJF2HKqIw4GpH1foV7rItLrsSOiSOoU",
   authDomain: "blogtool-d9e10.firebaseapp.com",
   projectId: "blogtool-d9e10",
   storageBucket: "blogtool-d9e10.appspot.com",
   messagingSenderId: "352693217932",
   appId: "1:352693217932:web:29ddbe468408382b9ce9a9",
   measurementId: "G-5L8HWCBC0Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to load posts
async function loadPosts() {
    // Extract user ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const postName = urlParams.get('postname');
    const docRef = doc(db, `blog/${userId}/data/settings`);
    const docSnap = await getDoc(docRef);
    let fileExtension = ""; 
    if (docSnap.exists()) {
        const settingsData = docSnap.data();
        if (settingsData.filext) {
            fileExtension = settingsData.filext;
        }
    }

    if (userId) {
        const postsRef = collection(db, `blog/${userId}/posts`);
        const q = query(postsRef);

        try {
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                document.getElementById("postcontainer").textContent = "No posts found";
            } else {
                const posts = [];
                querySnapshot.forEach((doc) => {
                    const postData = doc.data();
                    const originalTitle = doc.id.replace('.html', '');
                    const titleWithTxtExtension = doc.id.replace('.html', fileExtension);
                   if (originalTitle === postName) {
                        posts.push({
                            title: titleWithTxtExtension,
                            postDate: postData.createdAt.toDate(),
                            htmlContent: postData.htmlContent,
                            tags: postData.tags
                        });
                    }
                });
                // Sort posts by date, newest first
                posts.sort((a, b) => b.postDate - a.postDate);

                // Append sorted posts to post container
                const postContainer = document.getElementById("postcontainer");
                posts.forEach(post => {
                    const postDiv = document.createElement("div");
                    postDiv.classList.add("post");

				    const title = document.createElement("h1");
				    title.classList.add("title");
				    title.innerText = post.title; // Use post.title here
				    postDiv.appendChild(title);

				    // Set HTML content
				    postDiv.innerHTML += post.htmlContent;

                    const metadataDiv = document.createElement("div");
                    metadataDiv.classList.add("metadata");
                    metadataDiv.innerHTML = `<p>${post.postDate.toLocaleString()}</p>`;
                    if (post.tags !== "") {
                        metadataDiv.innerHTML += `<p class='tags'>${post.tags}</p>`;
                    } else {
                        metadataDiv.innerHTML += "<p class='tags'></p>";
                    }

                    postDiv.appendChild(metadataDiv); // Append metadata after HTML content
                    postContainer.appendChild(postDiv);
                });
                const linkBack = document.createElement("a");
                    linkBack.id = "linkback";
                    linkBack.href = `https://arpilmyroomim.neocities.org/embed/index.html?userId=${userId}`;
                    linkBack.innerText = "See other posts by this user";
                    postContainer.appendChild(linkBack);
                fetch(userId);
                extractAndDisplayTags();
            }
        } catch (error) {
            console.error("Error loading posts:", error);
        }
    } else {
        console.error("User ID not found in URL");
    }
}

// Function to extract and display all tags
function extractAndDisplayTags() {
    var posts = document.querySelectorAll(".post");
    var tagsSet = new Set();

    // Extract all tags from posts and add to tags set
    posts.forEach(function(post) {
        var metadataElement = post.querySelector(".metadata");
        if (metadataElement) {
            var tagsElement = metadataElement.querySelector(".tags");
            if (tagsElement) {
                var postTags = tagsElement.textContent.trim().split(" ");
                postTags.forEach(function(tag) {
                    tagsSet.add(tag.trim()); // Add tag to set
                });
            }
        }
    });

}


async function fetch(chatId) {
  try {
    // Reference to the specific document in the blog collection
    const docRef = doc(db, `blog/${chatId}/data/settings`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let data = docSnap.data();
      delete data.userId;
      if (data.titles === false) {
        document.querySelectorAll('.title').forEach(el => el.style.display = 'none');
      }
      if (data.dates === false) {
        document.querySelectorAll('.metadata').forEach(el => el.style.display = 'none');
      }
    } else {
      console.log('No such document!');
    }

  } catch (error) {
    console.error('Error fetching document:', error);
  }
}



window.addEventListener('message', (event) => {
    if (event.data.cssUrl) {
        // Create a new link element
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = event.data.cssUrl;
        link.id = 'abcd2345'; // Assign the ID to the link element

        // Remove any existing link element with the same ID
        const existingLink = document.getElementById(link.id);
        if (existingLink) {
            document.head.removeChild(existingLink);
        }

        // Append the new link element to the document head
        document.head.appendChild(link);
    }
});

// Fetch posts when the page loads
window.onload = function() {
    loadPosts();
};
