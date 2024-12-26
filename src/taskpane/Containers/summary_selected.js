// Function to summarize and process the selected text  
let storedSelectedText = "";
var selectedOoxml = ""; 

export async function summary() {  
  // Clear the container content before adding new results  
  const container = document.getElementById("policy-container");  
  const pfendpoint = localStorage.getItem('pfendpoint');  
  const language = localStorage.getItem('language');

  console.log("Summary function called with next parms: ", pfendpoint, language);
    
  if (container) {  
      container.innerHTML = "";  // Clear existing content  
  }  
    
  // Create and show a loading spinner  
  const contspinner = document.createElement("div");  
  contspinner.id = "policy-spinner";  
  contspinner.classList.add("spinner");  
  contspinner.style.display = "block";  
  container.appendChild(contspinner);  
    
  // Start Word run context  
  return Word.run(async (context) => {  
      try {  
          const selectedText = context.document.getSelection();  
          selectedText.load("text");
          await context.sync();  
            
          // Check if the selected text is empty  
          if (!selectedText.text) {  
              displayNoTextSelectedMessage();  
          } else {  
              await processSelectedText(selectedText.text, pfendpoint, language);  
          }  
      } catch (error) {  
          console.error("Error: " + error);  
          // Hide the spinner in case of an error  
          if (contspinner) {  
              contspinner.style.display = "none";  
          }  
      }  
  });  
}  

// Display a message when no text is selected  
function displayNoTextSelectedMessage() {  
  const container = document.getElementById("policy-container");  
  if (container) {  
      container.innerHTML = "";  // Clear any existing content  
  }  
  console.log("No text selected");  

  // Title for the container  
  const title = document.createElement("h2");  
  title.classList.add("policy-title");  
  title.textContent = "Review & Mark-up";  

  // Add a warning message  
  const warning = document.createElement("div");  
  warning.classList.add("warning");  
  warning.textContent = "I'm sorry, you didn't select any text. Please select a text and try again.";  
    
  // Add elements to the container  
  container.appendChild(title);  
  container.appendChild(warning);  
  container.appendChild(document.createElement("p"));  
  container.appendChild(document.createElement("hr"));  

  // Review button  
  const reviewButton = document.createElement("button");  
  reviewButton.classList.add("search-button");  
  reviewButton.textContent = "Review";  
  reviewButton.addEventListener("click", summary);  
  container.appendChild(reviewButton);  
}  

// Process the selected text by making an API call and updating the UI  
async function processSelectedText(text, endpoint, language) {  
  // Store the first 50 characters of the selected text  
  storedSelectedText = text.substring(0, 150);  

  // Save Style and formatting of the selected text
  saveSelectedText();

  console.log("selected text: ", text);
  const response = await fetch(endpoint, {  
      method: 'POST',  
      headers: {  
          'Content-Type': 'application/json'  
      },  
      body: JSON.stringify({  
          query_type: 2,  
          question: text,  
          group: localStorage.getItem('groups'),  
          language: language 
      })  
  });  

  const data = await response.json();  
  if (data.answer.warning) {  
      displayWarningMessage();  
  } else {  
      displayPolicyItems(data.answer.PolicyItems);  
  }  
}  

// Display a warning message if no policy items are found  
function displayWarningMessage() {  
  const container = document.getElementById("policy-container");  
  if (container) {  
      container.innerHTML = "";  // Clear any existing content  
  }  

  // Add title and warning messages  
  const title = document.createElement("h2");  
  title.classList.add("policy-title");  
  title.textContent = "Review & Mark-up";  
  container.appendChild(title);  

  const warning = document.createElement("div");  
  warning.classList.add("warning");  
  warning.textContent = "I'm sorry, I couldn't find any policy items in your company for the selected text.";  
  container.appendChild(warning);  

  const warning2 = document.createElement("div");  
  warning2.classList.add("warning");  
  warning2.textContent = "Please review the possible causes below and try again.";  
  container.appendChild(warning2);  

  // Create a table for possible causes  
  const table = document.createElement("table");  
  table.classList.add("causes-table");  
  const causes = [  
      "Cause 1: No matching policy found.",  
      "Cause 2: Text may be too vague.",  
      "Cause 3: System error."  
  ];  
  causes.forEach(cause => {  
      const row = document.createElement("tr");  
      const cell = document.createElement("td");  
      cell.innerHTML = `<strong>${cause.split(":")[0]}</strong>: ${cause.split(":")[1]}`;  
      row.appendChild(cell);  
      table.appendChild(row);  
  });  

  // Add elements to the container  
  container.appendChild(table);  
  container.appendChild(document.createElement("hr"));  

  // Review button  
  const reviewButton = document.createElement("button");  
  reviewButton.classList.add("search-button");  
  reviewButton.textContent = "Review Next";  
  reviewButton.addEventListener("click", summary);  
  container.appendChild(reviewButton);  
}  

