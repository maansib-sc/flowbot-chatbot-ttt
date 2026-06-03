const axios = require("axios");

export const conversational = true;
export const openid = {
  authorization_endpoint: "",
  token_endpoint: "",
  userinfo_endpoint: "",
  scopes_supported: ["openid", "profile", "email"],
  client_id: "",
  realm: "",
};

const GPT_BEARER_TOKEN = process.env.GPT_BEARER_TOKEN;
const TTT_URL = process.env.TTT_URL;

const sendRequest = async (handler, question) => {
  try {
    const response = await axios.get(TTT_URL);
    if (response.status === 200) {
          return response.data;
    } else {
      return "non reachable";
    }
  } catch (err) {
    console.log("Error during sendRequest");
    return "The TTT is not reachable"
  }
};

const responseGenerationPrompt = (userQuery, documentContent) => {
  return `
    Answer the user's question using the provided relevant content.

    Question:
    ${userQuery}

    Relevant content:
    ${documentContent}

    If the relevant content does not contain any hints to the answer, say "Sorry, I don't have an answer for that."
  `;
}

const refineBotResponse = async (prompt) => {
  try {
    const url = "https://api.openai.com/v1/chat/completions";
    const body = {
      model: "gpt-4",
      temperature: 0.4,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GPT_BEARER_TOKEN}`,
    };

    const response = await axios.post(url, body, { headers });
    const structuredData = response.data.choices[0].message;

    return structuredData?.text?.content;
  } catch (error) {
    console.error("Error in ChatGPT Request:", error?.response?.data);
    return false;
  }
};

export const start = async (handler, question) => {
  if (!question || !question.trim()) {
    return {
      text: "",
      src: "talkingDb",
      currentStep: null,
      hideAnswer: true,
    };
  }

  // getting the query relevant content from document trained;
  let tttResponse = await sendRequest(handler,question)

  // preparing response for the user by using the relevant content retrieved
  let responsePrompt = responseGenerationPrompt(question, tttResponse)
  let finalResponse = await refineBotResponse(responsePrompt)
  if (!finalResponse) {
    finalResponse = "Sorry, I don't have an answer for that."
  }
  
  return {
    text: finalResponse,
    src: "talkingDb",
    currentStep: {
      id: 1,
      question: question,
      inputType: "text",
      options: [],
    },
    error: false,
    errorMessage: "",
    hideAnswer: false,
  };
};