from promptflow import tool
from typing import List
from promptflow_vectordb.core.contracts import SearchResultEntity

@tool
def my_python_tool(search_result: List) -> str:
    def format_doc(doc: dict):
        return f"instruction: {doc['instruction']}"

    retrieved_docs = []
    for item in search_result:

        entity = SearchResultEntity.from_dict(item)
        content = entity.text or ""

        retrieved_docs.append(
            content
        )
    #doc_string = "\n\n".join([format_doc(doc) for doc in retrieved_docs])
    return retrieved_docs
