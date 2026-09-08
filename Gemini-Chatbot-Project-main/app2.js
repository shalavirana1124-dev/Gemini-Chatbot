const promptForm = document.querySelector(".prompt-form");
const promptInput= document.querySelector(".prompt-input");
const chatsContainer = document.querySelector(".chats-container");
const container = document.querySelector(".container");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const themeToggle = document.querySelector("#theme-toggle-btn");

// For API go to google AI for Developers site
// API Setup
const API_KEY = "AIzaSyDP1DSHN3Tm-QE79Xw1CilFtxoua9ChK7c";
const API_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"];
const buildApiUrl = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

let typingInterval , controller;
const chatHistory = [];
const userData = { message: "", file: {} };/*
We need send attached file data to API to get response;
*/
// Function to create messsage elements
const createMsgElement = (content,...classes)=>{
    const div = document.createElement("div");
    div.classList.add("message",...classes);
    div.innerHTML = content;
    return div;
}
// Scroll to the bottom of the container
const scrollToBottom = ()=> container.scrollTo({top:container.scrollHeight, behavior:"smooth"});
/* How Above method works:

    container.scrollTo()
This method scrolls the container to a specific position.

    top: container.scrollHeight
container.scrollHeight represents the total height of the container, including the portion that is not visible due to scrolling.
Setting top to scrollHeight ensures that the container is scrolled to the very bottom.

    behavior: "smooth"
Enables a smooth scrolling animation instead of jumping instantly to the bottom.*/
// Simulate Typing Effect for bot responses

const typingEffect = (text,textElement,botMsgDiv)=>{
    textElement.textContent = "";
    const words = text.split(" ");/*The split() method in JavaScript is used to split a string into an array of words based on a specified delimiter (separator).The space (" ") is used as the separator, so the string is split into individual words.
    */
    let wordIndex = 0;

    // Set an Interval to type each  word
    typingInterval = setInterval(()=>{
        if(wordIndex<words.length){
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            scrollToBottom();
        }else{
            clearInterval(typingInterval);
            botMsgDiv.classList.remove("loading");
            document.body.classList.remove("bot-responding");
        }
    },40)
}
/*Explaination of above function how it work:

--> textElement.textContent = "";
Before starting the typing effect, the function clears any existing text from textElement.

-->  const words = text.split(" ");
    let wordIndex = 0;
The text is split into an array of words using .split(" "), which means each word becomes an individual element in the words array.
wordIndex keeps track of which word is currently being typed.

-->    const typingInterval = setInterval(() => {
The function uses setInterval() to display words one by one at a fixed time interval.

-->  if (wordIndex < words.length) {
    textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
    } else {
    clearInterval(typingInterval);
    }
Condition Check: if (wordIndex < words.length)
If there are more words to display, the function continues typing.
Appending Words One by One:
textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
If it's the first word (wordIndex === 0), it is added without a space.
Otherwise, a space is added before appending the next word.
Stopping the Interval: clearInterval(typingInterval);
Once all words are displayed, the interval is cleared to stop execution.
*/

