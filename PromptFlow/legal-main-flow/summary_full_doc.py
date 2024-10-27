from promptflow.core import tool
from promptflow.connections import AzureOpenAIConnection
from pydantic import BaseModel 
from openai import AzureOpenAI  
from typing import List  
import json
import time

class SummaryResponse(BaseModel):  
    class Item(BaseModel):  
        title: str
        summary: str
        notes: str
        original_text: str
        keyItems: List[str]
    Summary: str
    Items: list[Item]


@tool
def python_tool(input_text: str, openai: AzureOpenAIConnection) -> object:
    
    client = AzureOpenAI(  
        azure_endpoint=openai.api_base,  
        api_key=openai.api_key,  
        api_version="2024-08-01-preview"
    )

    prompt = '''
    This is the list of steps to follow to summarize the document provided by the user:
    1. Summarize the document provided by the user
    2. in the beginning write a short summary about the full document with emphasis on key points like prices, dates, and names
    3. Next summarize the items based on the paragraphs provided in the document
    4. Under every item summary add key points like numbers, dates, and names
    5. On every item summary add notes, notes will be about contrudications and important points that looks out of place
    6. Return the output in the following JSON format, the format is as follows: {"Items": [
    {"title": "Paragraph Title as in the document no changes", 
     "summary": "Paragraph Summary", 
     "notes": "Notes about contrudications and important points that looks out of place",
     "original_text": "Original text of the paragraph with no changes or eddits",
     "keyItems":"list key points like numbers, dates, and names"
     }],
     "Summary": "Short Summary of the full document with emphasis on key points like prices, dates, and names"
     }
     '''
    
    openai_response = client.beta.chat.completions.parse(  
        model="gpt4o",  
        messages=[  
            {"role": "system", "content": prompt},  
            {"role": "user", "content": str(input_text)},  
        ],  
        response_format=SummaryResponse,  
    )  
    try:  

