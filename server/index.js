const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({
  path: path.join(__dirname, "../../configuration/flowbot-chatbot-ttt/server/.env")
});


export const conversational = true;
export const pollingInterval = 400;

export const openid = {
  authorization_endpoint: "",
  token_endpoint: "",
  userinfo_endpoint: "",
  scopes_supported: ["openid", "profile", "email"],
  client_id: "",
  realm: "",
};

const GPT_BEARER_TOKEN = process?.env?.GPT_BEARER_TOKEN;
const TTT_URL = process?.env?.TTT_URL;
const MAX_RESULTS_FROM_TTT_PER_REQUEST = 5

const sendRequest = async (handler, question) => {
  try {
    let graphIds = handler?.user?.graphIds

    // TODO:: REMOVE hardcoded
    // we are hardcoding a graph id here as it is not attached yet in handler
    graphIds = ["graph::adfcf9df54fc458093dee75cc479a38f"]
    const requestBody = {
      "graph_ids": graphIds,
      "text": question,
      "max_results": MAX_RESULTS_FROM_TTT_PER_REQUEST
    }
    
    const response = await axios.post(
      TTT_URL,
      requestBody,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${handler?.user?.sessionId}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    const relevantElements = response?.data?.elements || []
    if (relevantElements?.length > 0) {
      const contents = relevantElements.map(item => item?.content).filter(content => typeof content === 'string' && content.trim());
      return contents
    } else {
      console.log("didn't find any relevant contents")
      return []
    }
  } catch (err) {
    console.error("TTT request failed", {
      message: err?.message,
      status: err?.response?.status,
      responseData: err?.response?.data
    });
    return []
  }
};

const responseGenerationPrompt = (userQuery, documentContents) => {
  return `
    Answer the user's question using the provided relevant contents separated by comma.

    Question:
    ${userQuery}

    Relevant contents:
    ${documentContents}

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

    return structuredData?.content;
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
  const tttResponse = await sendRequest(handler,question)

  let finalResponse = ""
  // preparing response for the user by using the relevant content retrieved
  if (tttResponse && tttResponse?.length > 0) {
    const responsePrompt = responseGenerationPrompt(question, tttResponse)
    finalResponse = await refineBotResponse(responsePrompt)
  }
  
  // default fallback message
  if (!finalResponse || finalResponse == "") {
    finalResponse = "Sorry, I don't have an answer for that."
  }

  return {
    text: String(finalResponse),
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