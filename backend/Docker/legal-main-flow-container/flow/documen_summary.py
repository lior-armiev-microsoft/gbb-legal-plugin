from promptflow.core import tool
from promptflow.connections import AzureOpenAIConnection, CustomConnection
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
def python_tool(language:str, input_text: str, policy_list: object, ally: CustomConnection):
    
    if len(policy_list) == 0:
        return {"warning": "No policy items found."}


    client = AzureOpenAI(  
        azure_endpoint=ally.openai_endpoint,  
        api_key=ally.openai_key,  
        api_version=ally.openai_api_version,
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
Ensure that all output is in ''' +  language + '''.
JSON Structure:
Use the following format for the output:

{  
  "UserSelection": [  
    {  
      "title": "Summary Title (translated in the selected language)",
      "summary": "Short summary of the text provided by the user (in the selected language)",  
      "keyItems": "Key items from the document: important points like numbers, dates, and names (in the selected language)",  
      "iscompliant": "yes/no (english)",  
      "suggested_correction": "Suggested correction if needed (in the selected language)",  
      "relevant_policy_item": "Text of the relevant policy item (in the selected language)",  
      "corrected_text": ["Prompt Rule for Correcting and Suggesting Variants of Legal Text:

Objective:

Correct the provided legal text if needed, ensuring compliance with policy restrictions.
Offer three alternative versions of the text, maintaining the original structure and numbering.
Guidelines for Text Correction and Suggestions:

Minimal Change Version (dont write Minimal Change Version it in the response):
Make only necessary corrections to ensure compliance with policy restrictions, keeping changes to a minimum.
Maintain the original order, structure, and numbering of the text.
Two Alternative Variants (dont write Two Alternative Variants it in the response):
Provide two additional versions of the text that convey the same meaning while ensuring compliance with policy restrictions.
These versions may incorporate more substantial revisions but must still preserve the original structure and numbering.
Formatting Requirements:

If the original text includes paragraphs or numbered clauses (using letters or numbers), retain this format in all versions.
Ensure each version comprises three paragraphs unless compliance requires the removal of a paragraph. In such cases, adjust the numbering accordingly.
Language Consideration:
Make corrections and suggestions in the language of the original text.
"]
    }  
  ]  
}  
 
10. Policy Items:

The policy items provided in the list are:''' + json.dumps(policy_list, indent=2)
    
    openai_response = client.beta.chat.completions.parse(  
        model=ally.openai_model_deployment,  
        messages=[  
            {"role": "system", "content": prompt},  
            {"role": "user", "content": str(input_text)},  
        ],  
        response_format=SummaryResponse,  
    )  
    try:  
        openai_sentiment_response_post_text = openai_response.choices[0].message.parsed  
        print(f"JSON string: {openai_sentiment_response_post_text}")
        response = json.loads(openai_sentiment_response_post_text.model_dump_json(indent=2))
        print(response)
    except Exception as e:  
        print(f"Error converting to JSON sentiment from OpenAI: {e}")
        return  

    return response