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
    const docRef = doc(db, `blog/${userId}/data/settings`);
    const docSnap = await getDoc(docRef);
    let fileExtension = ""; 
    if (docSnap.exists()) {
        const settingsData = docSnap.data();
        if (settingsData.filext) {
            fileExtension = settingsData.filext;
        }
    }
    console.log(fileExtension);

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
                    const titleWithTxtExtension = doc.id.replace('.html', fileExtension);
                    posts.push({
                    	title: titleWithTxtExtension,
                        postDate: postData.createdAt.toDate(),
                        htmlContent: postData.htmlContent,
                        tags: postData.tags
                    });
                });
				console.log(posts)
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

    // Get the tags div
    var tagsDiv = document.getElementById("tags");

    // Clear previous tags
    tagsDiv.innerHTML = "";

    // Create and append links for each tag
    tagsSet.forEach(function(tag) {
        var tagLink = document.createElement("a");
        tagLink.href = "#"; // Set the link href if necessary
        tagLink.textContent = tag;
        tagLink.classList.add("tag-link"); // Add a class for styling if necessary
        tagLink.onclick = function() { // Add onclick event listener
            filterPostsByTag(tag); // Filter posts by clicked tag
        };
        tagsDiv.appendChild(tagLink); // Append tag link to tags div
        tagsDiv.appendChild(document.createTextNode(" ")); // Add space between tags
    });
}

// Function to filter posts by a specific tag
function filterPostsByTag(tag) {
    var posts = document.querySelectorAll(".post");

    // Loop through all posts
    posts.forEach(function(post) {
        // Find the metadata element within the post
        var metadataElement = post.querySelector(".metadata");
        // Check if metadata element exists
        if (metadataElement) {
            // Find the tags element within the metadata
            var tagsElement = metadataElement.querySelector(".tags");
            // Check if tags element exists
            if (tagsElement) {
                var tags = tagsElement.textContent.trim().toLowerCase().split(" ");
            } else {
                var tags = []; // Assume tags is empty if not found
            }
            // Check if clicked tag is present in the post's tags
            if (tags.includes(tag.toLowerCase()) || tag === "") { // Check if tag matches or tag is empty
                post.style.display = "block"; // Show the post
            } else {
                post.style.display = "none"; // Hide the post
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
      if (data.theme === 'winxp') {

        const stylesLink = document.querySelector('link[href="styles.css"]');
        if (stylesLink) {
          stylesLink.remove();
        }

        const xpLink = document.createElement('link');
        xpLink.rel = 'stylesheet';
        xpLink.href = 'https://unpkg.com/xp.css';
        document.head.appendChild(xpLink);

        const winLink = document.createElement('link');
        winLink.rel = 'stylesheet';
        winLink.href = 'win.css';
        document.head.appendChild(winLink);
        
        // Modify every post
        const posts = document.querySelectorAll('.post');
        posts.forEach(post => {
          const title = post.querySelector('.title').textContent;
          const content = post.innerHTML.replace(/<h1 class="title">.*?<\/h1>/, ''); // Remove the title
          post.innerHTML = `
            <div class="window">
              <div class="title-bar">
                <div class="title-bar-text">${title}</div>
                <div class="title-bar-controls">
                  <button aria-label="Minimize"></button>
                  <button aria-label="Maximize"></button>
                  <button aria-label="Close"></button>
                </div>
              </div>
              <div class="window-body">
                ${content}
              </div>
            </div>
          `;
        });
      }
      if (data.theme === 'win98') {
      
              const stylesLink = document.querySelector('link[href="styles.css"]');
              if (stylesLink) {
                stylesLink.remove();
              }
      
              const xpLink = document.createElement('link');
              xpLink.rel = 'stylesheet';
              xpLink.href = 'https://unpkg.com/98.css';
              document.head.appendChild(xpLink);
      
              const winLink = document.createElement('link');
              winLink.rel = 'stylesheet';
              winLink.href = 'win.css';
              document.head.appendChild(winLink);
              
              // Modify every post
              const posts = document.querySelectorAll('.post');
              posts.forEach(post => {
                const title = post.querySelector('.title').textContent;
                const content = post.innerHTML.replace(/<h1 class="title">.*?<\/h1>/, ''); // Remove the title
                post.innerHTML = `
                  <div class="window">
                    <div class="title-bar">
                      <div class="title-bar-text">${title}</div>
                      <div class="title-bar-controls">
                        <button aria-label="Minimize"></button>
                        <button aria-label="Maximize"></button>
                        <button aria-label="Close"></button>
                      </div>
                    </div>
                    <div class="window-body">
                      ${content}
                    </div>
                  </div>
                `;
              });
            }
    } else {
      console.log('No such document!');
    }

  } catch (error) {
    console.error('Error fetching document:', error);
  }
}

// Function to toggle post order
document.getElementById("oldestfirst").addEventListener("click", function(event) {
    event.preventDefault();
    var container = document.getElementById("postcontainer");
    if (container.style.flexDirection === "column-reverse") {
        container.style.flexDirection = "column";
    } else {
        container.style.flexDirection = "column-reverse";
    }
});


window.addEventListener('message', (event) => {
    if (event.data.cssUrl) {
        // Create a new link element
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = event.data.cssUrl;
        link.id = 'abcdefg12345'; // Assign the ID to the link element

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