#         response = {
#     "answer": {
#         "Items": [
#             {
#                 "keyItems": [
#                     "seller's terms rejected unless agreed",
#                     "delivery signifies acceptance"
#                 ],
#                 "notes": "Ensures seller terms are void unless explicitly agreed upon. No room for seller's terms unless accepted in writing by buyer and seller.",
#                 "original_text": "ANY TERMS AND CONDITIONS PROPOSED IN THE SELLER’S ACCEPTANCE OR IN ANY ACKNOWLEDGEMENT, INVOICE, OR OTHER FORM OF THE SELLER THAT ADD TO, VARY FROM, OR CONFLICT WITH THE TERMS HEREIN ARE HEREBY REJECTED. SUCH TERMS AND CONDITIONS SHALL NOT APPLY TO THE CONTRACT UNLESS ACKNOWLEDGED BY A WRITTEN INSTRUMENT EXECUTED BY AUTHORISED REPRESENTATIVES OF THE BUYER AND THE SELLER.  DESPATCH OR DELIVERY OF THE GOODS BY THE SELLER TO THE BUYER SHALL BE DEEMED CONCLUSIVE EVIDENCE OF THE SELLER’S ACCEPTANCE OF THESE TERMS AND CONDITIONS.",
#                 "summary": "The document sets terms for the purchase of goods and services, rejecting any conflicting seller terms unless agreed in writing by both parties. Delivery signifies acceptance of these terms.",
#                 "title": "General Conditions of Contract"
#             },
#             {
#                 "keyItems": [
#                     "Authority",
#                     "Buyer",
#                     "Contract",
#                     "Contract Price"
#                 ],
#                 "notes": "Clear definitions provide clarity on roles and responsibilities within the contract context.",
#                 "original_text": "“Authority” means any competent authority to whose authority Buyer or its Customer’s operations are subject to.  Buyer” shall mean the legal entity issuing the Purchase Order, which may be Contoso Ltd or its affiliates, which expression shall include its successors and permitted assigns. “Contract” shall mean the agreement entered into between the Buyer and the Seller for the purchase of the Goods and/or Services...",
#                 "summary": "Defines key terms such as Authority, Buyer, Contract, Contract Price, Customer, days, Goods, Purchase Order, Seller, Services, and Serviceable.",
#                 "title": "Definitions"
#             },
#             {
#                 "keyItems": [
#                     "acceptance by conducting",
#                     "shipment or service start"
#                 ],
#                 "notes": "Seller's conduct can confirm acceptance of contract terms.",
#                 "original_text": "If the Seller fails to accept the Purchase Order for any reason whatsoever, the shipment by the Seller of any Goods or the furnishing or commencement of any Services ordered, or the acceptance of any payment by the Seller hereunder or any other conduct by the Seller that recognises the existence of a contract pertaining to the subject matter herein, may, at the Buyer’s election, be treated as an unqualified acceptance by the Seller of the Purchase Order and all terms and conditions herein.",
#                 "summary": "If the seller ships goods or starts services, it is seen as acceptance of the buyer’s purchase order terms.",
#                 "title": "Establishment of the Contract"
#             },
#             {
#                 "keyItems": [
#                     "quality assurance",
#                     "conformance to specs",
#                     "due care"
#                 ],
#                 "notes": "Emphasis on quality and compliance with detailed specifications.",
#                 "original_text": "Subject to Clauses 9 and 11, the Goods shall: be new and conform in all respects with the specifications...",
#                 "summary": "Goods must meet specified standards, be new, fit for purpose, and serviceable. Services must be performed with diligence and meet all requirements within agreed timelines.",
#                 "title": "QUALITY, STANDARD AND DESCRIPTION"
#             },
#             {
#                 "keyItems": [
#                     "inspection rights",
#                     "testing",
#                     "buyer notice"
#                 ],
#                 "notes": "Buyer has rights for thorough inspection before and during production.",
#                 "original_text": "Before dispatching the Goods, the Seller shall carefully inspect and test them for compliance with the Contract...",
#                 "summary": "Goods must be inspected and tested by the seller before dispatch to ensure compliance. The buyer may also inspect goods during production.",
#                 "title": "Inspection and Testing"
#             },
#             {
#                 "keyItems": [
#                     "INCOTERMS 2010",
#                     "protective packing",
#                     "delivery protocols"
#                 ],
#                 "notes": "Protective measures for delivery highlighted, adherence to international terms.",
#                 "original_text": "Unless otherwise agreed and except as set forth herein, the relevant Incoterm Rules as stipulated in the Purchase Order, as interpreted in accordance with “INCOTERMS 2010”...",
#                 "summary": "Delivery should adhere to INCOTERMS 2010. Goods must be packed for protection and be delivered intact. Seller must notify any security breaches.",
#                 "title": "Delivery and Packing"
#             },
#             {
#                 "keyItems": [
#                     "risk upon acceptance",
#                     "title upon delivery"
#                 ],
#                 "notes": "Distinction between risk of loss and title transfer is clear.",
#                 "original_text": "Risk of loss or damage to the Goods shall pass to the Buyer at the time of acceptance by the Buyer of the Goods...",
#                 "summary": "Risk passes to buyer upon acceptance; title passes on delivery unless payment is pre-made.",
#                 "title": "Passing of Property and Risk"
#             },
#             {
#                 "keyItems": [
#                     "time essential",
#                     "dates critical"
#                 ],
#                 "notes": "Timeliness emphasized as critical in contract execution.",
#                 "original_text": "Time shall be of the essence of the Contract, both as regards the dates and periods mentioned...",
#                 "summary": "Time is essential for the contract fulfillment, including delivery dates.",
#                 "title": "Time of Essence"
#             },
#             {
#                 "keyItems": [
#                     "rejection rights",
#                     "repayment",
#                     "alternatives"
#                 ],
#                 "notes": "Strong provision for buyer's protection against non-compliance.",
#                 "original_text": "The Buyer shall have the right (without liability and in addition to its other rights and remedies under the Contract or otherwise) to reject the Goods or refuse acceptance of the Goods and/or Services...",
#                 "summary": "Buyer can reject non-compliant goods/services and demand repayment. Buyer may seek alternatives and charge seller for additional costs incurred.",
#                 "title": "Rejection of Goods and Services"
#             },
#             {
#                 "keyItems": [
#                     "0.5% weekly damages",
#                     "10% max",
#                     "2% monthly interest"
#                 ],
#                 "notes": "Strict penalty clauses reinforce timely delivery.",
#                 "original_text": "Without prejudice to the Buyer’s other rights and remedies, if the Goods or any part thereof or the Services are not delivered or performed within the time(s) specified in the Contract...",
#                 "summary": "Delays incur damages of 0.5% per week, max at 10% of contract value. Interest charged on unpaid sums after 15 days.",
#                 "title": "Liquidated Damages"
#             },
#             {
#                 "keyItems": [
#                     "one-year warranty",
#                     "defect replacement",
#                     "repair obligations"
#                 ],
#                 "notes": "Warranty provisions ensure buyer's rights for quality goods/services.",
#                 "original_text": "The Seller represents and warrants that the Goods and Services and any part thereof will be of satisfactory quality and free from any defect...",
#                 "summary": "Seller warrants quality and rectifies defects within specified time. Services and goods follow a one-year warranty, unless specified otherwise.",
#                 "title": "Representations and Warranty"
#             },
#             {
#                 "keyItems": [
#                     "30-day payment",
#                     "3% discount",
#                     "correct invoicing"
#                 ],
#                 "notes": "Discount incentives for prompt payments.",
#                 "original_text": "The Contract Price shall be payable by the Buyer within thirty (30) days or any further period which may be mutually agreed by the parties in writing upon the Buyer’s receipt of the Seller’s correct invoice...",
#                 "summary": "Payment normally due in 30 days; a 3% discount applies for 15-day payment. Invoices must be correct and from seller.",
#                 "title": "Payment"
#             },
#             {
#                 "keyItems": [
#                     "IP rights",
#                     "Foreground IP",
#                     "Background IP"
#                 ],
#                 "notes": "Strong protection of buyer's IP rights emphasized.",
#                 "original_text": "The Seller represents and warrants that: neither the sale nor the use of the Goods and/or Services nor the performance of the Contract will infringe any patent, trademark...",
#                 "summary": "Seller ensures no IP infringement. Background IP remains with owner. Foreground IP developed under contract belongs to buyer.",
#                 "title": "Intellectual Property Rights"
#             },
#             {
#                 "keyItems": [
#                     "10-year confidentiality",
#                     "audit rights",
#                     "return of materials"
#                 ],
#                 "notes": "Ensures secure handling of sensitive information over a decade.",
#                 "original_text": "Except with the consent of the Buyer in writing, the Seller shall not disclose the Contract or any provision thereof or any specification, plan, drawing...",
#                 "summary": "Seller must maintain confidentiality, return all provided materials post-contract, and allow audits of records.",
#                 "title": "Confidentiality"
#             },
#             {
#                 "keyItems": [
#                     "PDPA compliance",
#                     "data breach notification"
#                 ],
#                 "notes": "Adherence to data protection laws ensures compliance.",
#                 "original_text": "The Seller acknowledges that it has read the Buyer’s Personal Data Policy, as may be amended from time to time, and consents to the collection, use and...",
#                 "summary": "Seller to comply with PDPA, handle personal data responsibly, and inform the buyer of breaches immediately.",
#                 "title": "Personal Data"
#             },
#             {
#                 "keyItems": [
#                     "Buyer's property",
#                     "no misuse",
#                     "return on demand"
#                 ],
#                 "notes": "Protection against misuse and retention of buyer's materials.",
#                 "original_text": "All tooling, equipment or materials furnished to the Seller by the Buyer or paid for or partially paid for by the Buyer and any replacement thereof...",
#                 "summary": "Buyer's property remains their own; seller cannot use it outside contract terms and must return upon demand.",
#                 "title": "Property of the Buyer"
#             },
#             {
#                 "keyItems": [
#                     "termination rights",
#                     "breach",
#                     "refund conditions"
#                 ],
#                 "notes": "Broad termination rights ensure buyer's protection against non-performance.",
#                 "original_text": "The Buyer shall be entitled forthwith to terminate the Contract by notice in writing to the Seller: if the Seller commits any breach of any of the provisions of the Contract...",
#                 "summary": "Buyer can terminate for various breaches, and seller must stop services immediately. Buyer can recover additional costs from seller.",
#                 "title": "Termination"
#             },
#             {
#                 "keyItems": [
#                     "seller liability",
#                     "indirect damages",
#                     "IP infringement"
#                 ],
#                 "notes": "Firm limits on buyer's responsibility protect against unforeseen liabilities.",
#                 "original_text": "Nothing shall limit the Seller’s responsibility to the Buyer regarding any claim to the extent arising from: death, injury or property damage to third parties...",
#                 "summary": "Seller's liability includes third-party damage, legal compliance failures, and IP infringement. Buyer not liable for indirect damages.",
#                 "title": "Limitation of Liability"
#             },
#             {
#                 "keyItems": [
#                     "insurance limits",
#                     "indemnity obligations"
#                 ],
#                 "notes": "Insurance requirements ensure comprehensive risk management.",
#                 "original_text": "The Seller shall have in effect and maintain, at its expense, the following insurance: Public Liability – US$5,000,000 combined...",
#                 "summary": "Seller must maintain specific insurance coverages and indemnify the buyer against certain claims.",
#                 "title": "Insurance and Indemnity"
#             },
#             {
#                 "keyItems": [
#                     "conflict prevention",
#                     "integrity policies"
#                 ],
#                 "notes": "Ensures integrity in interactions between parties.",
#                 "original_text": "The Seller shall exercise reasonable care and diligence during the term of the Contract to prevent any action or condition which could result in a conflict of interest...",
#                 "summary": "Seller must avoid conflicts of interest and ensure employees do not influence buyer's decisions through gifts.",
#                 "title": "Conflict of Interest"
#             },
#             {
#                 "keyItems": [
#                     "ethical compliance",
#                     "business standards"
#                 ],
#                 "notes": "Seller's adherence to ethical practices crucial for maintaining trust.",
#                 "original_text": "The Seller shall: Not take any action that would subject the Buyer to liability or penalty under any laws, regulations or...",
#                 "summary": "Seller must comply with laws, maintain high business standards, and notify buyer of non-compliance.",
#                 "title": "Business Ethics"
#             },
#             {
#                 "keyItems": [
#                     "notice requirements",
#                     "English language"
#                 ],
#                 "notes": "Clear process for official communications.",
#                 "original_text": "Any notice to be served on either of the parties by the other shall be in English and in writing and shall be sent by hand, registered post or courier...",
#                 "summary": "Notices between parties must be in English and in writing, with specific receipt guidelines.",
#                 "title": "Notices"
#             },
#             {
#                 "keyItems": [
#                     "Singapore law",
#                     "arbitration",
#                     "dispute resolution"
#                 ],
#                 "notes": "Establishes legal framework for resolving disputes efficiently.",
#                 "original_text": "The Contract shall be governed by and construed in accordance with the laws of Singapore, without reference to its conflict of laws rules...",
#                 "summary": "Contract governed by Singapore law. Disputes resolved in Singapore, with arbitration for international sellers.",
#                 "title": "Choice of Law and Dispute Resolution"
#             },
#             {
#                 "keyItems": [
#                     "entire agreement",
#                     "supersedes prior"
#                 ],
#                 "notes": "Ensures all terms are contained within this document.",
#                 "original_text": "The Contract constitutes the entire agreement between the parties relating to the subject matter hereof and supersedes all previous negotiation, representations...",
#                 "summary": "Contract contains entire agreement, superseding all previous negotiations or agreements.",
#                 "title": "Entirety of Contract"
#             },
#             {
#                 "keyItems": [
#                     "adjustment of terms",
#                     "validity maintenance"
#                 ],
#                 "notes": "Flexibility to adapt to legal challenges without voiding the contract.",
#                 "original_text": "If any provision of the Contract is declared invalid by any tribunal or competent authority, then such provision shall be deemed automatically adjusted to conform to the requirements...",
#                 "summary": "Invalid provisions adjusted or removed without affecting remainder of contract.",
#                 "title": "Severability"
#             },
#             {
#                 "keyItems": [
#                     "rights preservation",
#                     "non-waiver of terms"
#                 ],
#                 "notes": "Protects parties' rights from being unintentionally surrendered.",
#                 "original_text": "The failure of any party to enforce at any time any of the provisions herein shall not be construed to be a waiver of such provisions or a waiver of the right of such party...",
#                 "summary": "Failure to enforce terms is not a waiver of rights, nor does waiving one right affect others.",
#                 "title": "No Waiver of Rights"
#             },
#             {
#                 "keyItems": [
#                     "headings non-binding",
#                     "interpretation clarity"
#                 ],
#                 "notes": "Ensures focus on context over formatting.",
#                 "original_text": "The headings herein are for reference purposes only and shall not be taken into consideration in the interpretation or construction of the Contract.",
#                 "summary": "Headings are for reference only and do not affect interpretation.",
#                 "title": "Headings"
#             },
#             {
#                 "keyItems": [
#                     "Vienna Convention exclusion",
#                     "contract specificity"
#                 ],
#                 "notes": "Explicit exclusion to ensure specific contract governance.",
#                 "original_text": "The United Nations Convention on Contracts for the International Sales of Goods (Vienna, 1980) shall not apply to the Contract and all provisions thereat, expressed...",
#                 "summary": "The UN Convention on International Sales of Goods does not apply to this contract.",
#                 "title": "Vienna Convention Exclusion"
#             },
#             {
#                 "keyItems": [
#                     "third-party rights",
#                     "contract parties"
#                 ],
#                 "notes": "Limits legal rights to contract parties only.",
#                 "original_text": "A person who is not a party to the Contract has no right under the Contracts (Rights of Third Parties) Act to enforce any term of the Contract but this does not affect any...",
#                 "summary": "Third parties do not have contract enforcement rights unless separately available.",
#                 "title": "Third Party Rights"
#             },
#             {
#                 "keyItems": [
#                     "English language",
#                     "translation consistency"
#                 ],
#                 "notes": "Ensures uniform understanding of contract terms.",
#                 "original_text": "Except as the parties may otherwise agree, the Contract shall be in the English language. In the event of inconsistency between the Contract and a version...",
#                 "summary": "English is the contract language; in case of translation inconsistency, English prevails.",
#                 "title": "Prevailing Language"
#             },
#             {
#                 "keyItems": [
#                     "offset obligations",
#                     "international cooperation"
#                 ],
#                 "notes": "Highlights potential international business engagements.",
#                 "original_text": "Seller recognizes that Buyer may incur international offset obligations, which could involve Goods placed under the Contract...",
#                 "summary": "Buyer may use goods for offset obligations and seller must cooperate. Buyer benefits exclusively from offset values.",
#                 "title": "Offset Requirements"
#             }
#         ],
#         "Summary": "The document outlines the general conditions of contract for purchasing goods and services, detailing terms like rejection of conflicting conditions, definitions of key terms, contract establishment, quality standards, inspections, delivery, risk transfer, time constraints, payment terms, IP rights, indemnity, conflict of interest policies, and legal jurisdiction. Emphasizes procedures for liabilities, invoicing, compliance with laws, warranty, and termination conditions."
#     }
# }

        # time.sleep(3)
        openai_sentiment_response_post_text = openai_response.choices[0].message.parsed  
        response = json.loads(openai_sentiment_response_post_text.model_dump_json(indent=2))
        print(response)
    except Exception as e:  
        print(f"Error converting to JSON sentiment from OpenAI: {e}")
        return  


    return response