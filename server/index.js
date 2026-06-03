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

    return structuredData;
  } catch (error) {
    console.error("Error in ChatGPT Request:", error?.response?.data);
    return "Error in ChatGPT Request";
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
  let tttResponse = await sendRequest(handler,question)
  return {
    text: tttResponse,
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