// Make the API call and generate the bot's response
const generateResponse = async (botMsgDiv)=>{
    const textElement = botMsgDiv.querySelector(".message-text");
    // Attaching the controller to terminate the fetch request when "stop-response"
    // button is clicked.
    controller = new AbortController();//new AbortController() creates an AbortController object.
    /*
    AbortController is a built-in JavaScript API , which is used to control and abort asynchronous operations
    like fetch requests, event listeners, or other signals in JavaScript.
     */
    // Add user message and file data to the chat history.
    chatHistory.push({
        role: "user",
        parts: [
            { text: userData.message },
            ...(userData.file.data
                ? [{ inline_data: { data: userData.file.data, mime_type: userData.file.mime_type } }]
                : []
            )
        ]
    });/* This will include the attached file data along with the message in the chat history , aligned
        with Gemini required parameters. */
        try{
            if (!API_KEY || API_KEY.trim().length < 20) {
                throw new Error("Missing or invalid Gemini API key. Add a valid API key in app2.js.");
            }

            // Try preferred model first, then fallback.
            let data = null;
            let lastError = null;

            for (const model of API_MODELS) {
                const response = await fetch(buildApiUrl(model),{
                    method:"POST",
                    headers: {"Content-Type" : "application/json"},
                    body: JSON.stringify({ contents: chatHistory }),
                    signal: controller.signal //The AbortController object has a signal property (controller.signal)
                    // that can be passed to functions that support aborting.
                    // const signal = controller.signal; gets the signal that we pass to the fetch request.
                });

                data = await response.json();
                if (response.ok) {
                    break;
                }

                lastError = data?.error?.message || `Request failed with status ${response.status}.`;
                data = null;
            }

            if (!data) {
                throw new Error(lastError || "Unable to get response from Gemini API.");
            }

            const responseText = data?.candidates?.[0]?.content?.parts
                ?.map((part) => part.text || "")
                .join(" ")
                .replace(/\*\*([^*]+)\*\*/g, "$1")
                .trim();

            if (!responseText) {
                throw new Error("No text response received from Gemini. Check the Network tab for API details.");
            }

            //Process the response text and display with typing effect
            typingEffect(responseText,textElement,botMsgDiv);
    
            chatHistory.push({role: "model" , parts: [{ text: responseText }] });// Adding the model's response to chat history for better interaction.
    
            console.log(chatHistory);
        }
        catch(error){
            textElement.style.color = "#d62939";
            // We handle the cancellation using catch, checking for an AbortError.
            textElement.textContent = error.name === "AbortError" ? "Response generation stopped." : error.message;
            botMsgDiv.classList.remove("loading");
            document.body.classList.remove("bot-responding");
            scrollToBottom();
        }
        /* Clearing the file data once response is generated */
        finally{
            userData.file = {}; 
     }
}

promptForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    const userMessage = promptInput.value.trim();
    // if bot is still responding restrict the user from sending new message.
    if(!userMessage || document.body.classList.contains("bot-responding")) return ;

    promptInput.value = "";
    userData.message = userMessage; // Adding the user message in user data object.
    document.body.classList.add("bot-responding" , "chats-active");

    // Hiding the file preview once message is sent
    fileUploadWrapper.classList.remove("active",  "img-attached" , "file-attached"); 
    
    // Generate user message HTML with optional file attachment and add in the chats container.
    // Adding the attachment in the message whether its image or file.
    const userMsgHTML = `
    <p class="message-text"></p>
    ${userData.file.data ? 
        (userData.file.isImage 
            ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" />`
            : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.filename}</p>`
        ) : ""}`;

     const userMsgDiv = createMsgElement(userMsgHTML,"user-message");
    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    setTimeout(()=>{
    // Generate bot message HTML and add in the chats container after 600ms;
    const botMsgHTML = `<img src="gemini.svg" class="avatar"><p class="message-text">Just a sec...</p>`;
    const botMsgDiv = createMsgElement(botMsgHTML,"bot-message","loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
    },600);
})

// Handle File Input Change(File Upload)
fileInput.addEventListener("change",()=>{ /*The change event fires when the user selects a file.*/
    const file = fileInput.files[0]; /*files is a built-in property in JavaScript that belongs to the <input> element of type "file".
    fileInput.files[0] accesses the first selected file. 
    fileInput.files is a FileList (similar to an array) that contains selected files.
    Each file inside FileList is a File object with properties like:
    file.name       // Name of the file
    file.size       // Size in bytes
    file.type       // MIME type (e.g., "image/png", "application/pdf")
    file.lastModified // Timestamp of the last modification*/
    if(!file) return;

    const isImage = file.type.startsWith("image/");
    /*file.type: Stores the MIME type of the file (e.g., "image/png", "application/pdf").
    .startsWith("image/"): If the file type starts with "image/", it means the selected file is an image.
    Returns true for images like PNG, JPG, GIF.
    Returns false for non-image files like PDF, TXT. */
    const reader = new FileReader();
    reader.readAsDataURL(file);
    /*FileReader is a built-in JavaScript class that reads files.
    .readAsDataURL(file):Converts the file into a Base64 encoded string.
                         This is useful for previewing images before uploading them. */

    reader.onload = (e) => {/*The onload event fires when the file is fully read.
    e.target.result contains the Base64 representation of the file. */
        fileInput.value = "";
        const base64String = e.target.result.split(",")[1];
        //console.log("Base64 Image Data: ", base64String);

        fileUploadWrapper.querySelector(".file-preview").src  = e.target.result;
        /*fileInput.value = "":Clears the file input after selection.
    This allows users to re-select the same file if needed.
        Displaying Image Preview: Finds .file-preview inside .file-upload-wrapper.
        Sets src to e.target.result, displaying the selected image. */
        fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");

        // Store File data in user data object
        userData.file = { filename: file.name , data: base64String, mime_type: file.type , isImage};
    }
})

