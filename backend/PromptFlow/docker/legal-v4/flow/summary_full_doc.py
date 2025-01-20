from promptflow.core import tool
from promptflow.connections import AzureOpenAIConnection, CustomConnection
from pydantic import BaseModel 
from openai import AzureOpenAI
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from typing import List  
import json
import time
import logging

class SummaryResponse(BaseModel):  
    class Item(BaseModel):  
        title: str
        summary: str
        notes: str
        original_text: str
        keyItems: List[str]
    Summary: str
    KeyPoints: List[str]
    Items: list[Item]


@tool
def python_tool(input_text: str, ally:CustomConnection) -> object:
    
    search_endpoint = ally.search_endpoint
    search_index = ally.search_document_index
    search_key = ally.search_key
    # use ai azure search to query 

    search_client = SearchClient(search_endpoint, search_index, AzureKeyCredential(search_key))
    results = search_client.search(
        search_text="*",  # Use '*' to match all documents
        order_by=["ParagraphId"],
    )
    list = []
    for result in results:
        #title,paragraph,keyphrases,summary,isCompliant,CompliantCollection,NonCompliantCollection
        # if is compliant false read the NonCompliantCollection list and run the get_policyinfo function
        if result["isCompliant"] == False:
            policylist = []
            for policyid in result["NonCompliantCollection"]:
                # log into promptflow a warning                
                policy = get_policyinfo(policyid,ally)
                policylist.append(policy)
            list.append({"title": result["title"], "summary": result["summary"], "keyphrases": result["keyphrases"], "summary": result["summary"], "isCompliant": result["isCompliant"], "CompliantCollection": result["CompliantCollection"], "NonCompliantCollection": result["NonCompliantCollection"], "NonCompliantPolicies": policylist})           
        else:    
            list.append({"title": result["title"], "summary": result["summary"], "keyphrases": result["keyphrases"], "summary": result["summary"], "isCompliant": result["isCompliant"], "CompliantCollection": result["CompliantCollection"], "NonCompliantCollection": result["NonCompliantCollection"]})
    print(list)
    return list


def get_policyinfo(policyid:int ,ally:CustomConnection):
    search_endpoint = ally.search_endpoint
    search_index = ally.search_policy_index
    search_key = ally.search_key
    # use ai azure search to query 

    search_client = SearchClient(search_endpoint, search_index, AzureKeyCredential(search_key))
    results = search_client.search(
        filter=f"PolicyId eq {policyid}",
        select="id,title,instruction,tags,severity"
    )
    results_list = [result for result in results]
    return results_list[0] if results_list else None
     