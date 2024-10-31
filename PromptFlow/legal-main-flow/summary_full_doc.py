from promptflow.core import tool
from promptflow.connections import AzureOpenAIConnection
from pydantic import BaseModel 
from openai import AzureOpenAI  
from typing import List  
import json
import time

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
def python_tool(input_text: str, openai: AzureOpenAIConnection) -> object:
    
    client = AzureOpenAI(  
        azure_endpoint=openai.api_base,  
        api_key=openai.api_key,  
        api_version="2024-08-01-preview"
    )

    # prompt = '''
    # This is the list of steps to follow to summarize the document provided by the user:
    # 1. Summarize the document provided by the user
    # 2. in the beginning write a short summary about the full document with emphasis on key points like prices, dates, and names
    # 3. Next summarize the items based on the paragraphs provided in the document
    # 4. Under every item summary add key points like numbers, dates, and names, the key points must be short names list for tags
    # 5. On every item summary add notes, notes will be about contrudications and important points that looks out of place
    # 6. Answer in the local language of the document, the json language also will be in the local language
    # 7. Return the output in the following JSON format, the format is as follows: {"Items": [
    # {"title": "Paragraph Title as in the document no changes", 
    #  "summary": "Paragraph Summary", 
    #  "notes": "Notes about contrudications and important points that looks out of place",
    #  "original_text": "Original text of the paragraph with no changes or eddits",
    #  "keyItems":"list key points like numbers, dates, and names, importent, this is a list of tags and must be short names list"
    #  }],
    #  "Summary": "Short Summary of the full document with emphasis on key points like prices, dates, and names",
    #  "KeyPoints": [list key points like numbers, dates, and names, importent, this is a list of tags and must be short names list of the most importent key points in the document]
    #  }
    #  '''
    
    prompt = '''
Task: Transform the provided legal document into a structured JSON output with summaries, key points, and notes.

Instructions:

Document Summary:
Begin by providing a concise overview of the entire document. Highlight key information such as prices, dates, and names (Dates and Numbers are a must).
Paragraph Summaries:
For each paragraph, create a summary that captures its main points.
Include a list of key points, focusing on numbers, dates, and names for tagging purposes.
Notes:
Add notes to each paragraph summary to highlight contradictions or notable points that seem out of place.
Language:
Ensure that the summaries and JSON output are in the document's original language.
JSON Structure:
Use the following format for the output:

{  
  "Items": [  
    {  
      "title": "Exact title of the paragraph as in the document",  
      "summary": "Summary of the paragraph",  
      "notes": "Notes on contradictions and notable points",  
      "original_text": "Unaltered text of the paragraph",  
      "keyItems": "Tags: list of key points like numbers, dates, and names"  
    }  
  ],  
  "Summary": "Overall summary of the document, emphasizing key elements like prices, dates, and names",  
  "KeyPoints": ["List of significant tags: numbers, dates, names, etc."]  
}  
'''
    
    

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