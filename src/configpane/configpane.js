
fetch("assets/config.json")
  .then((res) => res.text())
  .then((text) => {
    console.log("Config: ", text);
    const config = JSON.parse(text);
    localStorage.setItem('azureOpenAIEndpoint', config['azure-openai-endpoint']);
    localStorage.setItem('azureOpenAIKey', config['azure-openai-key']);
    localStorage.setItem('azureOpenAIModelName', config['azure-openai-model']);
    localStorage.setItem('azureOpenAIModelVersion', config['azure-openai-api-version']);
    console.log(localStorage.getItem('azureOpenAIKey'));

    // upadte the text fields
    document.getElementById('azure-openai-endpoint').value = localStorage.getItem('azureOpenAIEndpoint');
    document.getElementById('azure-openai-key').value = localStorage.getItem('azureOpenAIKey');
    document.getElementById('azure-openai-model-name').value = localStorage.getItem('azureOpenAIModelName');
    document.getElementById('azure-openai-api-version').value = localStorage.getItem('azureOpenAIModelVersion');
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

    // Save the configuration to be used in a JS file
    localStorage.setItem('azureOpenAIKey', azureOpenAIKey);
    localStorage.setItem('azureOpenAIEndpoint', azureOpenAIEndpoint);
    localStorage.setItem('azureOpenAIModelName', azureOpenAIModelName);
    localStorage.setItem('azureOpenAIAPIVersion', azureOpenAIAPIVersion);
  
    console.log(azureOpenAIKey)
    console.log(azureOpenAIEndpoint)
    console.log(azureOpenAIModelName)
    console.log(azureOpenAIAPIVersion)

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