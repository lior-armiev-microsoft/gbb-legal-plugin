
from promptflow import tool


# The inputs section will change based on the arguments of the tool function, after you save the code
# Adding type to arguments and return value will help the system show the types properly
# Please update the function name/signature per need
@tool
def my_python_tool(input1: dict, input2: dict, input3: dict) -> dict:
    #check witch input is not null and return it
    if input1:
        return input1
    elif input2:
        return input2
    elif input3:
        return input3
    else:
        return "Both inputs are null"
