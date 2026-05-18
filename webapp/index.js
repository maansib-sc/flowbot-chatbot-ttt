export const openid = {
    authorization_endpoint: '',
    token_endpoint: '',
    userinfo_endpoint: '',
    scopes_supported: ['openid', 'profile', 'email'],
    client_id: '',
    realm: '',
  };
  
  export const getTitle = 'Enterprise Search';
  export const getWelcomeMessage = "I am an Assistant. I'll assist you with any queries";
  export const getInputPlaceholder = 'Type Response to Formy Here';
  
  export const sendIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M15.1886 2.6486C15.7796 2.49661 16.2951 3.07657 16.0748 3.6457L11.5748 15.2706C11.3817 15.7694 10.7435 15.9115 10.357 15.5418L7.82037 13.1155L6.91857 14.0173C6.44138 14.4946 5.62545 14.1566 5.62545 13.4818V11.016L1.73206 7.29191C1.30702 6.88535 1.49405 6.17004 2.06369 6.02357L15.1886 2.6486ZM13.6024 5.87761L7.60392 10.8328L10.5817 13.681L13.6024 5.87761ZM12.419 4.90956L3.74367 7.14035L6.51252 9.7888L12.419 4.90956Z" fill="white"/>
  </svg>
  `;
  
  export const themeColor = 'var(--blue-100, #eaa0a2)';
  export const Navbar = true;
  export const botName = 'James Bot';
  export const enabled = true;
  export const showUserResponseFirst= true;
  export const hideEditButton = true;
  
  export const leftPanelHtml = `
    <style>
    </style>
    <div>
    </div>
  `;
  
  export const handleLeftPanel = (f, d) => {
    if (f === 'toggle') {
      const cardId = d;
      const content = document.getElementById(cardId + '-content');
      content.classList.toggle('active');
    }
  };

  
  export const headerPaneHtml = `
  <div style="display: flex; width: 100%; align-items: center; gap: 8px; justify-content: space-between; ">
  <span style="color: #3a4664;font-size: 18px;font-weight: 500;font-family: Aspekta;">Enterprise Search</span>
</div>
  `;


export const handleHeaderPane = (f) => {
    if (f === 'logout') {
      localStorage.removeItem('access_token');
      window.location.reload();
    }
  
    if (f === 'login') {
      setTimeout(() => {
        const logout = document.getElementById('logout-btn');
        logout && logout.classList.add('active');
        const prompt = document.getElementById('prompt-btn');
        prompt && prompt.classList.add('active');
        const publish = document.getElementById('publish-btn');
        publish && publish.classList.add('active');
      }, 5000);
    }
  };
  
  
  export const leftPanelStateUpdate = stepIndex => {
    stepIndex = stepIndex - 1;
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
      step.classList.remove('completed', 'active', 'upcoming');
      if (index < stepIndex) {
        step.classList.add('completed');
      } else if (index === stepIndex) {
        step.classList.add('active');
      } else {
        step.classList.add('upcoming');
      }
    });
  };
  
  export const showUserEnteredPassword = false;
  export const finalMessage = 'Thanks for the provided information';
  export const conversational = true;

  export const loaderEnabled = true;
  export const drawerEnabled = true;
  export const referenceDocumentViewEnabled = true;
  

  export const editButtonColor= "#3a4664";

  export const trainedChatbotUrl= "https://llm-connect.kg.hybrid.chat/data/list?chatbot_id=document-pQc007";
  export const trainedChatbotProgressUrl= "https://llm-connect.kg.hybrid.chat/data/progress?file_name=";
  export const documentUploadUrl = "https://llm-connect.kg.hybrid.chat/data/upload?chatbot_id=document-pQc007";
  export const trainedChatbotId = "pQc007";
  export const trainedChatbotAPIKey= "rooifQWjo8wH4uwvSYtWtUiXavzhjbXe";

  export const chatbotIcon= `
  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
  width="35" height="35" viewBox="0 0 48.000000 48.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,48.000000) scale(0.100000,-0.100000)"
fill="#3a4664" stroke="none">
<path d="M128 447 c-14 -13 -29 -30 -34 -38 -5 -8 -21 -20 -37 -27 -35 -15
-51 -55 -38 -94 7 -20 6 -35 -3 -54 -28 -53 10 -100 74 -91 28 4 40 1 40 -7 0
-13 -22 -87 -35 -118 -6 -14 -2 -18 17 -18 22 0 27 8 43 59 13 43 24 62 42 70
13 6 26 19 30 28 3 10 13 26 20 35 14 15 18 15 59 -3 42 -17 47 -18 85 -2 23
9 38 21 35 28 -2 6 0 18 6 26 8 11 9 10 4 -4 -3 -11 -2 -16 4 -12 6 3 10 29
10 56 0 62 -31 126 -67 140 -35 13 -40 5 -5 -10 16 -7 28 -20 29 -32 1 -12 -2
-17 -9 -13 -7 4 -8 2 -4 -5 4 -6 11 -9 16 -6 21 13 22 -63 2 -109 -23 -52 -54
-66 -102 -46 -31 13 -37 24 -20 35 23 14 44 73 45 127 l1 57 -47 25 c-62 34
-126 35 -161 3z m112 -22 c0 -3 -10 -20 -22 -38 -13 -18 -24 -33 -24 -35 -1
-2 -14 8 -28 21 -27 25 -24 36 14 50 20 7 60 8 60 2z m-175 -195 c3 -5 17 -10
31 -10 21 0 25 -4 22 -22 -6 -47 -78 -30 -78 18 0 24 14 32 25 14z"/>
</g>
</svg>
`;