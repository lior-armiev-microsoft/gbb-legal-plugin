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
            { label: "Relevant Company Policy Item", value: item.relevant_policy_item }     
        ];
  
        if (item.iscompliant !== "yes") {
          details.push({ label: "Suggested Correction", value: item.suggested_correction });
          details.push({ label: "Suggestion based on company knowledge base", value: "" });  // The field will be filled with the carousel
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
          fixButton.textContent = "Mark-up";
          fixButton.classList.add("search-button");  // Apply the new style
          fixButton.addEventListener("click", () => fixText(variations[currentIndex]));
          contentDiv.appendChild(fixButton);

          // add br 
          const br = document.createElement("p");
          contentDiv.appendChild(br);
  
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

  function toggleContentTop(index, toggleButton) {  
    const contentDiv = document.getElementById(`policy-content-${index}`);  
    const isVisible = contentDiv.style.display === "block";  
    
    contentDiv.style.display = isVisible ? "none" : "block";  
    toggleButton.textContent = isVisible ? "►" : "▼"; // Change the icon accordingly  
  }
  
  function toggleContent(index) {
    const contentDiv = document.getElementById(`policy-content-${index}`);
    contentDiv.style.display = (contentDiv.style.display === "none") ? "block" : "none";
  }