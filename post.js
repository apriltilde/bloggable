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
        });
      } else {
        window.location.href = '/bloggable';
      }
    });
    
 
    var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean']
    ];

    // Initialize Quill with toolbar options
const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
  	syntax: true,
    toolbar: toolbarOptions,
    imageDrop: true,
    resize: {
      // set embed tags to capture resize
      embedTags: ["VIDEO", "IFRAME"],
      // custom toolbar
      tools: [
        "left",
        "center",
        "right",
        "full",
        "edit",
        {
          text: "Alt",
          attrs: {
            title: "Set image alt",
            class: "btn-alt",
          },
          verify(activeEle) {
            return activeEle && activeEle.tagName === "IMG";
          },
          handler(evt, button, activeEle) {
            let alt = activeEle.alt || "";
            alt = window.prompt("Alt for image", alt);
            if (alt == null) return;
            activeEle.setAttribute("alt", alt);
          },
        },
      ],
    },
  },
});

    
// Save content to local storage whenever Quill editor or textareas change
quill.on('text-change', saveContentToLocalStorage);
document.querySelector('textarea[name="name"]').addEventListener('input', saveContentToLocalStorage);
document.querySelector('textarea[name="tags"]').addEventListener('input', saveContentToLocalStorage);

// Function to save content to local storage
function saveContentToLocalStorage() {
    var htmlContent = document.querySelector('.ql-editor').innerHTML;
    var fileName = document.querySelector('textarea[name="name"]').value;
    var tags = document.querySelector('textarea[name="tags"]').value;

    localStorage.setItem('quillEditorContent', htmlContent);
    localStorage.setItem('fileName', fileName);
    localStorage.setItem('tags', tags);
}

// Retrieve and set the content from local storage when the page loads
window.addEventListener('load', function() {
    var savedContent = localStorage.getItem('quillEditorContent');
    var savedFileName = localStorage.getItem('fileName');
    var savedTags = localStorage.getItem('tags');

    if (savedContent) {
        quill.root.innerHTML = savedContent;
    }
    if (savedFileName) {
        document.querySelector('textarea[name="name"]').value = savedFileName;
    }
    if (savedTags) {
        document.querySelector('textarea[name="tags"]').value = savedTags;
    }
});


    // Event listener for upload button click
    document.getElementById('uploadButton').addEventListener('click', function() {
        document.getElementById('fileInput').click(); // Simulate click on file input
    });

    // Event listener for file input change
    document.getElementById('fileInput').addEventListener('change', function(event) {
        var file = event.target.files[0]; // Get the selected file
        if (file) {
            var reader = new FileReader();
            reader.onload = function(event) {
                var htmlContent = event.target.result; // Get the file content as HTML
                saveHtmlContent(htmlContent); // Save the HTML content
            };
            reader.readAsText(file); // Read the file as text
        }
    });

    // Event listener for save button click
    document.getElementById('saveButton').addEventListener('click', function() {
        // Get the HTML content from Quill
            // Get the value of the filename field
    var filename = document.querySelector('textarea[name="name"]').value.trim();
    
    // Check if the filename is empty
    if (filename === "") {
        alert("Filename is required. Please enter a name for the file.");
        return; // Stop further execution if filename is not provided
    }
        var htmlContent = document.querySelector('.ql-editor').innerHTML;
        globalThis.tags = document.querySelector('textarea[name="tags"]').value;
        uploadImagesAndProcessHTML(htmlContent)
    });

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function uploadImagesAndProcessHTML(htmlContent) {
    const dataUrlRegex = /data:(image\/\w+);base64,([A-Za-z0-9+/=]+)/g;
    let match;

    const formData = new FormData();

    function resizeImage(base64Data, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
            };

            img.src = "data:image/jpeg;base64," + base64Data;
        });
    }

    let fileIndex = 0;

    while ((match = dataUrlRegex.exec(htmlContent)) !== null) {
        const base64Data = match[2];
        const blob = await resizeImage(base64Data, 1200, 0.8);

        formData.append("fileToUpload[]", blob, `image${fileIndex++}.jpg`);
    }

    try {
        const response = await fetch("upload.php", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        let index = 0;
        htmlContent = htmlContent.replace(dataUrlRegex, () => data.urls[index++]);
    } catch (error) {
        console.error("Fetch error:", error);
    }

    saveHtmlContent(htmlContent, tags);
}


async function saveHtmlContent(htmlContent, tags = '') {
	        const userId = user.uid;
	        const userRef = await setDoc(doc(db, `blog/${username}/`), {
	            userId: userId,
	        })
	    const settingsRef = doc(db, `blog/${username}/data/settings`);

    // Check if the settings document exists
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
        // Add default settings if the document doesn't exist
        await setDoc(settingsRef, {
            dates: true,
            filext: ".txt",
            titles: true
        });
        console.log("Default settings added.");
    }



	const filename = document.querySelector('textarea[name="name"]').value + ".html";
	if (filename === "") {
	    alert("Filename required");
	} else {
		        // Add metadata to the HTML content
	    const metadata = `<!-- Original Post Date: ${new Date().toISOString()} -->\n`;
	    const metadataWithTags = `${metadata}<!-- Tags: ${tags} -->\n`;
	    const htmlContentWithMetadata = metadataWithTags + htmlContent;
	    if (user) {	        
	        const docRef = await setDoc(doc(db, `blog/${username}/posts/`, `${filename}`), {
	            htmlContent: htmlContentWithMetadata,
	            tags: tags,
	            createdAt: new Date()
	        })
	    quill.root.innerHTML = '';
	    localStorage.removeItem('quillEditorContent');
	    localStorage.removeItem('fileName');
        localStorage.removeItem('tags');
	    document.querySelector('textarea[name="tags"]').value = '';
	    document.querySelector('textarea[name="name"]').value = '';
	   	}
	}
}
