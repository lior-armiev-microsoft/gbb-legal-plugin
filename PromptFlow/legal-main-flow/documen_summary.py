from promptflow.core import tool
from promptflow.connections import AzureOpenAIConnection
from pydantic import BaseModel 
from openai import AzureOpenAI  
from typing import List  
import json

class SummaryResponse(BaseModel):  
    class PolicyItem(BaseModel):  
        title: str
        summary: str
        keyItems: List[str]
        iscompliant: str
        suggested_correction: str
        relevant_policy_item: str
        corrected_text: List[str]

    PolicyItems: list[PolicyItem]

@tool
def python_tool(input_text: str, policy_list: list, openai: AzureOpenAIConnection) -> object:
    
    client = AzureOpenAI(  
        azure_endpoint=openai.api_base,  
        api_key=openai.api_key,  
        api_version="2024-08-01-preview"
    )
            # summarize the document provided by the user, the summary will be only on the policy items provided. Return the analysis in the following JSON format, the format is as follows: 
    # prompt = '''
    # This is the list of steps to follow to summarize the provided selected text from a contruct provided by the user:
    # 1. your answer will be provided based on 2 sources, the user selected text and list of relevent policy items
    # 2. Make a title for the summary based on the text provided by the user
    # 3. Make a short and profetional summary of the text provided by the user
    # 4. Make key notes and extract Dates, Numbers, and Names from the text provided by the user
    # 5. Make a comparison between the text provided by the user and the policy items provided in the list
    # 6. make a suggested correction if needed only when not compliant with the policy items provided in the list
    # 7. write corrected_text if needed, make surgecal changes only, make 3 suggestions for the user to choose from
    # 8. Returen the policy item text and title as the relevent policy item
    # 9. all of the text will be in the local language of the user
    # 10. Return the output in the following JSON format, the format is as follows: {"UserSelection": [
    # {"title": "Summary Title", 
    #  "summary": "Short Summary based on the text provided by the user",
    #  "keyItems":"key Items from the document on this policy, importent key points like numbers, dates, and names",
    #  "iscompliant": "yes/no",
    #  "suggested_correction": "Suggested correction if needed",
    #  "relevant_policy_item": "Relevant policy item from the list",
    #  "corrected_text": "Corrected text if needed, make surgecal changes only,make 3 suggestions for the user to choose from"
    #  }]}
    
    # 11. The policy items provided in the list are:
    #         '''
    prompt = '''
     Task: Analyze the selected text from a document and compare it with relevant company policy items to assess compliance.

Instructions:

Sources:
Use the selected text from the user and a list of relevant policy items as your sources.
Title Creation:
Create a title for the summary based on the user-provided text.
Summary:
Provide a concise, professional summary of the selected text.
Key Notes:
Extract and list key elements such as dates, numbers, and names from the selected text.
Comparison:
Compare the user-provided text with the relevant policy items to determine compliance.
Suggested Corrections:
If the text is not compliant, propose a correction. Make precise changes and offer three suggestions for the user to choose from.
Relevant Policy Item:
Return the text and title of the relevant policy item that matches the selected text.
Language:
Ensure that all output, including JSON, is English.
JSON Structure:
Use the following format for the output:

{  
  "UserSelection": [  
    {  
      "title": "Summary Title",  
      "summary": "Short summary of the text provided by the user",  
      "keyItems": "Key items from the document: important points like numbers, dates, and names",  
      "iscompliant": "yes/no",  
      "suggested_correction": "Suggested correction if needed",  
      "relevant_policy_item": "Text of the relevant policy item",  
      "corrected_text": ["Corrected text if needed, with !three! suggestions for the user, based on the user original text, if the selected text is long with paragraphs, make sure to keep the original format and make only the surgicale changes needed"]
    }  
  ]  
}  
 
10. Policy Items:

The policy items provided in the list are:''' + str(policy_list)
    
    openai_response = client.beta.chat.completions.parse(  
        model="gpt4o",  
        messages=[  
            {"role": "system", "content": prompt},  
            {"role": "user", "content": str(input_text)},  
        ],  
        response_format=SummaryResponse,  
    )  
    try:  
        openai_sentiment_response_post_text = openai_response.choices[0].message.parsed  
        response = json.loads(openai_sentiment_response_post_text.model_dump_json(indent=2))
        print(response)
    except Exception as e:  
        print(f"Error converting to JSON sentiment from OpenAI: {e}")
        return  


    return response
