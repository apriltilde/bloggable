import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, query, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

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

    extractAndDisplayTags();

    window.parent.postMessage(
        { type: "POSTS_DATA", posts },
        "*"
    );
}
// Tag extraction (unchanged but slightly safer)
function extractAndDisplayTags() {
    const posts = document.querySelectorAll(".post");
    const tagsSet = new Set();

    posts.forEach(post => {
        const tagsElement = post.querySelector(".tags");
        if (!tagsElement) return;

        tagsElement.textContent
            .trim()
            .split(" ")
            .forEach(tag => {
                if (tag) tagsSet.add(tag.trim());
            });
    });

    const tagsDiv = document.getElementById("tags");
    tagsDiv.innerHTML = "<br>";

    tagsSet.forEach(tag => {
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = tag;
        a.className = "tag-link";
        a.onclick = () => filterPostsByTag(tag);

        tagsDiv.appendChild(a);
        tagsDiv.appendChild(document.createTextNode(" "));
    });
}

function filterPostsByTag(tag) {
    const posts = document.querySelectorAll(".post");

    posts.forEach(post => {
        const tagsText = post.querySelector(".tags")?.textContent || "";
        const tags = tagsText.toLowerCase().split(" ");

        post.style.display =
            tags.includes(tag.toLowerCase()) || tag === ""
                ? "block"
                : "none";
    });
}

// Toggle order
document.getElementById("oldestfirst").addEventListener("click", (e) => {
    e.preventDefault();

    const container = document.getElementById("postcontainer");
    container.style.flexDirection =
        container.style.flexDirection === "column-reverse"
            ? "column"
            : "column-reverse";
});

// CSS override listener
window.addEventListener('message', (event) => {
    if (!event.data.cssUrl) return;

    const id = "dynamic-css";

    document.getElementById(id)?.remove();

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = event.data.cssUrl;
    link.id = id;

    document.head.appendChild(link);
});

// Init
window.onload = loadPosts;
