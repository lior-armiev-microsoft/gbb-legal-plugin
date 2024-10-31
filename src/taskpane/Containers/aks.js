// ask function
export async function ask() {
    const container = document.getElementById("ask-container");
    
    try {
      var query = document.getElementById("ask-input").value;
      console.log("Query: ", query);
    }
    catch (error) {
      console.error("Error: " + error);
    }
  
    if (container) {
      container.innerHTML = "";  // Clear existing content
    }
  
    const contspinner = document.createElement("div");
    contspinner.id = "ask-spinner";
    contspinner.classList.add("spinner");
    contspinner.style.display = "block";
    container.appendChild(contspinner);
  
    return Word.run(async (context) => {
      try {
        console.log("Query: ", query);
  
        // Make the API call to get the data
        const response = await fetch("http://localhost:8083/score", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query_type: 3,
            question: query,  // Ensure you pass the actual text here
            selection: ""    // Same here, make sure to send the correct text
          })
        });      
        // Handle the response and update the UI
        const data = await response.json();
        console.log(data);
        displaySearchResults(data.answer)
        
      } catch (error) {
        console.error("Error: " + error);
      }
    });
  }
  
  function displaySearchResults(data) {  
    const container = document.getElementById("ask-container");  
    if (container) {  
      container.innerHTML = ""; // Clear previous content  
    }  
    
    const header = document.createElement("h2");  
    header.textContent = "Answer:";  
    header.id = "ask-answer-header";  
    header.addEventListener("click", showhideAnswer);  
    container.appendChild(header);  
    
    // Create a div to hold the answer content  
    const answerDiv = document.createElement("div");  
    answerDiv.classList.add("ask-answer-container");  
    const answerContent = document.createElement("p");  
    answerContent.textContent = data.Answer;  
    answerDiv.appendChild(answerContent);  
    container.appendChild(answerDiv);  
    
    // Create a section for the list of search results  
    const resultsDiv = document.createElement("div");  
    resultsDiv.classList.add("ask-results-container");  
    container.appendChild(resultsDiv);  
    
    const resultsTitle = document.createElement("h3");  
    resultsTitle.textContent = "Relevant Paragraphs:";  
    resultsTitle.id = "ask-results-title";
    resultsTitle.classList.add("ask-results-title"); // Ensure the class is set  
    resultsDiv.appendChild(resultsTitle);  
    
    // Loop through search results and add them to the container  
    data.SearchResults.forEach((result, index) => {  
      const resultItem = document.createElement("div");  
      resultItem.classList.add("result-item");  
      resultItem.textContent = result.title;  
    
      const additionalLine = document.createElement("p");  
      additionalLine.classList.add("result-description");  
      additionalLine.textContent = result.summary;  
    
      const additionalKeyphrases = document.createElement("p");  
      additionalKeyphrases.classList.add("result-description");  
      additionalKeyphrases.textContent = result.keyphrases;  
    
      const keyItemsTagsDiv = document.createElement("div");  
      keyItemsTagsDiv.classList.add("key-items");  
    
      // Loop through keyItems and create tag elements  
      result.keyphrases.forEach(keyItem => {  
        const tag = document.createElement("span");  
        tag.classList.add("key-item");  
        tag.textContent = keyItem;  
        keyItemsTagsDiv.appendChild(tag);  
      });  
    
      resultItem.addEventListener("click", () => {  
        findInDocument(result.title);  
      });  
    
      resultsDiv.appendChild(resultItem);  
      resultsDiv.appendChild(additionalLine);  
      resultsDiv.appendChild(keyItemsTagsDiv);  
    });  
    
    const trygainButton = document.createElement("button");  
    trygainButton.classList.add("search-button");  
    trygainButton.textContent = "Search Again";  
    trygainButton.addEventListener("click", resetPolicyContainer);  
    container.appendChild(trygainButton);  
    
    function resetPolicyContainer() {  
      container.innerHTML = `  
        <h2>Ask</h2>  
        <p>Chat with your contract to uncover the general meaning of the various provisions</p>  
        <div id="ask-spinner" style="display: none;" class="spinner"></div>  
        <input type="text" class="search-input" id="ask-input" name="search" placeholder="Write your question">  
        <button class="ms-Button ms-Button--primary search-button" id="ask-button">  
          <span class="ms-Button-label">Ask on the contract</span>  
        </button>  
      `;  
      const fetchButton = document.getElementById("ask-button");  
      fetchButton.addEventListener("click", () => {  
        console.log("Check Policies button clicked");  
        ask();  
      });  
    }  
  }  
  
  function showhideAnswer() {  
    const answerDiv = document.querySelector('.ask-answer-container');  
    const answerRDiv = document.querySelector('.ask-results-container');  
    const answerRTDiv = document.querySelector('.ask-results-title');  
  
    if (!answerDiv || !answerRDiv || !answerRTDiv) {  
      console.error('One or more elements not found:', {  
        answerDiv,  
        answerRDiv,  
        answerRTDiv  
      });  
      return;  
    }  
  
    const isVisible = answerDiv.style.display === "block";  
    const isVisibleR = answerRDiv.style.display === "block";  
    const isVisibleRT = answerRTDiv.style.display === "block";  
  
    answerDiv.style.display = isVisible ? "none" : "block";  
    answerRDiv.style.display = isVisibleR ? "none" : "block";  
    answerRTDiv.style.display = isVisibleRT ? "none" : "block";  
  
    document.getElementById("ask-answer-header").textContent = isVisible ? "▼ Answer" : " ► Answer";  
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