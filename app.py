import os
from datetime import date

import requests
import streamlit as st
from dotenv import load_dotenv

from document_utils.exporter import (
    make_docx,
    make_pdf,
    make_txt
)

from document_utils.formatter import (
    format_html_preview,
    sanitize_text
)


load_dotenv()


BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://127.0.0.1:8000"
).rstrip("/")


st.set_page_config(
    page_title="LegalEase",
    page_icon="⚖️",
    layout="wide"
)


st.markdown(
    """
    <style>

    .main-title {
        text-align: center;
        font-size: 42px;
        font-weight: 800;
        margin-bottom: 0;
    }

    .subtitle {
        text-align: center;
        color: #6b7280;
        margin-bottom: 25px;
    }

    </style>
    """,
    unsafe_allow_html=True
)


st.markdown(
    '<div class="main-title">⚖️ LegalEase</div>',
    unsafe_allow_html=True
)


st.markdown(
    '<div class="subtitle">'
    'AI-Powered Legal Document Generator'
    '</div>',
    unsafe_allow_html=True
)


with st.sidebar:

    st.header(
        "About LegalEase"
    )

    st.write(
        "Create AI-assisted drafts such as "
        "contracts, NDAs, lease agreements "
        "and employment documents."
    )

    st.warning(
        "LegalEase does not replace a qualified "
        "lawyer. Review every generated document "
        "for your jurisdiction before signing "
        "or using it."
    )

    st.caption(
        f"Backend: {BACKEND_URL}"
    )


left_column, right_column = st.columns(
    [1, 1.25],
    gap="large"
)


with left_column:

    st.subheader(
        "Document Details"
    )

    document_type = st.selectbox(
        "Document Type",
        [
            "Employment Contract",
            "Non-Disclosure Agreement (NDA)",
            "Lease Agreement",
            "Freelance Work Contract",
            "Employment Offer Letter",
            "General Agreement",
            "Custom Legal Document"
        ]
    )

    if document_type == "Custom Legal Document":

        document_type = st.text_input(
            "Enter Custom Document Type",
            placeholder=(
                "e.g. Consulting Agreement"
            )
        )

    parties = st.text_area(
        "Parties Involved",
        height=120,
        placeholder=(
            "Example:\n"
            "Jane Doe (Service Provider), "
            "TechNova Inc. (Client)"
        )
    )

    terms = st.text_area(
        "Terms & Conditions",
        height=220,
        placeholder=(
            "Separate each term using a semicolon (;)\n\n"
            "Payment to be made within 30 days of invoice;\n"
            "Confidentiality must be maintained;\n"
            "Either party may terminate with 30 days notice"
        )
    )

    effective_date = st.date_input(
        "Effective Date",
        value=date.today()
    )

    jurisdiction = st.text_input(
        "Jurisdiction",
        placeholder=(
            "e.g. Tamil Nadu, India"
        )
    )

    language = st.selectbox(
        "Language",
        [
            "English",
            "Hindi",
            "Tamil"
        ]
    )

    generate_button = st.button(
        "✨ Generate Document",
        type="primary",
        use_container_width=True
    )


if generate_button:

    if not document_type.strip():

        st.error(
            "Please enter a document type."
        )

    elif not parties.strip():

        st.error(
            "Please enter the parties involved."
        )

    elif not terms.strip():

        st.error(
            "Please enter at least one term."
        )

    else:

        payload = {

            "document_type":
                document_type.strip(),

            "parties":
                parties.strip(),

            "terms":
                terms.strip(),

            "effective_date":
                effective_date.isoformat(),

            "jurisdiction":
                jurisdiction.strip()
                or "Not specified",

            "language":
                language
        }

        with st.spinner(
            "Generating your legal document..."
        ):

            try:

                response = requests.post(
                    f"{BACKEND_URL}/generate",
                    json=payload,
                    timeout=180
                )

                response.raise_for_status()

                data = response.json()

                st.session_state[
                    "document"
                ] = sanitize_text(
                    data["content"]
                )

                st.session_state[
                    "document_type"
                ] = data["document_type"]

                st.session_state[
                    "model"
                ] = data["model"]

                st.success(
                    "Document generated successfully!"
                )

            except requests.exceptions.ConnectionError:

                st.error(
                    "Could not connect to FastAPI.\n\n"
                    "Start the backend first with:\n\n"
                    "uvicorn backend.main:app --reload"
                )

            except requests.exceptions.HTTPError:

                try:

                    detail = response.json().get(
                        "detail",
                        response.text
                    )

                except Exception:

                    detail = response.text

                st.error(
                    f"Backend error: {detail}"
                )

            except requests.exceptions.RequestException as exc:

                st.error(
                    f"Request failed: {exc}"
                )


with right_column:

    st.subheader(
        "Document Preview"
    )

    if "document" not in st.session_state:

        st.info(
            "Your generated document "
            "will appear here."
        )

    else:

        st.caption(
            "Generated with: "
            + st.session_state.get(
                "model",
                "Gemini"
            )
        )

        edited_document = st.text_area(
            "Editable Document",
            value=st.session_state[
                "document"
            ],
            height=560,
            label_visibility="collapsed"
        )

        st.session_state[
            "document"
        ] = edited_document

        st.markdown(
            format_html_preview(
                edited_document
            ),
            unsafe_allow_html=True
        )

        filename_base = (
            st.session_state.get(
                "document_type",
                "legal_document"
            )
            .lower()
            .replace(" ", "_")
            .replace("/", "_")
        )

        st.markdown(
            "### Download"
        )

        column1, column2, column3 = st.columns(
            3
        )

        with column1:

            st.download_button(
                "⬇️ TXT",
                data=make_txt(
                    edited_document
                ),
                file_name=(
                    f"{filename_base}.txt"
                ),
                mime="text/plain",
                use_container_width=True
            )

        with column2:

            st.download_button(
                "⬇️ DOCX",
                data=make_docx(
                    edited_document,
                    st.session_state.get(
                        "document_type",
                        "Legal Document"
                    )
                ),
                file_name=(
                    f"{filename_base}.docx"
                ),
                mime=(
                    "application/vnd.openxmlformats-"
                    "officedocument.wordprocessingml.document"
                ),
                use_container_width=True
            )

        with column3:

            st.download_button(
                "⬇️ PDF",
                data=make_pdf(
                    edited_document,
                    st.session_state.get(
                        "document_type",
                        "Legal Document"
                    )
                ),
                file_name=(
                    f"{filename_base}.pdf"
                ),
                mime="application/pdf",
                use_container_width=True
            )