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
          document.getElementById("review-button").onclick = review;
          document.getElementById("rewrite-button").onclick = rewrite;
          document.getElementById("search-button").onclick = search;
          document.getElementById("ask-button").onclick = ask;
          document.getElementById("index-doc-button").onclick = index_document;
          document.getElementById("fetchPolicyData").onclick = summary;
          document.getElementById("fetchSummaryData").onclick = document_summary;
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
}

export async function summary() {
  // Clear the container content before adding new results
  const container = document.getElementById("policy-container");
  if (container) {
    container.innerHTML = "";  // Clear existing content
  }

  const contspinner = document.createElement("div");
  contspinner.id = "policy-spinner";
  contspinner.classList.add("spinner");
  contspinner.style.display = "block";
  container.appendChild(contspinner);

  // Start Word run context
  return Word.run(async (context) => {
    try {
      const selected_text = context.document.getSelection();
      selected_text.load("text");
      await context.sync();

      // If text is empty, load the whole document
      if (selected_text.text == "" || selected_text.text == null) {
          console.error("Invalid policy data or Items not found.");
          container.innerHTML = "<p>Unable to display content. Please check the data structure.</p>";

          const reviewButton = document.createElement("button");
          reviewButton.classList.add("search-button");
          reviewButton.textContent = "Review";
          reviewButton.addEventListener("click", summary);
          container.appendChild(reviewButton);

      }   
      
      
      // Make the API call to get the data
      const response = await fetch("http://localhost:8083/score", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query_type: 2,
          question: selected_text.text,  // Ensure you pass the actual text here
          selection: ""    // Same here, make sure to send the correct text
        })
      });  
      console.log("selected_text.text", selected_text.text);
      
      // Handle the response and update the UI
      const data = await response.json();
      console.log(data);
      
      
      displayPolicyItems(data.answer.PolicyItems);  
      
    } catch (error) {
      console.error("Error: " + error);
      
      // Hide the spinner in case of an error
      // if (spinner) {
      //   spinner.style.display = "none";  // Hide the spinner if an error occurs
      // }
    }
  });
}


export async function document_summary() {
  // Clear the container content before adding new results
  const container = document.getElementById("summary-container");
  if (container) {
    container.innerHTML = "";  // Clear existing content
  }

  const contspinner = document.createElement("div");
  contspinner.id = "summary-spinner";
  contspinner.classList.add("spinner");
  contspinner.style.display = "block";
  container.appendChild(contspinner);

  // Start Word run context
  return Word.run(async (context) => {
    try {
      const document_text = context.document.body;
      document_text.load("text");
      await context.sync();
      console.log(document_text.text);
            // Make the API call to get the data  ---------- Remember to remove this line ---------------
      const response = await fetch("http://localhost:8083/score", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query_type: 1,
            question: document_text.text,  // Ensure you pass the actual text here
            selection: ""    // Same here, make sure to send the correct text
          })
        });      

      // Handle the response and update the UI 
      const data = await response.json(); // ---------- Remember to remove this line ---------------
        console.log(response);     
        /// write the data const type is it array or object
        console.log(data.answer.answer);
        
      // Call the function to display the data in the container
      displaySummaryData(data.answer.answer);  
    } catch (error) {
      console.error("Error: " + error);
      
      // Hide the spinner in case of an error
      // if (spinner) {
      //   spinner.style.display = "none";  // Hide the spinner if an error occurs
      // }
    }
  });
}



