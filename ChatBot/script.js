const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store the user's message
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with the passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent =
        className === "outgoing"
            ? `<p></p>`
            : `<img src="./assets/robo.png" width="30" alt="Chat"><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
};

const generateResponse = (chatElement, userInput) => {
    const messageElement = chatElement.querySelector("p");
    const synth = window.speechSynthesis;
    const voices = [];

    // Function to speak a text
    const speakText = (text) => {
        const toSpeak = new SpeechSynthesisUtterance(text);
        voices.forEach((voice) => {
            if (voice.name) {
                toSpeak.voice = voice;
            }
        });
        synth.speak(toSpeak);
    };

    // Send POST request to API, get a response, and set the response as paragraph text
    fetch("./ChatBot/intents.json")
        .then((res) => res.json())
        .then((intents) => {
            let answerFound = false;
            let responseIndex;

            // Iterates over intents and patterns to find a matching answer to the user's question
            intents.intents.forEach((intent) => {
                intent.patterns.forEach((pattern, index) => {
                    if (userInput.includes(pattern)) {
                            answerFound = true;
                            responseIndex = index < intent.responses.length ? index : 0;
                            messageElement.textContent = intent.responses[responseIndex];
                                speakText(intent.responses[responseIndex]);
                                chatbox.scrollTo(0, chatbox.scrollHeight); // Scroll to bottom
                    } 
                });

                // If no response is found, display a default message
                if (!answerFound) {
                    messageElement.textContent =
                        "Desculpe, não entendi a sua pergunta. Digite novamente!";
                        speakText(messageElement.textContent);
                        chatbox.scrollTo(0, chatbox.scrollHeight); // Scroll to bottom
                }

                });
        
        });
};

const handleChat = () => {
    userMessage = chatInput.value.trim().toLowerCase(); // Get the user-entered message and remove extra whitespace
    if (!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight); // Scroll to bottom

    setTimeout(() => {
        // Display "Procurando pela sua resposta..." message while waiting for the response
        const incomingChatLi = createChatLi(
            "Procurado pela sua resposta...",
            "incoming"
        );
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight); // Scroll to bottom
        generateResponse(incomingChatLi, userMessage);
    }, 600);
};

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If the Enter key is pressed without the Shift key and the window
    // width is greater than 800px, handle the chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

const speakIntroduction = () => {
    const introMessage =
        "Olá, sou a assistente virtual da EcoFort.\nComo eu posso te ajudar hoje?";
    const synth = window.speechSynthesis;
    const toSpeak = new SpeechSynthesisUtterance(introMessage);
    const voices = [];

    voices.forEach((voice) => {
        if (voice.name) {
            toSpeak.voice = voice;
        }
    });

    synth.speak(toSpeak);
};

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => {
    document.body.classList.remove("show-chatbot");
});
chatbotToggler.addEventListener("click", () => {
    const body = document.body;
    const isChatbotShown = body.classList.toggle("show-chatbot");

    // Speak the introduction only when the chat is being open
    if (isChatbotShown) {
        speakIntroduction();
    }
});
