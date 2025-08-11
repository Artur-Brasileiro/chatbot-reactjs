# AI Chatbot Project Setup Guide

Please follow these steps to run your Chabot project without any errors:

## Get Your free API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Navigate to the API key section and create a new API key. It's free!

Your API key will look something like this: AIzaSyAtpnKGX13bTgmx0l_gQeatYvdWvY_wOTQ

## Insert Your API Key

1. Open your project folder in VS Code.
2. Locate the `.env` file in your project.
3. Find the `VITE_API_URL` variable and replace `YOUR-API-KEY-HERE` with your actual API key.

## Save and Test

1. Save the `.env` file after adding your API key.
2. Open the VS Code terminal by pressing `Ctrl + J` and run the following commands:
   `npm install` This command will install the necessary dependencies.
   `npm run dev` This command will start the local development server.

Click on the `localhost` link that appears in the terminal to open the project in your browser.

## Customization Tips

I've added dummy data for testing in `src/components/companyInfo.js`. You can replace it with your own data if you'd like. But if you want the chatbot to work and respond to all your queries without any data input, here's what to do:

Open the `src/App.jsx` and `src/components/ChatForm.jsx` files and make the following updates:

```javascript
// Line 10 (App.jsx)
const [chatHistory, setChatHistory] = useState([]);

// Line 40 (ChatForm.jsx)
generateBotResponse([...chatHistory, { role: "user", text: userMessage }]);
```

## Important Information

This chatbot uses the Gemini beta model, gemini-1.5-flash, which allows more free requests within a shorter timeframe. If you need greater reliability, you can switch to the stable model, gemini-1.5-pro. While the free version of this model has stricter request limits, upgrading to a paid plan will remove these restrictions.

To switch to the gemini-1.5-pro stable model, update the VITE_API_URL in the `.env` file as follows:
VITE_API_URL = https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=YOUR-API-KEY-HERE

If you still get an error or get stuck, feel free to message me on Buy Me a Coffee.
https://buymeacoffee.com/codingnepal

---

Happy coding!