// function
export async function review() {
  return Word.run(async (context) => {
    try {
      // Get the current selection
      const originalRange = context.document.getSelection();

      // Load the text property of the selection range
      originalRange.load("text");

      // Synchronize the document state to load the text property
      await context.sync();

      // Check if there is text selected
      // if (originalRange.text) {
      //   const selectedText = originalRange.text;
      //   // Send the selected text to Azure OpenAI
        
      //   console.log("Selected text: " + selectedText);
      //   setGaugePercent(10);
      //   let prompt = 'You are a Law/Contract AI assistant that helps people find information. You need to review the selected user text and provide a list of 4 items checklist. \n' +
      //   '1. Spelling and grammar, provide a score from green to red (when red is a very bad spelling, and green is no changes) \n ' +
      //   '2. Check if dates and numbers are by the standard format, provide a score from green to red. \n ' +
      //   '3. Check if the text selected is orianted to the seller or bayer, score green, red. when green is seller oriented and red is buyer oriented, if not sure or the text does not relate to it make it green. If not Sure, Make it Green!\n ' +
      //   '4. Check that the text is talking about contract law and not other topics, score green to red when red is the topic is not relatet to law/contract at all \n ' +
      //   'the 4th checkitem, if in the user text you have text regarding governing low location like Singapore, give the item the name "Governin Law". the governing law must be of Delaware, if its not Delaware it will be red and green if it is. use "Compliance" name if its not about "Governin Law" \n' +
      //   'make it key value pair text list, every line in a new line, no numbering. color names always lowercase\nYou Must return all 4 checkpoints\n' +
      //   'exmaple:\n' +
      //   'Governing law:red\n' +
      //   'Dates and numbers:red\n' +
      //   'Seller/Buyer oriented:green\n' +
      //   'Spelling:green\n' + 
      //   'if no inforamtion on the Governing low create it anyway"\n'
      

      //   prompt = prompt + 'user selected text:\n' +  selectedText + '\n';
      //   console.log("Prompt: " + prompt);
      //   const aiResponse = await getOpenAIResponse(prompt,'',200);
      //   console.log("Response: ", aiResponse);
        
      //   let tesstarray = aiResponse.split('\n');
        
      
        
      //   document.getElementById("item1").innerText = tesstarray[0].split(':')[0];
      //   setItemColor('item1', aiResponse.split('\n')[0].split(':')[1]);

      //   document.getElementById("item2").innerText = tesstarray[1].split(':')[0];
      //   setItemColor('item2', aiResponse.split('\n')[1].split(':')[1]);

      //   document.getElementById("item3").innerText = tesstarray[2].split(':')[0];
      //   setItemColor('item3', aiResponse.split('\n')[2].split(':')[1]);

      //   document.getElementById("item4").innerText = tesstarray[3].split(':')[0];
      //   setItemColor('item4', aiResponse.split('\n')[3].split(':')[1]);

      //   //check the number of red and greens and setGaugePercent to the right percent
      //   let reds = 0; 
      //   let greens = 0;
      
      //   for (let i = 0; i < 4; i++) {
      //     if (tesstarray[i].split(':')[1] == 'red') {
      //       reds++;
      //     }
      //     else
      //     {
      //       greens++;
      //     }
      //   }
      //   //print the number of reds and greens
      //   console.log("Reds: ", reds);
      //   console.log("Greens: ", greens);
      //   // calculate the percent of red vs greens
      //   let percent = (reds / (reds + greens)) * 100;
        
                
      //   console.log("Percent: ", percent);
      //   setGaugePercent(percent);
        
        
        //setGaugePercent(10);

        // Synchronize the document state
        // await context.sync();
      // } else {
        // console.log("No text selected.");
      // }
    } catch (error) {
      console.error("Error: " + error);
    }
  });
}
// rewrite function
export async function rewrite() {
  return Word.run(async (context) => {
    try {
      // Get the current selection
      const originalRange = context.document.getSelection();

      // Load the text property of the selection range
      originalRange.load("text");

      // Synchronize the document state to load the text property
      await context.sync();

    //   // Check if there is text selected
    //   if (originalRange.text) {
    //     const selectedText = originalRange.text;
    //     // Send the selected text to Azure OpenAI
        
    //     console.log("Selected text: " + selectedText);
    //     let prompt = 'You are a Law/Contract AI assistant that helps people find information. you will need to take the user selection and rewrite it based on the next rules:\n- Make the distinction between Seller and Buyer\n Im the Seller and the Lawyer of the Seller, all changes must favor the Seller and be balanced to both parties if possible\nkeep the format and try to stay with the same idia of the text'+
    //     'if the text holds information on the Governing low, it must be changed to Delaware if its not, make referance to this: This Agreement shall be governed exclusively by the internal laws of the state of Delaware, without regard to its conflicts of laws rules. Any dispute arising under this Agreement shall only be brought in the courts located in Delaware.\nJust change the text, dont give befor and after\n'
    //     prompt = prompt + 'user selected text:\n' +  selectedText + '\n';
    //     console.log("Prompt: " + prompt);
    //     const aiResponse = await getOpenAIResponse(prompt,'',300);
    //     console.log("Response: ", aiResponse);
    //     // Insert the response text as a new paragraph at the end of the document
    //     //const paragraph = context.document.body.insertParagraph(aiResponse, Word.InsertLocation.end);
    //     originalRange.insertText(aiResponse,"Replace");
        
    //     // Change the paragraph color to blue
    //     //paragraph.font.color = "blue";
        
    //     // Synchronize the document state
    //     await context.sync();
    //   } else {
    //     console.log("No text selected.");
    //   }
    } catch (error) {
      console.error("Error: " + error);
    }
  });
}
// search function
export async function search() {
  return Word.run(async (context) => {
    try {
     
      await new Promise(r => setTimeout(r, 1000));


      const searchResults = context.document.body.search('CHOICE OF LAW AND DISPUTE RESOLUTION');
      searchResults.load("length");
      await context.sync();
      for (let i = 0; i < searchResults.items.length; i++) {
        searchResults.items[i].font.highlightColor = "yellow";
      }
      await context.sync();

      // go to the first search result
      searchResults.items[0].select();
      
      
    
    // highjlight the search results

    } catch (error) {
      console.error("Error: " + error);
    }
  });
}
// ask function
export async function ask() {
  return Word.run(async (context) => {
    try {
      // add variable string call pptoutput
      const azureOpenAIAskMaxTokens = localStorage.getItem('azureOpenAIAskMaxTokens');
      const SearchOption = document.querySelector('input[name="selection"]:checked');
      console.log("Selected option: ", SearchOption.value);

      let prompt = localStorage.getItem('azurePromptAsk');

      const originalRange = context.document.getSelection();
      originalRange.load("text");
      await context.sync();

      // prompt = prompt + 'user selection: ' + originalRange.text + '\n';
           
      // // read the query from the input field
      // const query = document.getElementById("ask-input").value;
      // prompt = prompt + '\nuser query: ' + query + '\n';
      // console.log("Prompt : " + prompt);

      // if (SearchOption.value == 'organization') {
      // // do embeddings of the question
      //   console.log(SearchOption.value);
      //   const embedding = await getOpenAIEmbeddings(originalRange.text);
      //   console.log("Embedding: ", embedding);

      // }
      // else
      // {
      //   prompt = prompt + '\nuser query: ' + query + '\n';
      //   console.log("Prompt : " + prompt);
      // }

      // const response = await getOpenAIResponse(prompt, '', 300);
      // console.log("Response: ", response);
      // insert the response into field 
      document.getElementById("ask-output").innerHTML = "response";
      await context.sync();
      
    } catch (error) {
      console.error("Error: " + error);
    }
  });
}


