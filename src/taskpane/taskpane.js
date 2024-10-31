import { ask } from './Containers/aks.js'; 
import { summary } from './Containers/summary_selected.js';
import { document_summary } from './Containers/summary_document.js';

fetch("assets/config.json")
  .then((res) => res.text())
  .then((text) => {
    console.log("Config: ", text);
    const config = JSON.parse(text);
    localStorage.setItem('azureOpenAIEndpoint', config['azure-openai-endpoint']);
    localStorage.setItem('azureOpenAIKey', config['azure-openai-key']);
    localStorage.setItem('azureOpenAIModelName', config['azure-openai-model']);
    localStorage.setItem('azureOpenAIModelVersion', config['azure-openai-api-version']);
    localStorage.setItem('azureOpenAIEmbeddingModelName', config['azure-openai-model-embedding']);
    localStorage.setItem('azureSearchEndpoint', config['azure-search-endpoint']);
    localStorage.setItem('azureSearchKey', config['azure-seasrch-key']);
    localStorage.setItem('azureSearchIndexName', config['azure-search-index']);
    localStorage.setItem('azurePromptAsk', config['azure-prompt-ask']);
    localStorage.setItem('azurePromptComplince', config['azure-prompt-complinace']);
    localStorage.setItem('azureSearchAPIVersion', config['azure-search-api-version']);
    localStorage.setItem('azureOpenAIAskMaxTokens', config['azure-openai-ask-max-tokens']);
    localStorage.setItem('azureOpenAIComplinaceMaxTokens', config['azure-openai-complinace-max-tokens']);
   })
  .catch((e) => console.error(e));

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    document.getElementById("sideload-msg").style.display = "block";    
    getOpenAIResponseDemo('1','',1).then((result) =>
    {
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



// temporary function to set disabled the Demo version is on
async function getOpenAIResponse(prompt,text,max_tokens) {
  const azureOpenAIEndpoint = localStorage.getItem('azureOpenAIEndpoint')
  const azureOpenAIKey = localStorage.getItem('azureOpenAIKey')
  const azureOpenAIModelName = localStorage.getItem('azureOpenAIModelName')
  const azureOpenAIAPIVersion = localStorage.getItem('azureOpenAIModelVersion')

  const openaiurl = azureOpenAIEndpoint + "/openai/deployments/" + azureOpenAIModelName + "/chat/completions?api-version=" + azureOpenAIAPIVersion
  const response = await fetch(openaiurl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': `${azureOpenAIKey}`
    },

    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: prompt
            }
          ]
        },
        {
            role: "user",
              content: [
                {
                  type: "text",
                  text: text
                }
              ]
        }  
      ],
      temperature: 0.0,
      top_p: 0.95,
      max_tokens: max_tokens
    })
  });

  const data = await response.json();
  console.log("Data: ", data);
  if (response.ok) {
    //console.log('Response from OpenAI:', data);
    return data.choices[0].message.content;
  } else {
    console.error(data.error.message);
    throw new Error(data.error.message || 'Unknown error from OpenAI');
  }
}

async function getOpenAIResponseDemo(prompt,text,max_tokens)
{
  // waint 2 seconds
  await new Promise(r => setTimeout(r, 100));
  return "Hello World";
}

