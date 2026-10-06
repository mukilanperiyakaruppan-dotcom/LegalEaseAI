from pydantic import BaseModel
from typing import Optional


class GenerateRequest(BaseModel):
    document_type: str
    parties: str
    terms: str
    effective_date: str
    jurisdiction: str = "Not specified"
    language: str = "English"


class GenerateResponse(BaseModel):
    content: str
    document_type: str
    model: str


class DownloadRequest(BaseModel):
    content: str
    document_type: str = "Legal Document"