export async function index_document() {
  // sleep to 2 seconds
  document.getElementById("index-doc-spinner").style.display = "flex";
  await new Promise(r => setTimeout(r, 2000));
  document.getElementById("index-doc-spinner").style.display = "none";
  // chnage the conainter index-doc-container style to display none
  
  var reviewcontainerDiv = document.getElementById("index-doc-container");
  reviewcontainerDiv.style.display = "none";

  showSuccessIndexedMessage()

}

function showSuccessIndexedMessage() {
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

function displayPolicyItems(policyItems) {
  const container = document.getElementById("policy-container");
  if (container) {
    container.innerHTML = "";  // Clear any existing content
  }

  policyItems.forEach((item, index) => {
      // Create the main policy container
      const policyDiv = document.createElement("div");
      policyDiv.classList.add("policy-container");

      // Create the header with title and compliance status
      const headerDiv = document.createElement("div");
      headerDiv.classList.add("policy-header");
      headerDiv.style.cursor = "pointer";  // Cursor to indicate clickable element
      headerDiv.addEventListener("click", () => toggleContent(index));  // Toggle on click

      const complianceIcon = document.createElement("div");
      complianceIcon.classList.add("compliance-icon");
      complianceIcon.classList.add(item.iscompliant === "yes" ? "compliant" : "non-compliant");

      const title = document.createElement("span");
      title.classList.add("policy-title");
      title.textContent = item.title;

      const toggleMarker = document.createElement("span");
      toggleMarker.classList.add("toggle-marker");
      toggleMarker.textContent = "▼";  // Downward triangle indicator

      headerDiv.appendChild(complianceIcon);
      headerDiv.appendChild(title);
      headerDiv.appendChild(toggleMarker);
      policyDiv.appendChild(headerDiv);

      // Add policy details (initially hidden)
      const contentDiv = document.createElement("div");
      contentDiv.classList.add("policy-content");
      contentDiv.id = `policy-content-${index}`;
      contentDiv.style.display = "none";  // Hide the content initially

      const details = [
          { label: "Summary", value: item.summary },
          { label: "Relevant Policy Item", value: item.relevant_policy_item }     
      ];

      if (item.iscompliant !== "yes") {
        details.push({ label: "Suggested Correction", value: item.suggested_correction });
        details.push({ label: "Corrected Text", value: "" });  // The field will be filled with the carousel
      }

      if (item.key_phrases && item.key_phrases.length > 0) {
        details.push({ label: "Key Phrases", value: item.key_phrases.join(', ') });
      }

      details.forEach(detail => {
          const detailDiv = document.createElement("div");
          detailDiv.classList.add("policy-field");

          const detailTitle = document.createElement("div");
          detailTitle.classList.add("field-title");
          detailTitle.textContent = `${detail.label}:`;

          const detailValue = document.createElement("div");
          detailValue.textContent = detail.value;

          detailDiv.appendChild(detailTitle);
          detailDiv.appendChild(detailValue);
          contentDiv.appendChild(detailDiv);
      });

      // Create and display the carousel only if not compliant
      if (item.iscompliant !== "yes") {
        // Carousel Section for Corrected Text Variations
        let currentIndex = 0;
        const variations = item.corrected_text;  // Assuming item.corrected_text is an array of variations

        // Create carousel container
        const carouselDiv = document.createElement("div");
        carouselDiv.classList.add("carousel-container");

        // Corrected text display
        const correctedTextDiv = document.createElement("div");
        correctedTextDiv.classList.add("carousel-text");
        correctedTextDiv.textContent = variations[currentIndex];

        // Variation number (e.g., "1/3")
        const variationNumber = document.createElement("div");
        variationNumber.classList.add("variation-number");
        variationNumber.textContent = `${currentIndex + 1}/${variations.length}`;

        // Left and right buttons for carousel navigation
        const leftButton = document.createElement("button");
        leftButton.classList.add("carousel-button", "carousel-left");
        leftButton.textContent = "◀";  // Left arrow
        leftButton.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
                correctedTextDiv.textContent = variations[currentIndex];
                variationNumber.textContent = `${currentIndex + 1}/${variations.length}`;
            }
        });

        const rightButton = document.createElement("button");
        rightButton.classList.add("carousel-button", "carousel-right");
        rightButton.textContent = "▶";  // Right arrow
        rightButton.addEventListener("click", () => {
            if (currentIndex < variations.length - 1) {
                currentIndex++;
                correctedTextDiv.textContent = variations[currentIndex];
                variationNumber.textContent = `${currentIndex + 1}/${variations.length}`;
            }
        });

        // Append buttons, text, and variation number to carousel div
        carouselDiv.appendChild(leftButton);
        carouselDiv.appendChild(correctedTextDiv);
        carouselDiv.appendChild(rightButton);
        carouselDiv.appendChild(variationNumber);

        // Add carousel to contentDiv
        contentDiv.appendChild(carouselDiv);
        

        // Create a container for the buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        // Create a Fix button
        const fixButton = document.createElement("button");
        fixButton.textContent = "Fix";
        fixButton.classList.add("search-button");  // Apply the new style
        fixButton.addEventListener("click", () => fixText(variations[currentIndex]));
        contentDiv.appendChild(fixButton);

        const gotoButton = document.createElement("button");
        gotoButton.textContent = "Go To";
        gotoButton.classList.add("search-button");  // Apply the new style
        gotoButton.addEventListener("click", () => gotoText(variations[currentIndex]));
        contentDiv.appendChild(gotoButton);

        // Append the container to the contentDiv
        contentDiv.appendChild(buttonContainer);


      }
      policyDiv.appendChild(contentDiv);
      container.appendChild(policyDiv);
  });

  // Always create the Review button at the end
  const reviewButton = document.createElement("button");
  reviewButton.classList.add("search-button");
  reviewButton.textContent = "Review Next";
  reviewButton.addEventListener("click", summary);
  container.appendChild(reviewButton);
}

