from promptflow import tool
import json

@tool
def echo(input: object) -> object:
    return input