// Display policy items in the UI  
function displayPolicyItems(policyItems) {  
  const container = document.getElementById("policy-container");  
  if (container) {  
      container.innerHTML = "";  // Clear any existing content  
  }  

  policyItems.forEach((item, index) => {  
      const policyDiv = createPolicyDiv(item, index);  
      container.appendChild(policyDiv);  
  });  

  // Always create the Review button at the end  
  const reviewButton = document.createElement("button");  
  reviewButton.classList.add("search-button");  
  reviewButton.textContent = "Review Next";  
  reviewButton.addEventListener("click", summary);  
  container.appendChild(reviewButton);  
}  

// Create a div for a policy item  
function createPolicyDiv(item, index) {  
  const policyDiv = document.createElement("div");  
  policyDiv.classList.add("policy-container");  

  // Create the header with title and compliance status  
  const headerDiv = document.createElement("div");  
  headerDiv.classList.add("policy-header");  
  headerDiv.style.cursor = "pointer";  
  headerDiv.addEventListener("click", () => toggleContent(index));  

  const complianceIcon = document.createElement("div");  
  complianceIcon.classList.add("compliance-icon");  
  complianceIcon.classList.add(item.iscompliant === "yes" ? "compliant" : "non-compliant");  

  const title = document.createElement("span");  
  title.classList.add("policy-title");  
  title.textContent = item.title;  

  const toggleMarker = document.createElement("span");  
  toggleMarker.classList.add("toggle-marker");  
  toggleMarker.textContent = "▼";  

  headerDiv.appendChild(complianceIcon);  
  headerDiv.appendChild(title);  
  headerDiv.appendChild(toggleMarker);  
  policyDiv.appendChild(headerDiv);  

  // Add policy details (initially hidden)  
  const contentDiv = document.createElement("div");  
  contentDiv.classList.add("policy-content");  
  contentDiv.id = `policy-content-${index}`;  
  contentDiv.style.display = "none";  
  addPolicyDetails(contentDiv, item, index);  

  policyDiv.appendChild(contentDiv);  

  return policyDiv;  
}  

