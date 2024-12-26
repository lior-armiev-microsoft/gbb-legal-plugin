// Description: This file contains the code to run the task pane add-in.
// Dependencies: This file depends on the following files:
//   1. src/taskpane/taskpane.css

import { ask } from './Containers/aks.js'; 
import { summary } from './Containers/summary_selected.js';
import { document_summary } from './Containers/summary_document.js';

import { createNestablePublicClientApplication } from "@azure/msal-browser";

let pca = undefined;

fetch("assets/config.json")
  .then((res) => res.text())
  .then((text) => {
    console.log("Config: ", text);
    const config = JSON.parse(text);
    localStorage.setItem('pfendpoint', config['prompt-flow-endpoint']);
    localStorage.setItem('clientId', config['clientId']);
    localStorage.setItem('authority', config['authority']);    
   })
  .catch((e) => console.error(e));

Office.onReady(async (info) => {
  if (info.host === Office.HostType.Word) {
    document.getElementById("sideload-msg").style.display = "block"; 
    
    pca = await createNestablePublicClientApplication({
      auth: {
        clientId: localStorage.getItem('clientId'),
        authority: localStorage.getItem('authority'),
      },
    });

    getOpenAIResponseDemo(localStorage.getItem('pfendpoint')).then((result) =>
    {
      // write the name of the user based on the profile from SSO
      const name = localStorage.getItem("profile") ? JSON.parse(localStorage.getItem("profile")).displayName : "User";
      const welcomeMessage = document.getElementById("title-with-name");
      welcomeMessage.textContent = `Hello ${name}, ${welcomeMessage.textContent}`;
      console.log("Result: ", result);
      if (result != null) {
        setTimeout(() => {          
          document.getElementById("sideload-msg").style.display = "none";
          document.getElementById("app-body").style.display = "flex";
          document.getElementById("ask-button").onclick = ask;
          document.getElementById("index-doc-button").onclick = index_document;
          document.getElementById("fetchPolicyData").onclick = summary;
          document.getElementById("fetchSummaryData").onclick = document_summary;
          document.getElementById("reset-button").onclick = reset_cache;
        }, 1000);
      }
      else
      {
        showErrorMessage("An unexpected error occurred: " + result);
      }
    }).catch((error) => {
      console.error("Error messgae: " + error);
      showErrorMessage(error);
    })
    
  }
});

async function sso() {
  // Specify minimum scopes needed for the access token.
  const tokenRequest = {
    scopes: ["User.Read", "openid", "profile"],
  };
  let accessToken = null;

  try {
    console.log("Trying to acquire token silently...");
    const userAccount = await pca.acquireTokenSilent(tokenRequest);
    console.log("Acquired token silently.");
    accessToken = userAccount.accessToken;
  } catch (error) {
    console.log(`Unable to acquire token silently: ${error}`);
  }

  if (accessToken === null) {
    // Acquire token silent failure. Send an interactive request via popup.
    try {
      console.log("Trying to acquire token interactively...");
      const userAccount = await pca.acquireTokenPopup(tokenRequest);
      console.log("Acquired token interactively.");
      accessToken = userAccount.accessToken;
    } catch (popupError) {
      // Acquire token interactive failure.
      console.log(`Unable to acquire token interactively: ${popupError}`);
    }
  }

  // Log error if both silent and popup requests failed.
  if (accessToken === null) {
    console.error(`Unable to acquire access token.`);
    return;
  }

  // Call the Microsoft Graph API with the access token.
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/memberOf?$select=displayName,id,description,mail,mailNickName,userPrincipalName`,
    {
      headers: { Authorization: accessToken },
    }
  );

  const response_profile = await fetch(
    `https://graph.microsoft.com/v1.0/me`,
    {
      headers: { Authorization: accessToken },
    }
  );


  if (response.ok && response_profile.ok) {
    // Write file names to the console.
    const me = await response_profile.json();
    // save to global variable for later use
    localStorage.setItem('profile', JSON.stringify(me));
    console.log("Profile: ", me);

    const data = await response.json();
    const groups = data.value.map((item) => item.id);
    localStorage.setItem('groups', JSON.stringify(groups));
    console.log("Groups: ", groups);
  }

  }

function showErrorMessage(message) {
  const sideloadMsg = document.getElementById("sideload-msg");

  // Update the content of the sideload message
  sideloadMsg.innerHTML = `<h1>There  been a connection check error</h1><p>The following error occurred: </p><p>${message}</p>`;

  // Style the error message
  sideloadMsg.style.display = "block";
  sideloadMsg.style.backgroundColor = "#ffffff";
  sideloadMsg.style.padding = "10px";
  sideloadMsg.style.border = "1px solid #f5c6cb";
  sideloadMsg.style.borderRadius = "5px";

  // hide after 5 seconds
  setTimeout(() => {
    sideloadMsg.style.display = "none";
  }, 5000);

}


export async function reset_cache() {
  localStorage.removeItem('FullSummaryData');
  showSuccessMessage("Cache has been reset successfully");
}


// Index document function - Demo now but will be implemented in the future with Azure Search, Prompt Flow
export async function index_document() {
  // sleep to 2 seconds
  document.getElementById("index-doc-spinner").style.display = "flex";
  await new Promise(r => setTimeout(r, 2000));
  document.getElementById("index-doc-spinner").style.display = "none";
  
  // chnage the conainter index-doc-container style to display none
  var reviewcontainerDiv = document.getElementById("index-doc-container");
  reviewcontainerDiv.style.display = "none";

  showSuccessMessage("Document has been indexed successfully");
}

// Function to display a success message on the top ribbon
function showSuccessMessage(message) {
  const ribbon = document.querySelector('.warning-ribbon');
  const ribbonText = document.getElementById('ribbon-text');

  ribbonText.textContent = message;

  ribbon.style.display = "block";
  ribbon.classList.add("fade-in");
  ribbon.classList.remove("fade-out");
  setTimeout(() => {
    ribbon.classList.remove("fade-in");
    ribbon.classList.add("fade-out");
  }, 2000); 
  setTimeout(() => {
    ribbon.style.display = "none";
  }, 3000); 
  
}

async function getOpenAIResponseDemo(pfuri)
{
  // run sso function
  if (localStorage.getItem('profile') == null && localStorage.getItem('groups') == null)
    {
      try {
        await sso();
      }
      catch (error) {
        return error;
      }
    }
    else
    {
      console.log("Profile already exists");
      console.log("Profile: ", JSON.parse(localStorage.getItem('profile')));
      console.log("Groups: ", JSON.parse(localStorage.getItem('groups')));
      
    }
  
  const uri = new URL(pfuri).origin
  return "Success";
}

// action on change of language-select
document.getElementById("language-select").onchange = function() {
  var lang = document.getElementById("language-select").value;
  localStorage.setItem('language', lang);
  console.log("Language: ", lang);
}