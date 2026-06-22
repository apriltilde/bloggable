import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, query, addDoc, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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
const db = getFirestore(app);


fetch("https://tilde.club/~april/bloggable/data/data.php", {
    method: "POST",
    body: new URLSearchParams({
        ref: document.referrer
    })
})
.then(r => r.json())
.then()
.catch(console.error);

async function loadPosts() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    if (!userId) {
        console.error("User ID not found in URL");
        return;
    }

    const cacheKey = `posts_${userId}`;
    const cached = sessionStorage.getItem(cacheKey);

    const postContainer = document.getElementById("postcontainer");

const CACHE_DURATION = 1 * 60 * 1000; // 1 minutes

if (cached) {
    try {
        const parsed = JSON.parse(cached);

        if (
            parsed &&
            Array.isArray(parsed.posts) &&
            Date.now() - parsed.timestamp < CACHE_DURATION
        ) {
            console.log("Posts from cache");

            const posts = parsed.posts.map(p => ({
                ...p,
                postDate: new Date(p.postDate)
            }));

            renderPosts(posts, postContainer);
            return;
        } else {
            // expired or invalid
            sessionStorage.removeItem(cacheKey);
        }
    } catch (e) {
        sessionStorage.removeItem(cacheKey);
    }
}

    const postsRef = collection(db, `blog/${userId}/posts`);
    const q = query(postsRef);

    try {
        const querySnapshot = await getDocs(q);
        console.log("Posts from DB")

        if (querySnapshot.empty) {
            postContainer.textContent = "No posts found";
            return;
        }

        const posts = [];

        querySnapshot.forEach((d) => {
            const data = d.data();

            posts.push({
                title: d.id.replace('.html', ''),
                postDate: data.createdAt?.toDate?.() || new Date(0),
                htmlContent: data.htmlContent || "",
                tags: data.tags || ""
            });
        });

        posts.sort((a, b) => b.postDate - a.postDate);

sessionStorage.setItem(
    cacheKey,
    JSON.stringify({
        timestamp: Date.now(),
        posts: posts.map(p => ({
            ...p,
            postDate: p.postDate.toISOString()
        }))
    })
);

        renderPosts(posts, postContainer);

    } catch (error) {
        console.error("Error loading posts:", error);
    }
}

function renderPosts(posts, postContainer) {
    const html = posts.map(post => {
        const tags = post.tags
            ? `<p class="tags">${post.tags}</p>`
            : `<p class="tags"></p>`;

        return `
            <div class="post">
                <h1 class="title">${post.title}</h1>
                ${post.htmlContent}
                <div class="metadata">
                    <p>${post.postDate.toLocaleString()}</p>
                    ${tags}
                </div>
            </div>
        `;
    }).join("");

    postContainer.innerHTML = html;
    window.parent.postMessage(
        { type: "POSTS_DATA", posts },
        "*"
    );
}

export async function ask(message, username = "anon") {
    if (!message || !message.trim()) {
        console.error("Message is empty");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get("userId");

    if (!chatId) {
        console.error("userId not found in URL");
        return;
    }

    try {
        const messagesRef = collection(db, "asks", chatId, "messages");

        await addDoc(messagesRef, {
            username,
            message,
            createdAt: Date.now() 
        });

        console.log("Ask sent");
    } catch (error) {
        console.error("Error sending ask:", error);
    }
}

window.addEventListener("message", (event) => {
    if (event.data?.type !== "ASK_FUNCTION") return;

    const { message, username } = event.data.payload || {};

    ask(message, username);
});

window.onload = loadPosts;