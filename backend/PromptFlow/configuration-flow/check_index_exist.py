
from promptflow import tool
from promptflow.connections import CustomConnection
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient

# The inputs section will change based on the arguments of the tool function, after you save the code
# Adding type to arguments and return value will help the system show the types properly
# Please update the function name/signature per need
@tool
def my_python_tool(filename: str, user_config: object, searchconnection:CustomConnection) -> str:
    search_endpoint = searchconnection.search_endpoint
    search_index = searchconnection.search_document_index
    search_key = searchconnection.search_key    

    search_client = SearchClient(search_endpoint, search_index, AzureKeyCredential(search_key))
    # filter for the groups and where filename is the same
    #group_filter = "adgroup/any(t: search.in(t, '{}'))".format(",".join(groups))
    filter = "filename eq '{}'".format(filename)
    results = search_client.search(
        search_text="*",  # Use '*' to match all documents
        filter=filter,
        include_total_count=True  # Include the total count in the results
    )
    count = results.get_count()  # Get the total count of matching documents
    if count:
        return True
    else:
        return False