
from promptflow.core import tool
from promptflow.connections import CustomConnection
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient

# The inputs section will change based on the arguments of the tool function, after you save the code
# Adding type to arguments and return value will help the system show the types properly
# Please update the function name/signature per need
@tool
def list_policy_tool(input:str, searchconnection: CustomConnection) -> object:
    search_endpoint = searchconnection.endpoint
    search_index = "legal-instructions"
    search_key = searchconnection.key
    # use ai azure search to query 

    search_client = SearchClient(search_endpoint, search_index, AzureKeyCredential(search_key))
    results = search_client.search(
        search_text="*",  # Use '*' to match all documents
        select="title,instruction"     # Specify the fields to include in the results
    )
    policy_list = []
    for result in results:
        policy_list.append({"title": result["title"], "instruction": result["instruction"]})
        
    return policy_list
