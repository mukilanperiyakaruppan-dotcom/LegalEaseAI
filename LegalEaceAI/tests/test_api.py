from fastapi.testclient import TestClient

from backend.main import app

from document_utils.exporter import (
    make_docx,
    make_pdf,
    make_txt
)


client = TestClient(app)


def test_root():

    response = client.get("/")

    assert response.status_code == 200

    assert (
        response.json()["message"]
        == "LegalEase backend is running."
    )


def test_health():

    response = client.get(
        "/health"
    )

    assert response.status_code == 200

    assert response.json() == {
        "status": "ok"
    }


def test_generate_validation():

    response = client.post(
        "/generate",
        json={}
    )

    assert response.status_code == 422


def test_txt_export():

    result = make_txt(
        "Hello LegalEase"
    )

    assert result == b"Hello LegalEase"


def test_docx_export():

    result = make_docx(
        "1. TERMS\n\nThis is a test.",
        "Test Agreement"
    )

    assert result[:2] == b"PK"


def test_pdf_export():

    result = make_pdf(
        "1. TERMS\n\nThis is a test.",
        "Test Agreement"
    )

    assert result.startswith(
        b"%PDF"
    )