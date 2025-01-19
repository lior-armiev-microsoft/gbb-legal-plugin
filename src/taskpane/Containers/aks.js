import { constrainedMemory } from "process";

// Function to ask a question and display search results  
export async function ask() {  
  const container = document.getElementById("ask-container");  
  const pfendpoint = localStorage.getItem('pfendpoint');
  const language = localStorage.getItem('language');

  console.log("Entered ask function with the next parameters: ");
  console.log("Endpoint: ", pfendpoint);
  console.log("Language: ", language);

  // Validate input and handle errors  
  let query;  
  try {  
      query = document.getElementById("ask-input").value;  
      console.log("Query: ", query);  
  } catch (error) {  
      console.error("Error retrieving query: ", error);  
      return;  
  }  

  // Clear existing content if container exists  
  if (container) {  
      container.innerHTML = "";  
  }  

  // Display the question at the top of the container  
  const questionHeader = document.createElement("h3");  
  questionHeader.textContent = `Question: ${query}`;  
  questionHeader.classList.add("question-header");  
  container.appendChild(questionHeader);  

  // Display a loading spinner  
  const spinner = createSpinner();  
  container.appendChild(spinner);  

  try {  
      // Execute Word API call  
      await Word.run(async (context) => {  
          
          // convert JSON.parse(localStorage.getItem('groups')) to string
          const groups = JSON.parse(localStorage.getItem('groups')).toString();

          const response = await fetchData(pfendpoint, query, language, groups);  
          console.log("Response: ", response);
          const data = await response.json();  
          displaySearchResults(data.answer);  
      });  
  } catch (error) {  
      console.error("Error during API call or data processing: ", error);  
  }  
}  

// Helper function to create a loading spinner  
function createSpinner() {  
  const spinner = document.createElement("div");  
  spinner.id = "ask-spinner";  
  spinner.classList.add("spinner");  
  spinner.style.display = "block";  
  return spinner;  
}  

// Fetch data from API  
async function fetchData(endpoint, query, language, groups) {  
  console.log("Entered fetchData function with the next parameters: ");
  console.log("Endpoint: ", endpoint);
  console.log("Query: ", query);
  console.log("Language: ", language);
  console.log("Groups: ", groups);
  console.log("Groups type: ", typeof(groups));
  
  return await fetch(endpoint, {  
      method: 'POST',  
      headers: {  
          'Content-Type': 'application/json'  
      },  
      body: JSON.stringify({  
          query_type: 3,
          question: query,  
          language: language,
          groups: groups
      })  
  });  
}  

// Display search results  
function displaySearchResults(data) {  
  const container = document.getElementById("ask-container");  
  if (container) {  
      container.innerHTML = ""; // Clear previous content  
  }  

  console.log("Data: ", data)
  console.log(typeof(data))

  // Create and append elements to display results  
  const header = createHeader();  
  container.appendChild(header);  
    
  const answerDiv = createAnswerDiv(data.Answer);  
  container.appendChild(answerDiv);  

  // check if there are search results not empty. the SearchResults:  undefined
  if (data.SearchResults !== undefined && data.SearchResults.length > 0) {
    console.log("SearchResults: ", data.SearchResults);
    const resultsDiv = createResultsDiv(data.SearchResults);  
    container.appendChild(resultsDiv);
  }

  const tryAgainButton = createTryAgainButton();  
  container.appendChild(tryAgainButton);  
}  

// Create header for the answer  
function createHeader() {  
  const header = document.createElement("h2");  
  header.textContent = "Answer:";  
  header.id = "ask-answer-header";  
  header.addEventListener("click", showhideAnswer);  
  return header;  
}  

// Create a div to hold the answer content  
function createAnswerDiv(answer) {  
  const answerDiv = document.createElement("div");  
  answerDiv.classList.add("ask-answer-container");  
  const answerContent = document.createElement("p");  
  answerContent.textContent = answer;  
  answerDiv.appendChild(answerContent);  
  return answerDiv;  
}  

// Create a section for the list of search results  
function createResultsDiv(results) {
  const resultsDiv = document.createElement("div");  
  resultsDiv.classList.add("ask-results-container");  

  const resultsTitle = document.createElement("h3");  
  resultsTitle.textContent = "Relevant Cluses:";  
  resultsTitle.id = "ask-results-title";  
  resultsTitle.classList.add("ask-results-title");  
  resultsDiv.appendChild(resultsTitle);  

  results.forEach((result) => {  
      const resultItem = createResultItem(result);  
      resultsDiv.appendChild(resultItem);  
  });  

  return resultsDiv;  
}  

// Create an individual result item  
function createResultItem(result) {  
  const resultItem = document.createElement("div");  
  resultItem.classList.add("result-item");  
  resultItem.textContent = result.title;  

  const additionalLine = document.createElement("p");  
  additionalLine.classList.add("result-description");  
  additionalLine.textContent = result.summary;  

  const keyItemsTagsDiv = createKeyItemsTagsDiv(result.keyphrases);  

  resultItem.addEventListener("click", () => {  
      findInDocument(result.title);  
  });  

  resultItem.appendChild(additionalLine);  
  resultItem.appendChild(keyItemsTagsDiv);  
  return resultItem;  
}  

// Create a div for key item tags  
function createKeyItemsTagsDiv(keyphrases) {  
  const keyItemsTagsDiv = document.createElement("div");  
  keyItemsTagsDiv.classList.add("key-items");  

  keyphrases.forEach((keyItem) => {  
      const tag = document.createElement("span");  
      tag.classList.add("key-item");  
      tag.textContent = keyItem;  
      keyItemsTagsDiv.appendChild(tag);  
  });  

  return keyItemsTagsDiv;  
}  

// Create a button to reset and search again  
function createTryAgainButton() {  
  const tryAgainButton = document.createElement("button");  
  tryAgainButton.classList.add("search-button");  
  tryAgainButton.textContent = "Search Again";  
  tryAgainButton.addEventListener("click", resetPolicyContainer);  
  return tryAgainButton;  
}  

// Reset the policy container to initial state  
function resetPolicyContainer() {  
  const container = document.getElementById("ask-container");  
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
  fetchButton.addEventListener("click", ask);  
}  

// Show or hide the answer and results  
function showhideAnswer() {  
  const answerDiv = document.querySelector('.ask-answer-container');  
  const answerRDiv = document.querySelector('.ask-results-container');  
  const answerRTDiv = document.querySelector('.ask-results-title');  

  if (!answerDiv || !answerRDiv || !answerRTDiv) {  
      console.error('One or more elements not found:', { answerDiv, answerRDiv, answerRTDiv });  
      return;  
  }  

  const isVisible = answerDiv.style.display === "block";  
  answerDiv.style.display = isVisible ? "none" : "block";  
  answerRDiv.style.display = isVisible ? "none" : "block";  
  answerRTDiv.style.display = isVisible ? "none" : "block";  

  document.getElementById("ask-answer-header").textContent = isVisible ? "▼ Answer" : " ► Answer";  
}  

// Find text in a Word document  
function findInDocument(text) {  
  Word.run(async (context) => {  
      const searchResults = context.document.body.search(text, { ignorePunct: true });  
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