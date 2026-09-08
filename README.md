# Gemini AI Chatbot

# Overview:
The Gemini AI Chatbot is a web-based chatbot interface that allows users to communicate with the Gemini AI model using text and file attachments. The chatbot provides a smooth typing effect, supports file uploads, and offers a theme toggle feature for a customizable user experience.

# Features:

. User-friendly chat interface

. Smooth typing effect for AI responses

. File attachment support (images & documents)

. Abort AI response functionality

. Delete all chat history

. Dark/Light theme toggle

. Mobile-friendly UI adjustments

# Technologies Used:

. JavaScript (ES6)

. HTML & CSS

. Google AI Gemini API(For API go to google AI for Developers site)

# Setup & Installation:

Clone the repository:git clone https://github.com/your-repo/gemini-ai-chatbot.git

Navigate to the project directory:

cd gemini-ai-chatbot

Open the project in a code editor (e.g., VS Code).

Open index.html in a browser to run the chatbot.

# API Integration:
The chatbot integrates with Google AI Gemini API to generate responses. Ensure you have a valid API key and update the following line in script.js: const API_KEY = "YOUR_API_KEY";

# Key Functionalities:

1. Handling User Messages

   .Users can type messages into the input field and submit them.

   .Messages are added to chat history and displayed in the chat container.

2. Typing Effect for AI Responses

   .AI responses are displayed with a smooth typing effect.

   .Uses setInterval to append words gradually to simulate typing.

3. Handling File Uploads

   .Supports image and document uploads.

   .Converts files to Base64 format and sends them along with messages.

Displays image previews for uploaded images.

4. Abort Ongoing Response

   .Users can stop AI responses mid-way using the Stop Response button.

   .Uses AbortController to terminate the API call.

5. Theme Toggle

   .Users can switch between dark and light modes.

The selected theme is saved in localStorage for persistence.

6. Delete Chat History

   .Allows users to clear all messages from the chat.

   .Resets chat history and updates the UI accordingly.

   .Usage Instructions

Type a message and press Enter to send.

   .Click the Add File button to attach images or documents.

   .Click the Stop Response button to cancel AI-generated responses.

   .Click Delete Chats to clear the conversation.

   .Toggle the theme using the Theme Toggle button.

# Credits:

Developed by Shalavi Rana using JavaScript and Google AI Gemini API.

# License:

This project is licensed under the MIT License. Feel free to modify and distribute it.
