
from promptflow.core import tool
import logging

# The inputs section will change based on the arguments of the tool function, after you save the code
# Adding type to arguments and return value will help the system show the types properly
# Please update the function name/signature per need
@tool
def my_python_tool(input1: dict, input2: dict, input3: dict, input4: dict, input5: str) -> dict:
    #check witch input is not null and return it
    
    # create a write to file function
        #     with open("output.txt", "w") as text_file:
        # text_file.write("Hello, World!")
    
    def write_to_file(input):
        with open("output.txt", "w") as text_file:
            text_file.write(str(input))

    text = "out1 is {} out2 is {} out3 is {} out4 is {} out5 is {}".format(input1, input2, input3, input4, input5)
    write_to_file(text)

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

    