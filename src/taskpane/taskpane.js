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
    getOpenAIResponse('1','',1).then((result) =>
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
      if (originalRange.text) {
        const selectedText = originalRange.text;
        // Send the selected text to Azure OpenAI
        
        console.log("Selected text: " + selectedText);
        setGaugePercent(10);
        let prompt = 'You are a Law/Contract AI assistant that helps people find information. You need to review the selected user text and provide a list of 4 items checklist. \n' +
        '1. Spelling and grammar, provide a score from green to red (when red is a very bad spelling, and green is no changes) \n ' +
        '2. Check if dates and numbers are by the standard format, provide a score from green to red. \n ' +
        '3. Check if the text selected is orianted to the seller or bayer, score green, red. when green is seller oriented and red is buyer oriented, if not sure or the text does not relate to it make it green. If not Sure, Make it Green!\n ' +
        '4. Check that the text is talking about contract law and not other topics, score green to red when red is the topic is not relatet to law/contract at all \n ' +
        'the 4th checkitem, if in the user text you have text regarding governing low location like Singapore, give the item the name "Governin Law". the governing law must be of Delaware, if its not Delaware it will be red and green if it is. use "Compliance" name if its not about "Governin Law" \n' +
        'make it key value pair text list, every line in a new line, no numbering. color names always lowercase\nYou Must return all 4 checkpoints\n' +
        'exmaple:\n' +
        'Governing law:red\n' +
        'Dates and numbers:red\n' +
        'Seller/Buyer oriented:green\n' +
        'Spelling:green\n' + 
        'if no inforamtion on the Governing low create it anyway"\n'
      

        prompt = prompt + 'user selected text:\n' +  selectedText + '\n';
        console.log("Prompt: " + prompt);
        const aiResponse = await getOpenAIResponse(prompt,'',200);
        console.log("Response: ", aiResponse);
        
        let tesstarray = aiResponse.split('\n');
        
      
        
        document.getElementById("item1").innerText = tesstarray[0].split(':')[0];
        setItemColor('item1', aiResponse.split('\n')[0].split(':')[1]);

        document.getElementById("item2").innerText = tesstarray[1].split(':')[0];
        setItemColor('item2', aiResponse.split('\n')[1].split(':')[1]);

        document.getElementById("item3").innerText = tesstarray[2].split(':')[0];
        setItemColor('item3', aiResponse.split('\n')[2].split(':')[1]);

        document.getElementById("item4").innerText = tesstarray[3].split(':')[0];
        setItemColor('item4', aiResponse.split('\n')[3].split(':')[1]);

        //check the number of red and greens and setGaugePercent to the right percent
        let reds = 0; 
        let greens = 0;
      
        for (let i = 0; i < 4; i++) {
          if (tesstarray[i].split(':')[1] == 'red') {
            reds++;
          }
          else
          {
            greens++;
          }
        }
        //print the number of reds and greens
        console.log("Reds: ", reds);
        console.log("Greens: ", greens);
        // calculate the percent of red vs greens
        let percent = (reds / (reds + greens)) * 100;
        
                
        console.log("Percent: ", percent);
        setGaugePercent(percent);
        
        
        //setGaugePercent(10);

        // Synchronize the document state
        await context.sync();
      } else {
        console.log("No text selected.");
      }
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

      // Check if there is text selected
      if (originalRange.text) {
        const selectedText = originalRange.text;
        // Send the selected text to Azure OpenAI
        
        console.log("Selected text: " + selectedText);
        let prompt = 'You are a Law/Contract AI assistant that helps people find information. you will need to take the user selection and rewrite it based on the next rules:\n- Make the distinction between Seller and Buyer\n Im the Seller and the Lawyer of the Seller, all changes must favor the Seller and be balanced to both parties if possible\nkeep the format and try to stay with the same idia of the text'+
        'if the text holds information on the Governing low, it must be changed to Delaware if its not, make referance to this: This Agreement shall be governed exclusively by the internal laws of the state of Delaware, without regard to its conflicts of laws rules. Any dispute arising under this Agreement shall only be brought in the courts located in Delaware.\nJust change the text, dont give befor and after\n'
        prompt = prompt + 'user selected text:\n' +  selectedText + '\n';
        console.log("Prompt: " + prompt);
        const aiResponse = await getOpenAIResponse(prompt,'',300);
        console.log("Response: ", aiResponse);
        // Insert the response text as a new paragraph at the end of the document
        //const paragraph = context.document.body.insertParagraph(aiResponse, Word.InsertLocation.end);
        originalRange.insertText(aiResponse,"Replace");
        
        // Change the paragraph color to blue
        //paragraph.font.color = "blue";
        
        // Synchronize the document state
        await context.sync();
      } else {
        console.log("No text selected.");
      }
    } catch (error) {
      console.error("Error: " + error);
    }
  });
}
// search function
export async function search() {
  return Word.run(async (context) => {
    try {
      // // Get the current selection
      // const searchInput = document.getElementById("search-input").value;
      // //console.log("Search input: " + searchInput);

      // // Get embeddings from Azure OpenAI
      // const searchEmbedding = await getOpenAIEmbeddings(searchInput);
      // //console.log("Search embedding: ", searchEmbedding);

      // // Get search results from Azure Search
      // const response = await getAzureSearchResponse(searchInput, searchEmbedding);
      // //console.log("Azure Search response: ", response);

      // const searchArray = [];

      // for (const result of response) {
      //   const chunk = result.chunk;
      //   const prompt = 'Take the chunk result that is too long, take the user original question:' 
      //   + searchInput + ' find in the chunk the information related to the question and just cut the information relevant. ' + 
      //   'do not change the text, just cut it. the output is only the cut, remove numbering and bullet points from the beginning of the text if any.';
      //   const rspo = await getOpenAIResponse(prompt, chunk,200);

      //   // Add the rspo to searchArray
      //   searchArray.push(rspo);
      // }

      // for (const searchText of searchArray) {
      //   const searchResults = context.document.body.search(searchText, { ignorePunct: true });
      //   searchResults.load('font');
      //   await context.sync();

      //   for (let i = 0; i < searchResults.items.length; i++) {
      //     searchResults.items[i].font.color = 'purple';
      //     searchResults.items[i].font.highlightColor = '#FFFF00'; // Yellow
      //     searchResults.items[i].font.bold = true;
      //   }

      //   await context.sync();
      // }
      
      // for (let i = 0; i <= searchArray.length; i++) {
      //   console.log('Searching for: ' + searchArray[i]);
        
      //   const searchResults = context.document.body.search(searchArray[i], {ignorePunct: true});
      //   console.log('Found count: ' + searchResults.items.length);
      //   searchResults.load('font');
      //   await context.sync();
      //   searchResults.items[0].font.highlightColor = '#FFFF00'; //Yellow
      //   searchResults.items[0].font.bold = true;
        
      // }
      
      // sleep to 2 seconds
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

      prompt = prompt + 'user selection: ' + originalRange.text + '\n';
           
      // read the query from the input field
      const query = document.getElementById("ask-input").value;
      prompt = prompt + '\nuser query: ' + query + '\n';
      console.log("Prompt : " + prompt);

      if (SearchOption.value == 'organization') {
      // do embeddings of the question
        console.log(SearchOption.value);
        const embedding = await getOpenAIEmbeddings(originalRange.text);
        console.log("Embedding: ", embedding);

      // searech the question in the document
      //const response = await getAzureSearchResponse(query, embedding);

      // take the result of the search and craete a text content with the chunks
      //let searchResults = '';
      //for (const result of response) {
      //  searchResults += result.chunk + '\n';
      //}

      // create a prompt from all
      //console.log("Search results: ", searchResults);

      }
      else
      {
        prompt = prompt + '\nuser query: ' + query + '\n';
        console.log("Prompt : " + prompt);
      }

      const response = await getOpenAIResponse(prompt, '', 300);
      console.log("Response: ", response);
      // insert the response into field 
      document.getElementById("ask-output").innerHTML = response;
      await context.sync();
      
    } catch (error) {
      console.error("Error: " + error);
    }
  });
}