// Function to display the summary and paragraph details under "summary-container"
function displaySummaryData(policyData) {
  const container = document.getElementById("summary-container");
  if (container) {
      container.innerHTML = "";  // Clear any existing content
  }

  // Ensure that policyData and policyData.Items are properly defined
  if (!policyData || !Array.isArray(policyData.Items)) {
      console.error("Invalid policy data or Items not found.");
      container.innerHTML = "<p>Unable to display content. Please check the data structure.</p>";
      return;
  }

  
  // Display the overall document summary at the top (if applicable)
  const summaryDiv = document.createElement("div");
  summaryDiv.classList.add("document-summary");

  const summaryTitle = document.createElement("h3");
  summaryTitle.textContent = "Document Summary";
  summaryDiv.appendChild(summaryTitle);

  const summaryText = document.createElement("p");
  summaryText.textContent = policyData.Summary || "No summary available";
  summaryDiv.appendChild(summaryText);

  container.appendChild(summaryDiv);

  // Loop through each item in the Items array and add collapsible sections
  policyData.Items.forEach((item, index) => {
      // Create the main container for each item
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("policy-container");

      // Create the header with title
      const headerDiv = document.createElement("div");
      headerDiv.classList.add("policy-header");
      headerDiv.style.cursor = "pointer";  // Cursor to indicate clickable element
      headerDiv.addEventListener("click", () => toggleContent(index));  // Toggle on click

      const title = document.createElement("span");
      title.classList.add("policy-title");
      title.textContent = item.title || "Untitled";

      const toggleMarker = document.createElement("span");
      toggleMarker.classList.add("toggle-marker");
      toggleMarker.textContent = "▼";  // Downward triangle indicator

      headerDiv.appendChild(title);
      headerDiv.appendChild(toggleMarker);
      itemDiv.appendChild(headerDiv);

      // Add item details (initially hidden)
      const contentDiv = document.createElement("div");
      contentDiv.classList.add("policy-content");
      contentDiv.id = `policy-content-${index}`;
      contentDiv.style.display = "none";  // Hide the content initially

      // Define the item details
      const details = [
          { label: "Summary", value: item.summary || "No summary available" },
          { label: "Notes", value: item.notes || "No notes available" },
          // { label: "Original Text", value: item.original_text || "No original text available" },
      ];

      // Add the details to the content div
      details.forEach(detail => {
          const detailDiv = document.createElement("div");
          detailDiv.classList.add("policy-field");

          const detailTitle = document.createElement("div");
          detailTitle.classList.add("field-title");
          detailTitle.textContent = `${detail.label}:`;

          const detailValue = document.createElement("div");
          detailValue.textContent = detail.value;

          detailDiv.appendChild(detailTitle);
          detailDiv.appendChild(detailValue);
          contentDiv.appendChild(detailDiv);
      });


      // Create the Key Items section as tags
      if (Array.isArray(item.keyItems) && item.keyItems.length > 0) {
        const keyItemsDiv = document.createElement("div");
        keyItemsDiv.classList.add("policy-field");

        const keyItemsTitle = document.createElement("div");
        keyItemsTitle.classList.add("field-title");
        keyItemsTitle.textContent = "Key Items:";

        const keyItemsTagsDiv = document.createElement("div");
        keyItemsTagsDiv.classList.add("key-items");

        // Loop through keyItems and create tag elements
        item.keyItems.forEach(keyItem => {
            const tag = document.createElement("span");
            tag.classList.add("key-item");
            tag.textContent = keyItem;
            keyItemsTagsDiv.appendChild(tag);
        });

        keyItemsDiv.appendChild(keyItemsTitle);
        keyItemsDiv.appendChild(keyItemsTagsDiv);
        contentDiv.appendChild(keyItemsDiv);
    }

    const goToButton = document.createElement("button");
        goToButton.classList.add("search-button");
        goToButton.textContent = "Go to";
        
        goToButton.addEventListener("click", () => {
          findInDocument(item.title);
        });
        
        contentDiv.appendChild(goToButton);

      // Append the content div to the item container
      itemDiv.appendChild(contentDiv);
      container.appendChild(itemDiv);
  });
}

