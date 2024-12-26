from promptflow.core import tool
from promptflow.connections import CustomConnection
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery

@tool
def list_policy_tool(query: str, embeding:list, searchconnection: CustomConnection, groups: list) -> object:
    search_endpoint = searchconnection.endpoint
    search_index = searchconnection.policy_index
    search_key = searchconnection.key    
    
    vector_query = VectorizedQuery(king="vector", vector=embeding, k_nearest_neighbors=1, fields="embeding")     

    search_client = SearchClient(search_endpoint, search_index, AzureKeyCredential(search_key))
    group_filter = "adgroup/any(t: search.in(t, '{}'))".format(",".join(groups))
    results = search_client.search(
        search_text=query,  # Use '*' to match all documents
        filter=group_filter, 
        vector_queries=[vector_query],
        select="title,instruction"     # Specify the fields to include in the results
    )
    policy_list = []
    for result in results:
        policy_list.append({"title": result["title"], "instruction": result["instruction"]})
        
    return policy_list
