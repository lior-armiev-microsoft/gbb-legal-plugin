export async function document_summary() {
    // Clear the container content before adding new results
    const container = document.getElementById("summary-container");
    const container_bk = container.innerHTML;
  
    console.log("Container html: ", container_bk);
  
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
      
        // run only if policyData in cache is empty
      if (localStorage.getItem('FullSummaryData') == null) {
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
          console.log(data.answer);
  
          /// save answer to cache
          localStorage.setItem('FullSummaryData', JSON.stringify(data.answer));
        }
        else
        {
          console.log("Summary data already in cache:");
          console.log(localStorage.getItem('FullSummaryData'));
        }
  
        // Call the function to display the data in the container
        displaySummaryData(JSON.parse(localStorage.getItem('FullSummaryData')));  
      } catch (error) {
        showErrorMessage(error)
        document.getElementById("summary-spinner").style.display = "none";
        container.innerHTML = "<h2>Summary</h2><p>Summarize the document to get a quick overview of the key clauses and provisions</p>"
        const trygainButton = document.createElement("button");
        trygainButton.classList.add("search-button");
        trygainButton.textContent = "Try Again";
        trygainButton.addEventListener("click", document_summary);
        container.appendChild(trygainButton);
        console.error("Error: " + error);
      }
    });
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
    summaryTitle.id = "doc-summary-result-title";
    summaryTitle.addEventListener("click", () => showHideSummary(policyData));  // Toggle on click
    summaryDiv.appendChild(summaryTitle);
  
    const summaryText = document.createElement("p");
    summaryText.textContent = policyData.Summary || "No summary available";
    summaryText.id = "doc-summary-summary-text";
    summaryDiv.appendChild(summaryText);
  
    container.appendChild(summaryDiv);
    
    const summaryh2 = document.createElement("h4");
    summaryh2.textContent = "Paragraphs Summary List";
    summaryh2.id = "doc-summary-paragraphs-title";
    container.appendChild(summaryh2);

    // Loop through each item in the Items array and add collapsible sections
    policyData.Items.forEach((item, index) => {
        // Create the main container for each item
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("doc-summary-container");
        itemDiv.id = `doc-summary-item-${index}`;
  
        // Create the header with title
        const headerDiv = document.createElement("div");
        headerDiv.classList.add("doc-summary-header");
        headerDiv.style.cursor = "pointer";  // Cursor to indicate clickable element
        headerDiv.addEventListener("click", () => toggleContent(index));  // Toggle on click
  
        const title = document.createElement("span");
        title.classList.add("doc-summary-title");
        title.textContent = item.title || "Untitled";
  
        const toggleMarker = document.createElement("span");
        toggleMarker.classList.add("toggle-marker");
        toggleMarker.textContent = "▼";  // Downward triangle indicator
  
        headerDiv.appendChild(title);
        headerDiv.appendChild(toggleMarker);
        itemDiv.appendChild(headerDiv);
  
        // Add item details (initially hidden)
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("doc-summary-content");
        contentDiv.id = `doc-summary-content-${index}`;
        contentDiv.style.display = "none";  // Hide the content initially
  
        // Define the item details
        const details = [
            { label: "Summary", value: item.summary || "No summary available" },
            { label: "Notes", value: item.notes || "No notes available" }
        ];
  
        // Add the details to the content div
        details.forEach(detail => {
            const detailDiv = document.createElement("div");
            detailDiv.classList.add("doc-summary-field");
  
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
          keyItemsDiv.classList.add("doc-summary-field");
  
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
  
    // Always create the Review button at the end
    const reviewButton = document.createElement("button");
    reviewButton.classList.add("search-button");
    reviewButton.textContent = "Run Check Again";
    reviewButton.addEventListener("click", document_summary);
    container.appendChild(reviewButton);
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
    const contentDiv = document.getElementById(`doc-summary-content-${index}`);
    contentDiv.style.display = (contentDiv.style.display === "none") ? "block" : "none";
  }
  


  function showHideSummary(policyData) {    
    const summaryText = document.getElementById("doc-summary-summary-text");
    summaryText.style.display = (summaryText.style.display === "none") ? "block" : "none";

    const docsummaryparagraphstitle = document.getElementById("doc-summary-paragraphs-title");
    docsummaryparagraphstitle.style.display = (docsummaryparagraphstitle.style.display === "none") ? "block" : "none";

    policyData.Items.forEach((item, index) => {
      const contentDiv = document.getElementById(`doc-summary-item-${index}`);
      console.log(contentDiv);
      contentDiv.style.display = (contentDiv.style.display === "none") ? "block" : "none";
    }
  )
   
  document.getElementById("doc-summary-result-title").textContent = summaryText.style.display === "none" ? "▼ Document Summary" : " ► Document Summary";
  }    