function findInDocument(text) {
  Word.run(async (context) => {
    const searchResults = context.document.body.search(text, {ignorePunct: true});
    searchResults.load('font');
    await context.sync();
    console.log('Found count: ' + searchResults.items.length);
    if (searchResults.items.length > 0) {
      // Highlight the found text in the document
      searchResults.items[0].select();
  } else {
      console.log("Text not found in the document");
  }


  });

}

function toggleContent(index) {
  const contentDiv = document.getElementById(`policy-content-${index}`);
  contentDiv.style.display = (contentDiv.style.display === "none") ? "block" : "none";
}

function fixText(correctedText) {
  Word.run(async (context) => {
      // Get the current selection
      const selection = context.document.getSelection();
      selection.load("text");

      await context.sync();

      // Replace the selected text with the corrected text
      selection.insertText(correctedText, Word.InsertLocation.replace);

      await context.sync();
      console.log("Text replaced with corrected text: ", correctedText);
  }).catch(function (error) {
      console.log("Error: " + error);
  });
}


function gotoText(correctedText) {
  Word.run(async (context) => {
      // Get the current selection
      const selection = context.document.getSelection();
      selection.load("text");

      await context.sync();
      selection.select();
    
      await context.sync();
  }).catch(function (error) {
      console.log("Error: " + error);
  });
}

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
  await new Promise(r => setTimeout(r, 2000));
  return "Hello World";
}
