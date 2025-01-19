from promptflow.core import tool
from promptflow.connections import CustomConnection
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
    MarkedText: str
    SearchResults: list[search_result]

class AskGAResponse(BaseModel):
    Answer: str

@tool
def python_tool(query: str, search_result_list: list, ally: CustomConnection, language: str ) -> object:
    
    client = AzureOpenAI(  
        azure_endpoint=ally.openai_endpoint,  
        api_key=ally.openai_key,  
        api_version=ally.openai_api_version,
    )
    
    # check if the search result list is empty
    if not search_result_list:
        prompt = '''
        Instructions:
        - Answer the user's question based on the code of Law, from your own knowledge.
        - If the question is not directly related to the code of Law or contruct related, Answer that you are sorry you can't help beacure of Company policy restrictions.
        - Add a note in the end that the inforamtion provided is not grounded on any Internal Conpany inforamtion or policy.
        - Answer in ''' + str(language)

        user_input = '''
        user question: ''' + str(query)
        
        openai_response = client.beta.chat.completions.parse(  
        model=ally.openai_model_deployment,  
        messages=[  
            {"role": "system", "content": prompt},  
            {"role": "user", "content": str(user_input)},  
        ],  
        response_format=AskGAResponse,  
        )  
        try:  
            openai_sentiment_response_post_text = openai_response.choices[0].message.parsed  
            response = json.loads(openai_sentiment_response_post_text.model_dump_json(indent=2))
            return response
        except Exception as e:  
            print(f"Error converting to JSON sentiment from OpenAI: {e}")
            return e
    else:         
        prompt = '''
            Task: check the search result and the origianl question. 
            check if the search result is relevant to the question. 
            If not, try to answer the question based on code of Law, from your own knowledge and in ''' + str(language) + '''. 
            do note that the answer is generated based on the code of Law and not from any internal company information or policy.
            DO NOT ADD the search_result (query result) in the JSON output add an empty [].

            if the search result is relevant to the question, answer the question based on the search result and based on the instructions below:

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
            All answers should be in ''' + str(language) + '''.
            Disclaimer:
            If the query results are empty or if any part of your answer is not directly supported by the provided data, append a disclaimer at the end: "The information provided is not from the document."
            JSON Output Format:

            {  
            "answer": "The answer to the user's question",  
            "answer_source": "The exact text of the paragraph from the list",  
            "marked_text": "The marked text from the paragraph answer_source that is most relevant to the answer as a single string, must be less than 10 words, and be the exact words with no change",
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
            model=ally.openai_model_deployment,  
            messages=[  
                {"role": "system", "content": prompt},  
                {"role": "user", "content": user_input},  
            ],  
            response_format=AskResponse,  
        )  
        try:  
            openai_sentiment_response_post_text = openai_response.choices[0].message.parsed  
            response = json.loads(openai_sentiment_response_post_text.model_dump_json(indent=2))
            return response
        except Exception as e:  
            print(f"Error converting to JSON sentiment from OpenAI: {e}")
            return e
    
