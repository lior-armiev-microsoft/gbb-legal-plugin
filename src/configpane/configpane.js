
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
    localStorage.setItem('azurePromptAskMaxTokens', config['azure-prompt-ask-max-tokens']);
    localStorage.setItem('azurePromptComplinceMaxTokens', config['azure-prompt-complinace-max-tokens']);

    console.log(localStorage.getItem('azureOpenAIKey'));

    // upadte the text fields
    document.getElementById('azure-openai-endpoint').value = localStorage.getItem('azureOpenAIEndpoint');
    document.getElementById('azure-openai-key').value = localStorage.getItem('azureOpenAIKey');
    document.getElementById('azure-openai-model-name').value = localStorage.getItem('azureOpenAIModelName');
    document.getElementById('azure-openai-api-version').value = localStorage.getItem('azureOpenAIModelVersion');
    document.getElementById('azure-openai-model-embedding').value = localStorage.getItem('azureOpenAIEmbeddingModelName');
    document.getElementById('azure-search-endpoint').value = localStorage.getItem('azureSearchEndpoint');
    document.getElementById('azure-search-key').value = localStorage.getItem('azureSearchKey');
    document.getElementById('azure-search-index').value = localStorage.getItem('azureSearchIndexName');
    document.getElementById('azure-prompt-ask').value = localStorage.getItem('azurePromptAsk');
    document.getElementById('azure-prompt-complince').value = localStorage.getItem('azurePromptComplince');
    document.getElementById('azure-prompt-ask-max-tokens').value = localStorage.getItem('azurePromptAskMaxTokens');
    document.getElementById('azure-prompt-complince-max-tokens').value = localStorage.getItem('azurePromptComplinceMaxTokens');

   })
  .catch((e) => console.error(e));


Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("configuration-save").onclick = configbutton;
  }
});

export async function configbutton() {
  return Word.run(async (context) => {

    const azureOpenAIKey = document.getElementById('azure-openai-key').value;
    const azureOpenAIEndpoint = document.getElementById('azure-openai-endpoint').value;
    const azureOpenAIModelName = document.getElementById('azure-openai-model-name').value;
    const azureOpenAIAPIVersion = document.getElementById('azure-openai-api-version').value;
    const azureOpenAIEmbeddings = document.getElementById('azure-openai-model-embedding').value;

    const azureSearchKey = document.getElementById('azure-search-key').value;
    const azureSearchEndpoint = document.getElementById('azure-search-endpoint').value;
    const azureSearchIndexName = document.getElementById('azure-search-index').value;

    // Save the configuration to be used in a JS file
    localStorage.setItem('azureOpenAIKey', azureOpenAIKey);
    localStorage.setItem('azureOpenAIEndpoint', azureOpenAIEndpoint);
    localStorage.setItem('azureOpenAIModelName', azureOpenAIModelName);
    localStorage.setItem('azureOpenAIAPIVersion', azureOpenAIAPIVersion);
    localStorage.setItem('azureOpenAIEmbeddings', azureOpenAIEmbeddings);
    localStorage.setItem('azureSearchKey', azureSearchKey);
    localStorage.setItem('azureSearchEndpoint', azureSearchEndpoint);
    localStorage.setItem('azureSearchIndexName', azureSearchIndexName);

    console.log(azureOpenAIKey)
    console.log(azureOpenAIEndpoint)
    console.log(azureOpenAIModelName)
    console.log(azureOpenAIAPIVersion)
    console.log(azureOpenAIEmbeddings)
    console.log(azureSearchKey)
    console.log(azureSearchEndpoint)
    console.log(azureSearchIndexName)


    showSuccessSaveMessage();
    

  });
}

function showSuccessSaveMessage() {
  const ribbon = document.querySelector('.warning-ribbon');

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