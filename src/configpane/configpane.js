
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
    document.getElementById("list-policy-button").onclick = displayJSONOutputWithTags;
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

function displayJSONOutputWithTags() {
  const container = document.getElementById("policy-container"); // Target your specific container
  if (!container) {
      console.error("Result container not found");
      return;
  }

  const jsonData = {
    "output": [
        {
            "valid": "02/10/2022",
            "title": "Limitation of Liability",
            "instruction": "Seller will not be liable under this Contract for more than the Contract Price paid under this Contract during the 12 months before the claim arises.",
            "locked": true,
            "author": "Daniel Green",
            "tags": [
              "Seller not liable",
              "Contract Price limit",
              "12-month"
            ]
        },
        {
            "valid": "25/10/2024",
            "title": "Governing Law",
            "instruction": "All contracts in the company must be governed by the laws of the state of Delaware.",
            "locked": false,
            "author": "Lior Armiev",
            "tags": ["Delaware", "Governing Law"]
        }
    ]
};

  container.innerHTML = ""; // Clear any existing content

  // Loop through each item in the JSON output and create corresponding elements
  jsonData.output.forEach((item, index) => {
    // Create the main container for each item
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("output-item");
    itemDiv.id = `output-item-${index}`;


    // 1. Add the title
    const title = document.createElement("h4");
    title.textContent = item.title || "No Title Available";
    title.classList.add("output-title");
    itemDiv.appendChild(title);

    const valid = document.createElement("p");
    valid.textContent = "Valid from:" + item.valid || "No Valid Date Available";
    valid.style.fontWeight = "lighter";
    valid.style.fontSize = "0.8rem";
    valid.classList.add("output-title");
    itemDiv.appendChild(valid);


    // 2. Create the instruction container
    const instructionContainer = document.createElement("div");
    instructionContainer.classList.add("instruction-container");

    // Instruction text
    const instruction = document.createElement("p");
    instruction.textContent = item.instruction || "No Instruction Available";
    instruction.classList.add("output-instruction");
    instruction.id = `instruction-${index}`;
    instructionContainer.appendChild(instruction);

    // 3. Add a container for the controls (Author Name, Save, and Change Buttons)
    const controlsContainer = document.createElement("div");
    controlsContainer.classList.add("controls-container");
    controlsContainer.style.display = "flex";
    controlsContainer.style.justifyContent = "space-between";
    controlsContainer.style.alignItems = "center";

    // Author name on the left
    const authorNameLabel = document.createElement("span");
    authorNameLabel.textContent = "Author" + (item.author ? `: ${item.author}` : "");
    authorNameLabel.classList.add("author-name");
    controlsContainer.appendChild(authorNameLabel);

    // Save button (initially hidden)
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("save-button");
    saveButton.style.display = "none";
    saveButton.addEventListener("click", () => {
        const textArea = document.getElementById(`textarea-instruction-${index}`);
        instruction.textContent = textArea.value; // Save the updated text
        instruction.style.display = "block"; // Show the updated instruction
        textArea.remove(); // Remove the textarea
        saveButton.style.display = "none"; // Hide save button
        changeButton.style.display = "inline-block"; // Show change button
    });
    controlsContainer.appendChild(saveButton);

    // Change button on the right
    const changeButton = document.createElement("button");
    changeButton.textContent = "Change";
    changeButton.classList.add("change-button");
    controlsContainer.appendChild(changeButton);

    // Add control functionality to the "Change" button
    if (item.locked) {
        changeButton.disabled = true;
        changeButton.classList.add("locked-button");
    } else {
        changeButton.addEventListener("click", () => {
            // Replace instruction text with a textarea
            const textArea = document.createElement("textarea");
            textArea.value = item.instruction || "";
            textArea.id = `textarea-instruction-${index}`;
            textArea.classList.add("instruction-textarea");
            textArea.style.resize = "vertical"; // Allow vertical resizing

            instruction.style.display = "none"; // Hide the instruction text
            instructionContainer.insertBefore(textArea, controlsContainer); // Insert textarea above controls

            saveButton.style.display = "inline-block"; // Show save button
            changeButton.style.display = "none"; // Hide change button
        });
    }

    // Attach controls container to the instruction container
    instructionContainer.appendChild(controlsContainer);
    itemDiv.appendChild(instructionContainer);

    // 4. Add tags if available
    if (Array.isArray(item.tags) && item.tags.length > 0) {
        const tagsContainer = document.createElement("div");
        tagsContainer.classList.add("tags-container");

        item.tags.forEach((tag) => {
            const tagElement = document.createElement("span");
            tagElement.classList.add("tag");
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });

        itemDiv.appendChild(tagsContainer);
    }

    // Append the item container to the main container
    container.appendChild(itemDiv);
});

// add a button to add new policy in the buttom middle of the screen
const addPolicyButton = document.createElement("button");
addPolicyButton.id = "add-policy-button";
addPolicyButton.textContent = "Add Policy";
addPolicyButton.classList.add("change-button");
addPolicyButton.style.position = "fixed";
addPolicyButton.style.bottom = "20px";
addPolicyButton.style.left = "50%";
addPolicyButton.style.transform = "translateX(-50%)";
document.body.appendChild(addPolicyButton);
addPolicyButton.addEventListener("click", () => {
  const container = document.getElementById("policy-container"); // Target your specific container
  if (!container) {
      console.error("Result container not found");
      return;
  }}
)
}

