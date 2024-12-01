
from promptflow.core import tool
from promptflow.connections import CustomConnection, AzureOpenAIConnection
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from openai import AzureOpenAI
import datetime

# The inputs section will change based on the arguments of the tool function, after you save the code
# Adding type to arguments and return value will help the system show the types properly
# Please update the function name/signature per need
@tool
def my_python_tool(filename: str, input: list, searchconnection: CustomConnection, openai:AzureOpenAIConnection) -> list:
    search_endpoint = searchconnection.endpoint
    search_index = "legal-documents"
    search_key = searchconnection.key

    # Create a client
    credential = AzureKeyCredential(search_key)
    client = SearchClient(endpoint=search_endpoint,
                        index_name=search_index,
                        credential=credential)

    client = AzureOpenAI(  
        azure_endpoint=openai.api_base,  
        api_key=openai.api_key,  
        api_version="2024-08-01-preview"
    )

    def text_embeding(text):
        import json
        response  = client.embeddings.create(
                input = text,
                model= "ada002"        
        )
        json_data = json.loads(response.model_dump_json())
        return json_data['data'][0]['embedding']
        
    # for each item in input
    for item in input['chunk']:
        # add new field to item
        item['id'] = filename + "-" + str(item['id'])
        item['embedding'] = text_embeding(item['paragraph'])
        item['filename'] = filename
        # now in 2024-04-14T06:35:05Z format 
        item['data'] = datetime.datetime.now().isoformat()
    
    # result = client.upload_documents(documents=
    #                              [input['chunk']],)

    return input['chunk']
