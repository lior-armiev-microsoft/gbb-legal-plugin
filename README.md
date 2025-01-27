
# Ally - AI Contract Assistant

### Solution Overview 

__Ally – AI Contract Assistant__ is a contract analysis and review tool featuring a Word plugin that uses Azure OpenAI Service for analyzing contracts, real-time Q&A, and auto-markup based on legal policies. It helps legal professionals converse naturally, verify clauses, identify risks, and ensure consistency in reviews, saving time and boosting efficiency. 

__Ally – AI Contract Assistant__  is an innovative solution meticulously crafted to transform the landscape of contract analysis and review for legal professionals. This sophisticated tool harnesses the power of advanced artificial intelligence to streamline the intricate processes of document summarization, comprehensive contract analysis and review, legal policy compliance verification, and the application of corrections and redlining. By integrating seamlessly with Microsoft Word within the Office 365 suite, the plugin provides a native and intuitive user experience. 

At the heart of this plugin is the robust infrastructure of Azure, coupled with Azure AI’s cutting-edge capabilities, delivering an unparalleled end-to-end contract analysis and review solution. This integration not only enhances the speed and accuracy of contract processing but also ensures that legal professionals can focus on more strategic aspects of their work. 

__Ally – AI Contract Assistant__  is designed with flexibility and scalability in mind. Its open-source code base allows organizations to tailor the solution to their unique requirements, offering a customizable platform that can evolve alongside changing business needs. Whether deployed in a local environment or within a larger cloud-based infrastructure using Docker and Azure Kubernetes Service (AKS), this plugin adapts to diverse IT architectures, ensuring optimal performance and reliability. 

By leveraging this plugin, legal professionals can significantly reduce the time spent on manual tasks, thereby increasing overall productivity and enabling a sharper focus on delivering value to clients. Embrace the future of legal technology with a solution that combines Microsoft’s best-of-breed offerings to redefine efficiency and efficacy in legal contract analysis and review. 

### Key Features 

- Efficient Contract Analysis & Review: Streamline the process of contract review with AI-driven summarization and analysis. 
- Policy and Compliance Checks: Ensure compliance with company legal policies through integrated policy checks. 
- Customizable Solution: Modify and extend functionalities with access to the open-source code. 
- Flexible Deployment Options: Deploy locally or use Docker with AKS, or integrate with Azure AI Foundry and PromptFlow. 

### Business Impact: 

Legal professionals spend about 50% of their time reviewing repetitive contracts, which is a major source of frustration and reduces their ability to focus on strategic tasks. This manual workload negatively impacts employee morale, leading to burnout, high turnover rates and inefficiencies in the contract review process. ​ 

Enabled by the Azure OpenAI Service, Ally – AI Contract Assistant offers significant business impact through contract analysis and review, saving time, and enhancing the delivery of legal services.  

### Industry​

 - Legal / Professional Services​ 

### Personas​ 

- Legal counsel​ 
- Contract management​ 
- Legal operations​ 
- Procurement​ 
- Risk management and compliance​ 
- Regulators​ 
- Professional Services Firms​ 
  
## Key Features  
  
- **Efficient Contract Review:** Streamline the process of contract review with AI-driven summarization and analysis.  
- **Policy and Compliance Checks:** Ensure compliance with company policies through integrated policy checks.  
- **Customizable Solution:** Modify and extend functionalities with access to the open-source code.  
- **Flexible Deployment Options:** Deploy locally or use Docker with AKS, or integrate with Azure AI Studio and PromptFlow.  
  
## Architecture  
  
The plugin's architecture consists of a front-end UI, developed in JavaScript, integrated directly into Microsoft Word as an Office 365 plugin. The back end employs Azure PromptFlow, which acts as an orchestration engine triggered by plugin commands. PromptFlow operates in AKS with Docker or in Azure AI Studio, utilizing two Azure AI Search indexes—one for document data and another for company policy. The runtime for PromptFlow is Python, enabling Azure OpenAI LLM calls for summarization and compliance checks. The solution's configuration, including API keys, is stored within the plugin and can be modified via the configuration tab.  
  
![High-Level Design](./files/ally-hld.png)

## Prerequisites  
  
To install and run the plugin locally, ensure you have the following:  
  
- Office 365  
- Node.js and NPM  
- Python  
- Visual Studio Code  
- PromptFlow libraries  
- Azure OpenAI with GPT-4o model and Ada-002 for embedding  
- Azure AI Search (Basic tier)  
- Azure AI Studio for PromptFlow or AKS for Docker usage  

> [!NOTE]  
> Use Azure OpenAi GPT4o with the `2024-08-06` model version

## Installation
  
**Local Installation:**  
  
1. Ensure all prerequisites are installed.  
2. Clone the repository to your local machine. 
3. Navigate to the solution directory.  
4. Run `npm install` to install dependencies.  
5. Start the plugin with `npm start`.  

>[!NOTE]
> Next Steps are for the backend server (PromptFlow), there are 2 options, runing local PF or runing Docker file, the Docker is recomanded for fast Demo, the local is recomanded for development and debug

6. Go to the PrompFlow  folder
7. If NOT using Docker with PromptFlow you will need to create 1 local connector in PF
this can be done using PF Extention, please install PromptFlow Extention for VS Code,

![Extention](./files/Screenshot%202025-01-05%20133207.png)

> [!NOTE]
> please do install all PF prereqesist listed under the extention.

8. create a connector under the connectrs tub with the name "ally"

