export async function document_summary() {
    // Clear the container content before adding new results
    const container = document.getElementById("summary-container");
    const container_bk = container.innerHTML;
    const pfendpoint = localStorage.getItem('pfendpoint')      
      
    if (container) {
      container.innerHTML = "";  // Clear existing content
    }
  
    const contspinner = document.createElement("div");
    contspinner.id = "summary-spinner";
    contspinner.classList.add("spinner");
    contspinner.style.display = "block";
    container.appendChild(contspinner);


    document.getElementById("index-doc-spinner").style.display = "flex";
    // await new Promise(r => setTimeout(r, 1000));
    // document.getElementById("index-doc-spinner").style.display = "none";
  
  
    // Start Word run context
    return Word.run(async (context) => {
      try {
        // run only if policyData in cache is empty
        
            
        //localStorage.setItem('filename', properties.title);


      if (localStorage.getItem('FullSummaryData') == null) {
        // const properties = context.document.properties; extract file properties. may be usfull later
        // properties.load()
        // await context.sync();
              
              // Make the API call to get the data  ---------- Remember to remove this line ---------------
        const response = await fetch(pfendpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query_type: 1,
              filename: localStorage.getItem('filename')
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
function displaySummaryData1(policyData) {
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

  function displaySummaryData(policyData) {
    const container = document.getElementById("summary-container");
    if (container) {
        container.innerHTML = ""; // Clear any existing content
    }

    // Validate policyData
    if (!policyData || !Array.isArray(policyData)) {
        console.error("Invalid policy data structure.");
        container.innerHTML = "<p>Unable to display content. Please check the data structure.</p>";
        return;
    }

    // Display the overall document summary at the top (if applicable)
    const summaryDiv = document.createElement("div");
    summaryDiv.classList.add("document-summary");

    const summaryTitle = document.createElement("h3");
    summaryTitle.textContent = "Document Summary";
    summaryTitle.id = "doc-summary-result-title";
    summaryTitle.addEventListener("click", () => showHideSummary(policyData)); // Toggle on click
    summaryDiv.appendChild(summaryTitle);

    const summaryText = document.createElement("p");
    summaryText.textContent = "This is the overall document summary (if applicable)."; // Placeholder
    summaryText.id = "doc-summary-summary-text";
    summaryDiv.appendChild(summaryText);

    container.appendChild(summaryDiv);

    const summaryh2 = document.createElement("h4");
    summaryh2.textContent = "Sections Summary List";
    summaryh2.id = "doc-summary-sections-title";
    container.appendChild(summaryh2);

    // Loop through each section in policyData
    policyData.forEach((section, index) => {
        // Create the main container for each section
        const sectionDiv = document.createElement("div");
        sectionDiv.classList.add("doc-summary-container");
        sectionDiv.id = `doc-summary-item-${index}`;

        // Check compliance and severity for coloring
        if (!section.isCompliant && section.NonCompliantPolicies) {
            section.NonCompliantPolicies.forEach(policy => {
                if (policy.severity === 2) {
                    sectionDiv.style.border = "3px solid yellow";
                } else if (policy.severity === 1) {
                    sectionDiv.style.border = "3px solid red";
                } else {
                    sectionDiv.style.border = "3px solid green";
                }
            });
            sectionDiv.style.borderRadius = "10px"; // Optional: Make it rounded for better visibility
            sectionDiv.style.padding = "10px"; // Optional: Add padding inside the border
        }

        // Create the header with title
        const headerDiv = document.createElement("div");
        headerDiv.classList.add("doc-summary-header");
        headerDiv.style.cursor = "pointer"; // Cursor to indicate clickable element
        headerDiv.addEventListener("click", () => toggleContent(index)); // Toggle on click

        const title = document.createElement("span");
        title.classList.add("doc-summary-title");
        title.textContent = section.title || "Untitled";

        const toggleMarker = document.createElement("span");
        toggleMarker.classList.add("toggle-marker");
        toggleMarker.textContent = "▼"; // Downward triangle indicator

        headerDiv.appendChild(title);
        headerDiv.appendChild(toggleMarker);
        sectionDiv.appendChild(headerDiv);

        // Add section details (initially hidden)
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("doc-summary-content");
        contentDiv.id = `doc-summary-content-${index}`;
        contentDiv.style.display = "none"; // Hide the content initially

        // Define the section details
        const details = [
            { label: "Summary", value: section.summary || "No summary available" },
            { label: "Compliance Status", value: section.isCompliant ? "Compliant" : "Non-Compliant" }, // need to make it in color
            { label: "Compliant Items", value: section.CompliantCollection.join(", ") || "None" }
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

// Create a container for Non-Compliant Items with detailed information
if (Array.isArray(section.NonCompliantPolicies) && section.NonCompliantPolicies.length > 0) {
  const nonCompliantDiv = document.createElement("div");
  nonCompliantDiv.classList.add("doc-summary-field", "non-compliant-container"); // Add custom styling class

  const nonCompliantTitle = document.createElement("div");
  nonCompliantTitle.classList.add("field-title");
  nonCompliantTitle.textContent = "Non-Compliant Items:";

  const nonCompliantDetailsDiv = document.createElement("div");
  nonCompliantDetailsDiv.classList.add("non-compliant-items");

  section.NonCompliantPolicies.forEach(policy => {
      const policyContainer = document.createElement("div");
      policyContainer.classList.add("policy-container");
      policyContainer.style.border = "1px solid #ddd"; // Default border
      policyContainer.style.borderRadius = "10px";
      policyContainer.style.padding = "10px";
      policyContainer.style.marginBottom = "10px";

      // Policy Title
      const policyTitle = document.createElement("div");
      policyTitle.classList.add("field-title");
      policyTitle.style.fontWeight = "bold"; // Bold title
      policyTitle.textContent = `Policy: ${policy.title}`;

      // Policy Instruction
      const policyInstruction = document.createElement("div");
      policyInstruction.style.fontWeight = "bold"; // Bold title
      policyInstruction.textContent = "Instruction: ";

      const policyInstructionText = document.createElement("span");
      policyInstructionText.style.fontWeight = "normal"; // Normal for instruction text
      policyInstructionText.textContent = policy.instruction;

      policyInstruction.appendChild(policyInstructionText);

      // Policy Severity
      const policySeverity = document.createElement("div");
      policySeverity.style.fontWeight = "bold"; // Bold title
      const severityText = document.createElement("span");
      severityText.textContent = policy.severity === 1 ? "Critical" : "Warning";

      // Set color based on severity
      severityText.style.color = policy.severity === 1 ? "red" : "orange";
      policySeverity.textContent = "Severity: ";
      policySeverity.appendChild(severityText);

      // Policy Tags styled as tags in the main code
      const policyTagsDiv = document.createElement("div");
      policyTagsDiv.classList.add("key-items"); // Reuse tag styling

      policy.tags.forEach(tag => {
          const tagElement = document.createElement("span");
          tagElement.classList.add("key-item"); // Reuse the "key-item" class
          tagElement.textContent = tag;
          policyTagsDiv.appendChild(tagElement);
      });

      // Append all details to the policyContainer
      policyContainer.appendChild(policyTitle);
      policyContainer.appendChild(policyInstruction);
      policyContainer.appendChild(policySeverity);
      policyContainer.appendChild(policyTagsDiv); // Tags moved to the bottom

      // Append policyContainer to the nonCompliantDetailsDiv
      nonCompliantDetailsDiv.appendChild(policyContainer);
  });

  // Append the title and details div to the nonCompliantDiv
  nonCompliantDiv.appendChild(nonCompliantTitle);
  nonCompliantDiv.appendChild(nonCompliantDetailsDiv);

  // Append the nonCompliantDiv to the main contentDiv
  contentDiv.appendChild(nonCompliantDiv);
}



        // Create the Key Phrases section as tags
        if (Array.isArray(section.keyphrases) && section.keyphrases.length > 0) {
            const keyPhrasesDiv = document.createElement("div");
            keyPhrasesDiv.classList.add("doc-summary-field");

            const keyPhrasesTitle = document.createElement("div");
            keyPhrasesTitle.classList.add("field-title");
            keyPhrasesTitle.textContent = "Key Phrases:";

            const keyPhrasesTagsDiv = document.createElement("div");
            keyPhrasesTagsDiv.classList.add("key-items");

            // Loop through keyphrases and create tag elements
            section.keyphrases.forEach(phrase => {
                const tag = document.createElement("span");
                tag.classList.add("key-item");
                tag.textContent = phrase;
                keyPhrasesTagsDiv.appendChild(tag);
            });

            keyPhrasesDiv.appendChild(keyPhrasesTitle);
            keyPhrasesDiv.appendChild(keyPhrasesTagsDiv);

            contentDiv.appendChild(keyPhrasesDiv);
        }

        const goToButton = document.createElement("button");
        goToButton.classList.add("search-button");
        goToButton.textContent = "Go to";

        goToButton.addEventListener("click", () => {
            findInDocument(section.title);
        });

        contentDiv.appendChild(goToButton);

        // Append the content div to the section container
        sectionDiv.appendChild(contentDiv);
        container.appendChild(sectionDiv);
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