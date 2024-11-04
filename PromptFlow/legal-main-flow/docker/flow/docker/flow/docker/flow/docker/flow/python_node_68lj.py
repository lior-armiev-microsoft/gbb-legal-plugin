
from promptflow import tool
import time

# The inputs section will change based on the arguments of the tool function, after you save the code
# Adding type to arguments and return value will help the system show the types properly
# Please update the function name/signature per need
@tool
def my_python_tool(input1: str) -> str:
    #sleep 10 sec
    time.sleep(10)
    return 'hello ' + input1