// Cancel File Upload
document.querySelector("#cancel-file-btn").addEventListener("click",()=>{
    // Clearing File Data once upload is cancelled
    userData.file = {}; 
    fileUploadWrapper.classList.remove("active",  "img-attached" , "file-attached");
})

// Stop ongoing bot response
document.querySelector("#stop-response-btn").addEventListener("click",()=>{
    // Clearing File Data once upload is cancelled
    userData.file = {}; 
    controller?.abort();  // If controller.abort() is called, the fetch request is canceled
    clearInterval(typingInterval);
    chatsContainer.querySelector(".bot-message.loading")?.classList.remove("loading");
    document.body.classList.remove("bot-responding");
})

// Delete all chats
document.querySelector("#delete-chats-btn").addEventListener("click",()=>{
    chatHistory.length = 0;
    chatsContainer.innerHTML = "";
    document.body.classList.remove("bot-responding" , "chats-active");
})

// Handle Suggestion Click
document.body.querySelectorAll(".suggestions-items").forEach(item => {
    item.addEventListener("click",()=>{
        promptInput.value = item.querySelector(".text").textContent;
        promptForm.dispatchEvent(new Event("submit"));
    });
});

// show/hide controls for mobile on prompt input focus

document.addEventListener("click", ({ target }) => {
    const wrapper = document.querySelector(".prompt-wrapper");
    const shouldHide = target.classList.contains("prompt-input") || (wrapper.classList.contains
    ("hide-controls") && (target.id === "add-file-btn" || target.id === "stop-response-btn"));
    wrapper.classList.toggle("hide-controls", shouldHide);
});

// Toggle dark/light theme
themeToggle.addEventListener("click",()=>{
   const isLightTheme =  document.body.classList.toggle("light-theme");
   localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
   themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";
});

// Set intial theme from local storage
const isLightTheme =  localStorage.getItem("themeColor") === "light_mode";
   document.body.classList.toggle("light-theme" , isLightTheme);
   themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";
   /*
   How the Theme Toggle Button Works (Brief Explanation):
   When the theme toggle button (#theme-toggle-btn) is clicked, an event listener triggers a function.

   document.body.classList.toggle("light-theme"): 
    adds or removes the "light-theme" class from <body>.
    This changes the appearance of the page based on CSS styles.(setting light-theme-colors)

   localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode") 
   stores the selected theme in the browser's local storage, 
   so it remains even after refreshing.(If isLightTheme is true, "light_mode" is stored. Otherwise, "dark_mode" is stored.)
   
   themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";
    Updates the button text to show the opposite mode (so the user knows what they can switch to).
   The button text updates dynamically to show "dark_mode" when in light mode and "light_mode" when in dark mode.

   const isLightTheme = localStorage.getItem("themeColor") === "light_mode"; // ie. themeToggle button text is light_mode (It means page appearence is Dark).
    document.body.classList.toggle("light-theme", isLightTheme);
    themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";

    localStorage.getItem("themeColor") === "light_mode" checks if "light_mode" was stored.
   If "light_mode" is found in local storage, the light-theme class is applied.
   The theme toggle button's text is set accordingly.
   
   
   
   
   
   */


promptForm.querySelector("#add-file-btn").addEventListener("click",()=> fileInput.click());/*When the #add-file-btn button is clicked, fileInput.click() opens the file selection dialog , allowing the user to choose a file. */
// We will trigger the file input click when add file button is clicked;
