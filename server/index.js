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
const TRAINED_URL =
  "https://kg.hybrid.chat/api/chat?pinecone_name_space=document-pQc007";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function makeRequest(handler, method, url, data = null) {
  try {
    let response;

    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
    };

    if (method.toLowerCase() === "post") {
      response = await handler.axiosInstance.post(url, data, { headers });
    } else if (method.toLowerCase() === "get") {
      response = await handler.axiosInstance.get(url);
    } else {
      throw new Error("Unsupported request method");
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error in makeRequest (${method}):`, error.message);
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
    };
  }
}

export const ChatBotStep = ({ chatBotId, tokenUser, answer, handler }) => [
  // {
  //     id: 0,
  //     inputType: 'text',
  //     question: `
  // Welcome to Hybrid.Chat Enterprise Search Chatbot!

  // I'm here to assist you with your document-related queries.

  // Whether you need help finding information, understanding content, or navigating through documents, just ask away.
  // `,
  //     callBack: async (event, response) => {
  //       // actual processing
  //     }
  // }

  {
    id: 0,
    inputType: "await",
    question:
      "Welcome to Hybrid.Chat Enterprise Search Chatbot! I'm here to assist you with your document-related queries.",
    callBack: (event, response) => {
      return { nextStep: 1, toast: "", error: false, hideAnswer: true };
    },
  },
  {
    id: 1,
    inputType: "await",
    question:
      "Whether you need help finding information, understanding content, or navigating through documents, just ask away.",
    callBack: (event, response) => {
      return { nextStep: 2, toast: "", error: false, hideAnswer: true };
    },
  },
  {
    id: 2,
    inputType: "text",
    question: "Let's get started!",
    callBack: async (event, response) => {
      try {
        const userData = await event.user.getUserData()[0];
        const intentPrompt = `{ 
          "action": "Identify User Intent", 
          "instructions": "Carefully review the user's input to discern their underlying intent. Determine the primary purpose of their message to guide an appropriate and effective response. When giving response keep the personna and give response like human remove all AI tones, remove starting like 'The user is asking for a brief explanation of the previous response.'",
          "userResponse": ${response},
          "previousResponse": ${userData?.last_response}
           "persona": { 
            "tone": "Attentive and perceptive", 
            "style": "Analytical and supportive, focusing on accurately understanding and addressing the user's needs", 
            "purpose": "To grasp the core of the user's message, ensuring the response is both relevant and tailored to their specific intent" }, 
            "fallback": "If the user's intent is ambiguous or unclear or there is any typo in user response or user asking for 'Combination format' respond with 'I want to ensure I'm providing the most helpful response. Could you please elaborate a bit more on what you're looking for?'", 
            "outputType": "JSON", 
            "flag": "if user is asking related to HRtech, Hiring and recruitment, upskilling and career space, work life balance, job searching and technical related queries give true if not give false",
            "gptResponse": "If user asking question not related to HR expert, upskilling, job searching and work life balance then this will be the intent"
            "InfoSeeking": "The user is seeking information related to HR expert, upskilling, job searching and work life balance."
            "ProblemSolving": "The user is seeking information related to HR expert, upskilling, job searching and work life balance.",
            "Casual": "The user is engaging in light, conversational interaction without a specific informational or problem-solving purpose." 
          }, 
            "output": { 
              "flag" : "if user is asking related to HRtech, Hiring and recruitment, upskilling and career space, work life balance, job searching and technical  give true if not give false",
              "intent": "The identified intent based on the user's input, categorized as "gptRespopnse",'InfoSeeking', 'ProblemSolving', 'Casual' or 'Follow-up', Only return 'Follow-up' intent if there is clear similarity with prevoiusResponse or user is asking based on last response, like brief the sentance, explain the above, etc", 
              "message": "If the intent is 'Follow-up,' respond with a brief and concise summary or explanation based on the previous response or information provided. if the intent is gpt Response then we have to generate answer from chatgpt"
            } 
          }`;
        const gpt_response_intent = await processUserResponse(intentPrompt);
        console.log("gpt response", gpt_response_intent);
        const contentObject = JSON.parse(gpt_response_intent.content);
        if (
          contentObject?.intent === "Casual" ||
          contentObject?.output?.intent === "Casual"
        ) {
          const message =
            contentObject?.message || contentObject?.output?.intent;
          return {
            nextStep: 2,
            toast: `${message}`,
            error: true,
            hideAnswer: false,
          };
        }
        if (
          contentObject?.intent === "ProblemSolving" ||
          contentObject?.intent === "InfoSeeking" ||
          contentObject?.output?.intent === "ProblemSolving" ||
          contentObject?.output?.intent === "InfoSeeking"
        ) {
          let res = await sendRequest(event, response);
          userData["last_response"] = res;
          event.user.setUserData(userData);
          res = res.replace(/^\*\*Answer\*\*::\s*/, "");
          console.log("flag:::", contentObject?.flag);
          if (
            /^while I can't help/i.test(res) &&
            (contentObject?.flag === true ||
              contentObject?.output?.flag === true)
          ) {
            const message =
              contentObject?.message || contentObject?.output?.message;
            return {
              nextStep: 2,
              toast: `${message}`,
              error: true,
              hideAnswer: false,
            };
          }
          return {
            nextStep: 2,
            toast: `${res}`,
            error: true,
            hideAnswer: false,
          };
        }
        if (
          contentObject?.intent === "Follow-up" ||
          contentObject?.output?.intent === "Follow-up"
        ) {
          console.log("message", contentObject);
          const message =
            contentObject?.message || contentObject?.output?.message;
          console.log("message", message);
          return {
            nextStep: 2,
            toast: `${message}`,
            error: true,
            hideAnswer: false,
          };
        } else {
          const message =
            contentObject?.message || contentObject?.output?.message;
          return {
            nextStep: 2,
            toast: `${message}`,
            error: true,
            hideAnswer: false,
          };
        }
      } catch (err) {
        console.log(err);
        return {
          nextStep: 2,
          toast: "Oops! something went wrong",
          error: true,
          hideAnswer: true,
        };
      }
    },
  },
];

const sendRequest = async (handler, question) => {
  const body = {
    history: [],
    question,
    session: handler.user.sessionId,
  };
  try {
    const response = await axios.post(TRAINED_URL, body);
    return response.data.text;
  } catch (err) {
    console.log("eror", err);
    throw err;
  }
};

const processUserResponse = async (prompt) => {
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

export const handleRequest = async (
  handler,
  endpoint,
  method = "POST",
  data = {}
) => {
  try {
    const response = await handler.axiosInstance({
      method,
      url: endpoint,
      data,
    });
    return response.data;
  } catch (error) {
    console.error("Error during request:", error);
    throw error;
  }
};

export const insertUserData = (handler, step, answer, summary = true) => {
  const currentStep = ChatBotStep().find((item) => item.id == step);
  const obj = {
    key: currentStep.mongo_key,
    category_id: currentStep.header?.step,
    category_description: currentStep.header?.text,
    inputType: currentStep.inputType,
    answer,
    summary,
  };

  handler.user.setUserData(obj);
};

export const insertUserDataWithKey = (
  handler,
  key,
  answer,
  inputType,
  summary = true
) => {
  const obj = {
    key,
    answer,
    inputType,
    summary,
  };

  handler.user.setUserData(obj);
};

export const start = async (handler, question) => {
  const { chatBotId, headers, axiosInstance, user, chain } = handler;
  let tokenUser = {};

  if (conversational) {
    const token = headers?.authorization || "";
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = token;
      try {
        const res = await axiosInstance.get(openid.userinfo_endpoint);
        tokenUser = res.data;
      } catch (error) {}
    }

    let currentStep = await user.getlastStep();
    let answ = ChatBotStep({ chatBotId, tokenUser, handler }).find(
      (item) => item.id == currentStep
    );

    if (answ === undefined) {
      return {
        text: "Chatbot flow ended!",
        hideAnswer: true,
        currentStep: { inputHidden: true },
        src: "talkingDb",
      };
    }

    if (answ.preHook) {
      const { nextStep, error } = await answ.preHook(handler, question);
      if (error === false) {
        user.setlastStep(nextStep);
        return await start(handler, question);
      }
    }

    if (!user.getData("firstCall")?.answer) {
      insertUserDataWithKey(handler, "firstCall", "true", "text", false);
      await user.save();
      if (answ.inputType === "await") {
        answ["await"] = 1000;
      }
      return {
        text: answ.question,
        src: "talkingDb",
        currentStep: answ,
        hideAnswer: false,
      };
    }

    if (answ.callBack) {
      const { nextStep, toast, error, hideAnswer, answer } =
        await answ.callBack(handler, question);
      user.setlastStep(nextStep);
      await user.save();

      answ = ChatBotStep({ chatBotId, tokenUser, answer }).find(
        (item) => item.id == nextStep
      );

      if (answ === undefined) {
        return {
          text: "Chatbot flow ended!",
          currentStep: { inputHidden: true },
          src: "talkingDb",
        };
      }

      if (answ.apiCall) {
        answ.options = await answ.apiResult(handler);
      }

      if (answ.inputType === "summary") {
        answ["data"] = user.getUserData();
      }

      if (answ.inputType === "await") {
        answ["await"] = 1000;
      }

      if (error) {
        const clonedObject = JSON.parse(JSON.stringify(answ));
        clonedObject["answer"] = question;

        if (answ.inputType === "fileUploader") {
          const { fileName, imageData } = JSON.parse(question);
          clonedObject["answer"] = fileName;
          clonedObject["showQuestion"] = true;
          delete clonedObject.header;
        }

        if (answ.inputType === "googleLogin") {
          clonedObject["answer"] = JSON.parse(question).email;
          clonedObject["showQuestion"] = true;
        }

        answ = clonedObject;
      }

      if (answ.header) {
        answ["update"] = true;
      }

      return {
        text: answ.question,
        src: "talkingDb",
        currentStep: answ,
        error,
        errorMessage: toast || "",
        hideAnswer: hideAnswer || false,
      };
    }

    return {
      text: answ.question,
      src: "talkingDb",
      currentStep: answ,
      error,
      errorMessage: toast || "",
      hideAnswer: hideAnswer || false,
    };
  } else {
    const response = await chain.run(question);
    return response;
  }
};
