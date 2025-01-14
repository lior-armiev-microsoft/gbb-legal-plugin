
from promptflow import tool


# The inputs section will change based on the arguments of the tool function, after you save the code
# Adding type to arguments and return value will help the system show the types properly
# Please update the function name/signature per need
@tool
def chunk_python_tool(filename: str, user_config: dict) -> dict:
    # check file type
    
    # check number of tokens for doc

    # Send to document inteligance

    # go over full document

    # update index
    
    return 'hello '
