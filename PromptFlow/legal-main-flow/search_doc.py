from promptflow.core import tool
from promptflow.connections import CustomConnection
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery

@tool
def search_doc_tool(query:str, embedinginput:list, searchconnection: CustomConnection) -> object:
    search_endpoint = searchconnection.endpoint
    search_index = "legal-documents"
    search_key = searchconnection.key
    # use ai azure search to query 
    
    vector_query = VectorizedQuery(king="vector", vector=embedinginput, k_nearest_neighbors=1, fields="embedding")

    search_client = SearchClient(search_endpoint, search_index, AzureKeyCredential(search_key))
    results = search_client.search(
        search_text=query,  # Use '*' to match all documents
        vector_queries=[vector_query],
        select="title,paragraph,keyphrases,summary",     # Specify the fields to include in the results
        top=3
    )
    policy_list = []
    for result in results:
        policy_list.append({"title": result["title"], "paragraph": result["paragraph"], "keyphrases": result["keyphrases"], "summary": result["summary"]})
        
    return policy_list
