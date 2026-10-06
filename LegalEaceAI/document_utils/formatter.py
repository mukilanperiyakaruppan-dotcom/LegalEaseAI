import html
import re


def sanitize_text(text: str) -> str:
    """
    Clean generated document text before displaying or exporting it.
    """
    if text is None:
        return ""

    text = str(text)

    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove null characters
    text = text.replace("\x00", "")

    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def format_html_preview(text: str) -> str:
    """
    Convert plain legal-document text into safe HTML for Streamlit preview.
    """
    if text is None:
        return ""

    text = sanitize_text(text)

    # Escape HTML so generated document text cannot inject arbitrary HTML.
    escaped = html.escape(text)

    # Preserve line breaks and paragraphs.
    paragraphs = escaped.split("\n\n")

    formatted = []

    for paragraph in paragraphs:
        paragraph = paragraph.strip()

        if not paragraph:
            continue

        paragraph = paragraph.replace("\n", "<br>")

        formatted.append(
            f'<p style="margin-bottom: 1em; line-height: 1.6;">'
            f"{paragraph}"
            f"</p>"
        )

    return "\n".join(formatted)