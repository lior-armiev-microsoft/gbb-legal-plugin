
from promptflow.core import tool
from promptflow.connections import CustomConnection
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient

# The inputs section will change based on the arguments of the tool function, after you save the code
# Adding type to arguments and return value will help the system show the types properly
# Please update the function name/signature per need
@tool
def list_policy_tool(filename:str, searchconnection: CustomConnection) -> object:
    search_endpoint = searchconnection.endpoint
    search_index = "legal-documents"
    search_key = searchconnection.key
    # use ai azure search to query 

    search_client = SearchClient(search_endpoint, search_index, AzureKeyCredential(search_key))
    results = search_client.search(
        search_text=filename,  # Use '*' to match all documents
        select="filename"     # Specify the fields to include in the results
    )

    policy_list = []
    for result in results:
        policy_list.append({"filename": result["filename"]})

    count = len(policy_list)
    if count == 0:
        return 0 # not indexed
    else:
        return 1 # indexed