![Connector](./files/Screenshot%202025-01-05%20133650.png)

in the opened screen fill in the next information:

```
$schema: https://azuremlschemas.azureedge.net/promptflow/latest/CustomConnection.schema.json
name: "ally"
type: custom
configs:
  openai_endpoint: "https://xxxxxxxxxx.openai.azure.com/"
  search_document_index: "legal-documents"
  search_policy_index: "legal-instructions"
  openai_model_deployment: "gpt4o"
  openai_embedding_deployment: "ada002"
  openai_api_version: "2024-08-01-preview"
  search_endpoint: "https://xxxxxxxx.search.windows.net"
secrets:
  openai_key: "<user-input>"
  search_key: "<user-input>"
```
> [!NOTE]
> remove all unneeded key/paramiters like key1 if its shows in the created schema before you save

> [!NOTE]
> the name "ally" is used in the ymal file so if you choose to use a connector with diffrent name, do change it in the PF yaml

8. Run `pf flow serve --source . --port 8083 --host localhost`
9. This will load a local web on port `8083` and can be used by the Plugin
10. ***/cofig/cofig.json*** file need to hold the endpoint of the PromptFlow endpoint under the `prompt-flow-endpoint`
    for exmaple `"prompt-flow-endpoint" : "http://localhost:8083/score"` for local run of PF


**Office 365 Deployment:**  
  
- under Development there is no need to do any changes under Office, as this repo will create and aloocate the plugin localy on this muchine
- in production there are steps to create an Add on in the Addon list and provide the URL for the location of the deployment under Azure WebApp

[Deploy and publish Office Add-ins](https://learn.microsoft.com/en-us/office/dev/add-ins/publish/publish)
  
## Azure Services Configuration  
  
### Azure Search
- for the solution to work where will need to be Azure Search 2 Indexes:
    - `legal-instructions`
        This Index is holding add customer Policy Chunks with the next table fields:

        | Field Name | Type | Description | 
        | ---------- | ---- | ----------- |
        | id | Int32 | Key
        | title | String | Policy Title
        | instruction | String | Policy instructions
        | embeding | SingleCollection | Embedding of the policy instruction 
        | tags | StringCollection | tags
        | locked | Boolean | is changeble
        | groups | StringCollection | list of Active Directory ID's that are related to this policy
        | severity | Int32 | 2 - Warning, 1 - Critical


    - `legal-documents`
        This Index is holding all the chunks of the Documents provided for the plugin review:
        | Field Name | Type | Description |
        | ---------- | ---- | ----------- |
        | id | Int32 | Key
        | title | String | 
        | paragraph | String |
        | keyphrases | StringCollection | Generated by Skill and LLM
        | summary | String | Generated by Skill and LLM
        | embedding | SingleCollection | Embedding ada002
        | filename | String | 
        | department | String | for filtter if needed 
        | data | DateTimeOffset | 
        | group | StringCollection | this is a list of AD Permissions for extraction of the chunk
        | isCompliant | Boolean | Skill that by LLM check for compliance 
        | CompliantCollection | StringCollection | List of relevan Policies
        | NonCompliantCollection | StringCollection | List of relevan Policies

    
## Deployment to AKS or Docker  
  
The solution includes a Docker folder within the PromptFlow directory for deployment. After deployment in the PromptFlow connector, update the endpoint information. Ensure connection parameters for OpenAI and Azure Search are set correctly.  

Working with the Docker file steps:
1. Go to docker folder in the project
2. Run `docker build -t {Give you name for the container} .`
3. Run the container with port `8083` and the next paramiters:

- configs:
  - "ALLY_OPENAI_ENDPOINT=https://xxxxxx.openai.azure.com/",
  - "ALLY_SEARCH_DOCUMENT_INDEX=legal-documents",
  - "ALLY_SEARCH_POLICY_INDEX=legal-instructions",
  - "ALLY_OPENAI_MODEL_DEPLOYMENT=gpt4o",
  - "ALLY_OPENAI_EMBEDDING_DEPLOYMENT=ada002",
  - "ALLY_OPENAI_API_VERSION=2024-08-01-preview",
  - "ALLY_SEARCH_ENDPOINT=https://yyyyy.search.windows.net",

- secrets:
  - "ALLY_OPENAI_KEY=xxxxxxx",
  - "ALLY_SEARCH_KEY=yyyyyyy",

4. Run the Word Plugin: 
- 4.1. Navigate to the solution directory.  
- 4.2. Run `npm install` to install dependencies.  
- 4.3. Start the plugin with `npm start`. 
    
## Intellectual Property and Licensing  
  
This plugin is free to use and modify by anyone. The GitHub repository is also free to use and change.  
  
## Team behind Ally – AI Contract Assistant 

- **Esther Dediashvili** – Senior Solution Specialist – AI Global Black Belt, EMEA    
- **Lior Armiev** – Senior Technical Specialist​ – AI Global Black Belt, EMEA    
- **Andrew Mackay** – AI Director – Global Black Belts, CEMA 

## Demo

[![IMAGE ALT TEXT HERE](./files/youtube.png)](https://www.youtube.com/watch?v=-powTAGvKu0)


## Contributing  
  
We welcome contributions from the community. Feel free to create a pull request or leave comments. All contributions will be reviewed. 
  
## Reporting Issues and Contributions  
  
Please email any issues or contributions to [liorarmiev@microsoft.com](mailto:liorarmiev@microsoft.com).  