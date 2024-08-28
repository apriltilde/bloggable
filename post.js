import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
 import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
 import { getFirestore, collection, addDoc, setDoc, doc} from "https://www.gstatic.com/firebasejs/10.13/firebase-firestore.js";
 import { getAuth, onAuthStateChanged, setPersistence, signOut, browserLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js"; 
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
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        ['link', 'image'],
        ['clean']
    ];

    // Initialize Quill with toolbar options
    var quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: toolbarOptions
        }
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


async function uploadImagesAndProcessHTML(htmlContent) {
    const dataUrlRegex = /data:(image\/\w+);base64,([A-Za-z0-9+/=]+)/g;
    let match;
    const formData = new FormData();

    while ((match = dataUrlRegex.exec(htmlContent)) !== null) {
        const imageType = match[1];
        const base64Data = match[2];

        // Decode the base64 string to binary data
        const byteString = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }

        // Create a Blob from the binary data and specify it as a .jpg file
        const blob = new Blob([uint8Array], { type: `image/jpeg` });

        // Append the blob to formData with the appropriate file name
        formData.append('fileToUpload[]', blob, `image${formData.length + 1}.jpg`);
    }

    try {
        // Await the PHP backend to resolve
        const response = await fetch('upload.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Process the returned URLs
        let index = 0;
        htmlContent = htmlContent.replace(dataUrlRegex, () => data.urls[index++]);
        
    } catch (error) {
        console.error('Fetch error:', error);
    }
    saveHtmlContent(htmlContent, tags);
}




    
    
async function saveHtmlContent(htmlContent, tags = '') {
	        const userId = user.uid;
	        const userRef = await setDoc(doc(db, `blog/${username}/`), {
	            userId: userId,
	        })




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