from promptflow import tool
import json

#this is the input:
#{"function":"general-ask","query":"what is this about","input":"“Buyer” shall mean the legal entity issuing the Purchase Order, which may be Contoso Ltd or its affiliates, which expression shall include its successors and permitted assigns."}
# ineed to return the function as the output

@tool
def my_python_tool(input: object) -> object:
    return input