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
        api_version=openai.api_version
    )

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
Ensure that all output, including JSON, is in the user's local language.
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