// Add policy details to the content div  
function addPolicyDetails(contentDiv, item, index) {  
  const details = [  
      { label: "Summary", value: item.summary },  
      { label: "Relevant Company Policy Item", value: item.relevant_policy_item }  
  ];  

  if (item.iscompliant !== "yes") {  
      details.push({ label: "Suggested Correction", value: item.suggested_correction });  
      details.push({ label: "Suggestion based on company knowledge base", value: "" });  // Placeholder for carousel  
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

  if (item.iscompliant !== "yes") {  
      addCarousel(contentDiv, item.corrected_text);  
  }  
}  

// Add a carousel for corrected text variations  
function addCarousel(contentDiv, variations) {  
  let currentIndex = 0;  

  const carouselDiv = document.createElement("div");  
  carouselDiv.classList.add("carousel-container");  

  const correctedTextDiv = document.createElement("div");  
  correctedTextDiv.classList.add("carousel-text");  
  correctedTextDiv.textContent = variations[currentIndex];  

  const variationNumber = document.createElement("div");  
  variationNumber.classList.add("variation-number");  
  variationNumber.textContent = `${currentIndex + 1}/${variations.length}`;  

  const leftButton = document.createElement("button");  
  leftButton.classList.add("carousel-button", "carousel-left");  
  leftButton.textContent = "◀";  
  leftButton.addEventListener("click", () => {  
      if (currentIndex > 0) {  
          currentIndex--;  
          updateCarousel(correctedTextDiv, variationNumber, variations, currentIndex);  
      }  
  });  

  const rightButton = document.createElement("button");  
  rightButton.classList.add("carousel-button", "carousel-right");  
  rightButton.textContent = "▶";  
  rightButton.addEventListener("click", () => {  
      if (currentIndex < variations.length - 1) {  
          currentIndex++;  
          updateCarousel(correctedTextDiv, variationNumber, variations, currentIndex);  
      }  
  });  

  carouselDiv.appendChild(leftButton);  
  carouselDiv.appendChild(correctedTextDiv);  
  carouselDiv.appendChild(rightButton);  
  carouselDiv.appendChild(variationNumber);  

  contentDiv.appendChild(carouselDiv);  

  addCarouselButtons(contentDiv, variations[currentIndex]);  
}  

// Update carousel display  
function updateCarousel(correctedTextDiv, variationNumber, variations, currentIndex) {  
  correctedTextDiv.textContent = variations[currentIndex];  
  variationNumber.textContent = `${currentIndex + 1}/${variations.length}`;  
}  

// Add buttons for interacting with carousel content  
function addCarouselButtons(contentDiv, correctedText) {  
  const buttonContainer = document.createElement("div");  
  buttonContainer.classList.add("button-container");  

  const fixButton = document.createElement("button");  
  fixButton.textContent = "Mark-up";  
  fixButton.classList.add("search-button");  
  fixButton.addEventListener("click", () => fixText(correctedText));  
  contentDiv.appendChild(fixButton);  

  contentDiv.appendChild(document.createElement("p"));  // Add space  

  const gotoButton = document.createElement("button");  
  gotoButton.textContent = "Go To";  
  gotoButton.classList.add("search-button");  
  gotoButton.addEventListener("click", () => gotoText(correctedText));  
  contentDiv.appendChild(gotoButton);  

  contentDiv.appendChild(buttonContainer);  
}  

// Replace selected text with corrected text  
function fixText(correctedText) {  
  Word.run(async (context) => {  
      const selection = context.document.getSelection();  
      selection.load("text");  
      await context.sync();  

      // Replace the selected text with the corrected text  
      selection.insertText(correctedText, Word.InsertLocation.replace);  

      //insertCorrectedText(selectedOoxml) <------ Not working - not saving the formatting

      await context.sync();  
      console.log("Text replaced with corrected text: ", correctedText);  
  }).catch(function (error) {  
      console.log("Error: " + error);  
  });  
}  

// Go to the text in the document  
function gotoText() {  
  Word.run(async (context) => {  
      const searchResults = context.document.body.search(storedSelectedText, { matchCase: false });  
      context.load(searchResults, 'text');  
      await context.sync();  

      if (searchResults.items.length > 0) {  
          searchResults.items[0].select();  
          await context.sync();  
          console.log("Navigated to the text: ", storedSelectedText);  
      } else {  
          console.log("Text not found.");  
      }  
  }).catch(function (error) {  
      console.log("Error: " + error);  
  });  
}  

// Toggle the visibility of the policy content  
function toggleContent(index) {  
  const contentDiv = document.getElementById(`policy-content-${index}`);  
  contentDiv.style.display = (contentDiv.style.display === "none") ? "block" : "none";  
}  

// Function to insert the corrected text with formatting
function insertCorrectedText(correctedOoxml) {
    Office.context.document.setSelectedDataAsync(correctedOoxml, { coercionType: Office.CoercionType.Ooxml }, function (result) {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
            console.log("Corrected OOXML inserted successfully.");
            console.log("Corrected OOXML: ", correctedOoxml);
        } else {
            console.log("Error: " + result.error.message);
        }
    });
}

// Function to save the selected text with formatting
function saveSelectedText() {
    Office.context.document.getSelectedDataAsync(Office.CoercionType.Ooxml, function (result) {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
            selectedOoxml = result.value;
            console.log("Selected OOXML saved.");
            console.log("Selected OOXML: ", selectedOoxml);
        } else {
            console.log("Error: " + result.error.message);
        }
    });
}