export async function index_document() {
  // sleep to 2 seconds
  await new Promise(r => setTimeout(r, 2000));
    
  // chnage the conainter index-doc-container style to display none
  
  var reviewcontainerDiv = document.getElementById("index-doc-container");
  reviewcontainerDiv.style.display = "none";

  showSuccessIndexedMessage()

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

async function getAzureSearchResponse(query,embedding) {
  const apiKey = localStorage.getItem('azureSearchKey');
  const endpoint = localStorage.getItem('azureSearchEndpoint');
  const indexName = localStorage.getItem('azureSearchIndexName');
  const apiVersion = localStorage.getItem('azureSearchAPIVersion');

  const response = await fetch(`${endpoint}/indexes/${indexName}/docs/search?api-version=${apiVersion}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify(
      {
        "count": true,
        "select": "title, chunk",
        "vectorQueries": [
            {
                "kind": "vector",
                "vector": embedding,
                "exhaustive": true,
                "fields": "text_vector",
                "k": 2
            }
        ]
    }
    )
  });

  const data = await response.json();
  if (response.ok) {
    return data.value;
  } else {
    console.error('Error from Azure Search:', data);
    throw new Error(data.error || 'Unknown error from Azure Search');
  }
}

async function getOpenAIEmbeddings(query) {
  const azureOpenAIEndpoint = localStorage.getItem('azureOpenAIEndpoint')
  const azureOpenAIKey = localStorage.getItem('azureOpenAIKey')
  const azureOpenAIEmbeddingModelName = localStorage.getItem('azureOpenAIEmbeddingModelName')
  const azureOpenAIAPIVersion = localStorage.getItem('azureOpenAIModelVersion')
  
  const openaiurl = azureOpenAIEndpoint + "/openai/deployments/" + azureOpenAIEmbeddingModelName + "/embeddings?api-version=" + azureOpenAIAPIVersion
  const response = await fetch(openaiurl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': `${azureOpenAIKey}`
    },
    body: JSON.stringify({
      input: query
    })
  });
  
  const data = await response.json();
  if (response.ok) {
    //console.log('Response from OpenAI:', data);
    return data.data[0].embedding;
  } else {
    console.error('Error from Azure Embedding:', data);
    throw new Error(data.error || 'Unknown error from Azure Embeggind');
  }

}


function setGaugePercent(percent) {
  // Map percent (0-100) to rotation degrees (-90 to 90)
  var degrees = (percent / 100) * 180 - 90;
  document.getElementById('arrow').setAttribute('transform', 'rotate(' + degrees + ', 50, 50)');
}

function setItemColor(itemId, color) {
  var item = document.getElementById(itemId);
  if (item) {
      // Remove existing color classes
      item.classList.remove('green', 'yellow', 'red');
      
      // Add new color class
      item.classList.add(color);
  }
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