import os
from typing import Optional

from dotenv import load_dotenv
from google import genai


load_dotenv()


class GeminiDocumentGenerator:
    """
    Generates AI-assisted legal document drafts using Google Gemini.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None
    ):

        self.api_key = (
            api_key
            or os.getenv("GEMINI_API_KEY")
        )

        # Primary model
        self.model = (
            model
            or os.getenv(
                "GEMINI_MODEL",
                "gemini-3.5-flash-lite"
            )
        )

        # Fallback models
        self.fallback_models = [
            "gemini-3.7-flash",
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
        ]

        if not self.api_key:

            raise RuntimeError(
                "GEMINI_API_KEY is missing. "
                "Create a .env file and add your Gemini API key."
            )

        self.client = genai.Client(
            api_key=self.api_key
        )


    def generate_document(
        self,
        document_type: str,
        parties: str,
        terms: str,
        effective_date: str,
        jurisdiction: str = "Not specified",
        language: str = "English",
    ) -> str:

        prompt = f"""
You are LegalEase, an AI assistant for drafting
professional legal-document templates.

Create a professional, editable draft for the
requested document.

DOCUMENT TYPE:
{document_type}

PARTIES:
{parties}

EFFECTIVE DATE:
{effective_date}

JURISDICTION:
{jurisdiction}

LANGUAGE:
{language}

USER-PROVIDED TERMS:
{terms}

Follow these requirements carefully:

1. Use clear and formal legal drafting.

2. Do not invent names, addresses, amounts,
dates, obligations, or facts that the user
did not provide.

3. If information is missing, use a visible
placeholder such as:

[INSERT ADDRESS]

instead of inventing information.

4. Include a clear document title.

5. Organize the document into logical,
numbered sections.

6. Incorporate the user-provided terms
into appropriate clauses.

7. Include signature blocks for the
relevant parties.

8. Include an "Important Review Notice"
at the end.

The notice should explain that the document
is an AI-assisted draft and should be reviewed
for the applicable jurisdiction.

9. Return only the document.

10. Do not use Markdown code fences.

11. Do not claim that the document is guaranteed
to be legally valid.

12. Do not claim that an attorney has reviewed
the document.

13. Do not claim jurisdictional compliance unless
the user explicitly supplied the relevant
information.

Generate the document in:
{language}
"""


        # Models to try
        models_to_try = [
            self.model
        ]

        for fallback in self.fallback_models:

            if fallback not in models_to_try:

                models_to_try.append(
                    fallback
                )


        last_error = None


        for model_name in models_to_try:

            try:

                print(
                    f"LegalEase: Trying Gemini model: {model_name}"
                )


                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )


                generated_text = getattr(
                    response,
                    "text",
                    None
                )


                if generated_text:

                    # Store the model that actually worked
                    self.model = model_name

                    print(
                        f"LegalEase: Success with {model_name}"
                    )

                    return generated_text.strip()


                last_error = (
                    f"{model_name} returned an empty response."
                )


            except Exception as exc:

                last_error = exc

                print(
                    f"LegalEase: {model_name} failed: {exc}"
                )

                print(
                    "LegalEase: Trying next model..."
                )


        raise RuntimeError(
            "Gemini generation failed. "
            "All configured Gemini models were unavailable. "
            f"Last error: {last_error}"
        )