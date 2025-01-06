
from promptflow.core import tool
import logging

# The inputs section will change based on the arguments of the tool function, after you save the code
# Adding type to arguments and return value will help the system show the types properly
# Please update the function name/signature per need
@tool
def my_python_tool(input1: dict, input2: dict, input3: dict, input4: dict, input5: str) -> dict:
    #check witch input is not null and return it
    
    if input1:
        return input1
    elif input2:
        return input2
    elif input3:
        return input3
    elif input4:
        return input4
    elif input5 == False or input5 == True:
        out = {"Found": input5}
        return out
    else:
        return "Both inputs are null"

    