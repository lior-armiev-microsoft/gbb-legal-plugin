
from promptflow.core import tool
from openai import AzureOpenAI
from promptflow.connections import CustomConnection

@tool
def my_python_tool(input: str, ally: CustomConnection,) -> object:
    client = AzureOpenAI(  
        azure_endpoint=ally.openai_endpoint,  
        api_key=ally.openai_key,  
        api_version=ally.openai_api_version,
    )

    response =  client.embeddings.create(input = input, model=ally.openai_embedding_deployment).data[0].embedding
    
    return response
