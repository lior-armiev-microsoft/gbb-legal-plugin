from promptflow.core import tool
from promptflow.connections import AzureOpenAIConnection
from pydantic import BaseModel 
from openai import AzureOpenAI  
from typing import List  
import json

class AskResponse(BaseModel):
    class search_result(BaseModel):  
        title: str
        summary: str
        keyphrases: list[str]
    Answer: str
    AnswerSource: str
    SearchResults: list[search_result]

@tool
def python_tool(query: str, search_result_list: list, openai: AzureOpenAIConnection) -> object:
    
    client = AzureOpenAI(  
        azure_endpoint=openai.api_base,  
        api_key=openai.api_key,  
        api_version="2024-08-01-preview"
    )
            # summarize the document provided by the user, the summary will be only on the policy items provided. Return the analysis in the following JSON format, the format is as follows: 
#     prompt = '''
#     This is the list of steps to follow answer a user question:
#     1. you need to understand the user's question and provide a summary of the question.
#     2. you will have a json input from a query nade in a previews step, it will have list of answers most relevant to the user's question.
#     3. you need to take the list and the user question and provide the best answer to the user.
#     4. the answer is probably need to be based on the first item in the list, but if another item fits better, you can use it
#     5. the answer is based only from information in the list, do not use any other information.
#     6. answer in the same language as the user question. also translete the search result to the same language as the user question.
#     7. Return the output in the following JSON format, the format is as follows: 
#     {"answer": "The answer to the user's question",
#     "answer_source": "the exact text of the paragraph from the list",
#     "search_result": [
#         {
#         "title": "Title from serach result",
#         "summary": "summary from search result",
#         "keyphreses": ["keyphrase1", "keyphrase2"]
#         }]
#     }
# '''

    prompt = '''
    Task: Answer the user's question based on relevant paragraphs from the document. If no relevant information is found, provide a general answer with a disclaimer.

Instructions:

Understand the Question:
Begin by interpreting and summarizing the user's question.
Input Data:
You will receive a JSON input containing a list of paragraphs that are most relevant to the user's question from a previous search step.
Formulate the Answer:
Use the most relevant paragraph(s) from the list to construct the best possible answer to the user's question.
Preferably base your answer on the first item in the list unless another item is more fitting.
Information Source:
Ensure that the answer is solely based on the information provided in the list. Do not introduce any external information.
Language Consistency:
Provide the answer and translate the search results into the same language as the user's question.
Disclaimer:
If the query results are empty or if any part of your answer is not directly supported by the provided data, append a disclaimer at the end: "The information provided is not from the document."
JSON Output Format:

{  
  "answer": "The answer to the user's question",  
  "answer_source": "The exact text of the paragraph from the list",  
  "search_result": [  
    {  
      "title": "Title from search result",  
      "summary": "Summary from search result",  
      "keyphrases": ["keyphrase1", "keyphrase2"]  
    }  
  ]  
}  '''

    user_input = '''
    user question: ''' + str(query) + '''
    query result: ''' + str(search_result_list)

    openai_response = client.beta.chat.completions.parse(  
        model="gpt4o",  
        messages=[  
            {"role": "system", "content": prompt},  
            {"role": "user", "content": str(user_input)},  
        ],  
        response_format=AskResponse,  
    )  
    try:  
        openai_sentiment_response_post_text = openai_response.choices[0].message.parsed  
        response = json.loads(openai_sentiment_response_post_text.model_dump_json(indent=2))
        print(response)
    except Exception as e:  
        print(f"Error converting to JSON sentiment from OpenAI: {e}")
        return  


    return response