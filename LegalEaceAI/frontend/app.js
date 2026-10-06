const API_URL = "http://127.0.0.1:8000";

/* =========================================================
   LEGALEASE AI - MAIN APP
   ========================================================= */

const form = document.getElementById("documentForm");

const generateBtn = document.getElementById("generateBtn");
const buttonText = document.getElementById("buttonText");
const buttonLoader = document.getElementById("buttonLoader");

const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const documentOutput = document.getElementById("documentOutput");

const resultStatus = document.getElementById("resultStatus");

const copyBtn = document.getElementById("copyBtn");
const editBtn = document.getElementById("editBtn");

const downloadTxtBtn =
    document.getElementById("downloadTxtBtn");

const downloadDocxBtn =
    document.getElementById("downloadDocxBtn");

const downloadPdfBtn =
    document.getElementById("downloadPdfBtn");

let currentDocumentType = "Legal Document";
let currentDocumentId = null;


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

const DOCUMENTS_KEY = "legalease_documents";
const SETTINGS_KEY = "legalease_settings";

const defaultSettings = {
    defaultJurisdiction: "India",
    defaultLanguage: "English",
    autoSave: true
};


function getSettings() {

    try {

        const saved =
            localStorage.getItem(SETTINGS_KEY);

        if (!saved) {
            return { ...defaultSettings };
        }

        return {
            ...defaultSettings,
            ...JSON.parse(saved)
        };

    } catch (error) {

        console.error(
            "Settings read error:",
            error
        );

        return { ...defaultSettings };
    }
}


function saveSettings(settings) {

    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );
}


function getDocuments() {

    try {

        const saved =
            localStorage.getItem(DOCUMENTS_KEY);

        if (!saved) {
            return [];
        }

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Documents read error:",
            error
        );

        return [];
    }
}


function saveDocuments(documents) {

    localStorage.setItem(
        DOCUMENTS_KEY,
        JSON.stringify(documents)
    );
}


/* =========================================================
   GENERATE DOCUMENT
   ========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const documentType =
                document.getElementById(
                    "document_type"
                )?.value || "";

            const parties =
                document.getElementById(
                    "parties"
                )?.value || "";

            const terms =
                document.getElementById(
                    "terms"
                )?.value || "";

            const effectiveDate =
                document.getElementById(
                    "effective_date"
                )?.value || "";

            const jurisdiction =
                document.getElementById(
                    "jurisdiction"
                )?.value || "India";

            const language =
                document.getElementById(
                    "language"
                )?.value || "English";


            if (
                !documentType ||
                !parties ||
                !terms
            ) {

                alert(
                    "Please fill in all required fields."
                );

                return;
            }


            setLoading(true);


            const requestData = {

                document_type:
                    documentType,

                parties:
                    parties,

                terms:
                    terms,

                effective_date:
                    effectiveDate,

                jurisdiction:
                    jurisdiction,

                language:
                    language
            };


            try {

                const response =
                    await fetch(
                        `${API_URL}/generate`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    requestData
                                )
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Failed to generate document."
                    );
                }


                showResult(data);


            } catch (error) {

                console.error(
                    "Generation error:",
                    error
                );

                showError(
                    error.message
                );


            } finally {

                setLoading(false);
            }
        }
    );
}


/* =========================================================
   LOADING
   ========================================================= */

function setLoading(isLoading) {

    if (isLoading) {

        if (generateBtn) {
            generateBtn.disabled = true;
        }

        if (buttonText) {
            buttonText.textContent =
                "Generating...";
        }

        if (buttonLoader) {
            buttonLoader.classList.remove(
                "hidden"
            );
        }

        if (emptyState) {
            emptyState.classList.add(
                "hidden"
            );
        }

        if (documentOutput) {
            documentOutput.classList.add(
                "hidden"
            );
        }

        if (loadingState) {
            loadingState.classList.remove(
                "hidden"
            );
        }

        if (resultStatus) {
            resultStatus.textContent =
                "AI is generating your legal document...";
        }

        disableDocumentButtons(true);

    } else {

        if (generateBtn) {
            generateBtn.disabled = false;
        }

        if (buttonText) {
            buttonText.textContent =
                "Generate Legal Document";
        }

        if (buttonLoader) {
            buttonLoader.classList.add(
                "hidden"
            );
        }

        if (loadingState) {
            loadingState.classList.add(
                "hidden"
            );
        }
    }
}


/* =========================================================
   SHOW RESULT
   ========================================================= */

function showResult(data) {

    currentDocumentType =
        data.document_type ||
        "Legal Document";


    if (emptyState) {
        emptyState.classList.add(
            "hidden"
        );
    }


    if (loadingState) {
        loadingState.classList.add(
            "hidden"
        );
    }


    if (documentOutput) {

        documentOutput.classList.remove(
            "hidden"
        );

        documentOutput.contentEditable =
            "false";

        documentOutput.style.background =
            "#fafafa";

        documentOutput.textContent =
            data.content ||
            "No document content returned.";
    }


    if (resultStatus) {

        resultStatus.textContent =
            `${currentDocumentType} generated successfully.`;
    }


    if (editBtn) {
        editBtn.textContent = "Edit";
    }


    disableDocumentButtons(false);


    if (documentOutput) {
        documentOutput.scrollTop = 0;
    }


    /* Save document */

    const settings =
        getSettings();

    if (settings.autoSave !== false) {

        saveGeneratedDocument(
            data
        );
    }
}


/* =========================================================
   SAVE GENERATED DOCUMENT
   ========================================================= */

function saveGeneratedDocument(data) {

    const documents =
        getDocuments();


    const documentItem = {

        id:
            Date.now().toString(),

        document_type:
            data.document_type ||
            "Legal Document",

        parties:
            document.getElementById(
                "parties"
            )?.value || "",

        terms:
            document.getElementById(
                "terms"
            )?.value || "",

        effective_date:
            document.getElementById(
                "effective_date"
            )?.value || "",

        jurisdiction:
            document.getElementById(
                "jurisdiction"
            )?.value || "",

        language:
            document.getElementById(
                "language"
            )?.value || "English",

        content:
            data.content || "",

        model:
            data.model || "",

        created_at:
            new Date().toISOString()
    };


    documents.unshift(
        documentItem
    );


    saveDocuments(
        documents
    );


    currentDocumentId =
        documentItem.id;
}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

    if (emptyState) {
        emptyState.classList.add(
            "hidden"
        );
    }

    if (loadingState) {
        loadingState.classList.add(
            "hidden"
        );
    }

    if (documentOutput) {

        documentOutput.classList.remove(
            "hidden"
        );

        documentOutput.textContent =
            "Unable to generate the document.\n\n" +
            message;
    }

    if (resultStatus) {

        resultStatus.textContent =
            "Document generation failed.";
    }

    disableDocumentButtons(true);
}


/* =========================================================
   BUTTON ENABLE / DISABLE
   ========================================================= */

function disableDocumentButtons(
    disabled
) {

    if (copyBtn) {
        copyBtn.disabled = disabled;
    }

    if (editBtn) {
        editBtn.disabled = disabled;
    }

    if (downloadTxtBtn) {
        downloadTxtBtn.disabled =
            disabled;
    }

    if (downloadDocxBtn) {
        downloadDocxBtn.disabled =
            disabled;
    }

    if (downloadPdfBtn) {
        downloadPdfBtn.disabled =
            disabled;
    }
}


/* =========================================================
   COPY
   ========================================================= */

if (copyBtn) {

    copyBtn.addEventListener(
        "click",
        async function () {

            if (!documentOutput) {
                return;
            }

            const text =
                documentOutput.textContent;

            if (!text) {
                return;
            }

            try {

                await navigator.clipboard
                    .writeText(text);

                const originalText =
                    copyBtn.textContent;

                copyBtn.textContent =
                    "Copied!";

                setTimeout(
                    function () {

                        copyBtn.textContent =
                            originalText;

                    },
                    1500
                );

            } catch (error) {

                console.error(
                    "Copy failed:",
                    error
                );

                alert(
                    "Unable to copy the document."
                );
            }
        }
    );
}


/* =========================================================
   EDIT
   ========================================================= */

if (editBtn) {

    editBtn.addEventListener(
        "click",
        function () {

            if (!documentOutput) {
                return;
            }


            if (
                documentOutput.contentEditable ===
                "true"
            ) {

                documentOutput.contentEditable =
                    "false";

                editBtn.textContent =
                    "Edit";

                documentOutput.style.background =
                    "#fafafa";

                updateSavedDocument();

            } else {

                documentOutput.contentEditable =
                    "true";

                documentOutput.focus();

                editBtn.textContent =
                    "Save Edit";

                documentOutput.style.background =
                    "#fffdf5";
            }
        }
    );
}


/* =========================================================
   UPDATE SAVED DOCUMENT AFTER EDIT
   ========================================================= */

function updateSavedDocument() {

    if (!currentDocumentId) {
        return;
    }

    if (!documentOutput) {
        return;
    }


    const documents =
        getDocuments();


    const index =
        documents.findIndex(
            function (item) {

                return (
                    item.id ===
                    currentDocumentId
                );
            }
        );


    if (index === -1) {
        return;
    }


    documents[index].content =
        documentOutput.textContent;

    documents[index].updated_at =
        new Date().toISOString();


    saveDocuments(
        documents
    );
}


/* =========================================================
   DOWNLOAD CURRENT DOCUMENT
   ========================================================= */

async function downloadDocument(
    endpoint,
    filename
) {

    if (!documentOutput) {
        return;
    }


    const content =
        documentOutput.textContent;


    if (!content) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}${endpoint}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            content:
                                content,

                            document_type:
                                currentDocumentType
                        })
                }
            );


        if (!response.ok) {

            let errorMessage =
                "Download failed.";

            try {

                const errorData =
                    await response.json();

                errorMessage =
                    errorData.detail ||
                    errorMessage;

            } catch (e) {
                // Ignore JSON parsing error
            }


            throw new Error(
                errorMessage
            );
        }


        const blob =
            await response.blob();


        const url =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;

        link.download =
            filename;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
            url
        );


    } catch (error) {

        console.error(
            "Download error:",
            error
        );

        alert(
            `Download failed: ${error.message}`
        );
    }
}


/* =========================================================
   DOWNLOAD BUTTONS
   ========================================================= */

if (downloadTxtBtn) {

    downloadTxtBtn.addEventListener(
        "click",
        function () {

            downloadDocument(
                "/download/txt",
                `${currentDocumentType}.txt`
            );
        }
    );
}


if (downloadDocxBtn) {

    downloadDocxBtn.addEventListener(
        "click",
        function () {

            downloadDocument(
                "/download/docx",
                `${currentDocumentType}.docx`
            );
        }
    );
}


if (downloadPdfBtn) {

    downloadPdfBtn.addEventListener(
        "click",
        function () {

            downloadDocument(
                "/download/pdf",
                `${currentDocumentType}.pdf`
            );
        }
    );
}


/* =========================================================
   MY DOCUMENTS
   ========================================================= */

function openMyDocuments() {

    const documents =
        getDocuments();


    const main =
        getMainContainer();


    if (!main) {
        return;
    }


    main.innerHTML = `

        <div class="page-header">

            <div>

                <h1>My Documents</h1>

                <p>
                    View and manage your generated legal documents.
                </p>

            </div>

            <button
                id="backToGenerate"
                class="primary-outline-button"
            >
                ← Generate Document
            </button>

        </div>


        <div
            id="documentsContainer"
            class="documents-grid"
        ></div>

    `;


    renderDocuments(
        documents
    );


    const backButton =
        document.getElementById(
            "backToGenerate"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                location.reload();

            }
        );
    }
}


function renderDocuments(
    documents
) {

    const container =
        document.getElementById(
            "documentsContainer"
        );


    if (!container) {
        return;
    }


    if (!documents.length) {

        container.innerHTML = `

            <div class="empty-documents">

                <div class="empty-icon">
                    ⚖
                </div>

                <h2>
                    No documents yet
                </h2>

                <p>
                    Generate your first legal document
                    to see it here.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        documents.map(
            function (doc) {

                return `

                    <div
                        class="document-card"
                    >

                        <h2>
                            ${escapeHTML(
                                doc.document_type
                            )}
                        </h2>

                        <p>
                            <strong>
                                Parties:
                            </strong>

                            ${escapeHTML(
                                doc.parties
                            )}
                        </p>

                        <p>
                            <strong>
                                Jurisdiction:
                            </strong>

                            ${escapeHTML(
                                doc.jurisdiction
                            )}
                        </p>

                        <p>
                            <strong>
                                Effective Date:
                            </strong>

                            ${escapeHTML(
                                doc.effective_date
                            )}
                        </p>

                        <small>
                            Created:
                            ${formatDate(
                                doc.created_at
                            )}
                        </small>

                        <div
                            class="document-actions"
                        >

                            <button
                                class="open-document-btn"
                                data-id="${doc.id}"
                            >
                                Open
                            </button>

                            <button
                                class="download-saved-txt"
                                data-id="${doc.id}"
                            >
                                TXT
                            </button>

                            <button
                                class="download-saved-docx"
                                data-id="${doc.id}"
                            >
                                DOCX
                            </button>

                            <button
                                class="download-saved-pdf"
                                data-id="${doc.id}"
                            >
                                PDF
                            </button>

                            <button
                                class="delete-document-btn"
                                data-id="${doc.id}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                `;
            }
        ).join("");


    attachDocumentActions();
}


function attachDocumentActions() {

    document
        .querySelectorAll(
            ".open-document-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openSavedDocument(
                            button.dataset.id
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".delete-document-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteDocument(
                            button.dataset.id
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".download-saved-txt"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        downloadSavedDocument(
                            button.dataset.id,
                            "txt"
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".download-saved-docx"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        downloadSavedDocument(
                            button.dataset.id,
                            "docx"
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".download-saved-pdf"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        downloadSavedDocument(
                            button.dataset.id,
                            "pdf"
                        );
                    }
                );
            }
        );
}


/* =========================================================
   OPEN SAVED DOCUMENT
   ========================================================= */

function openSavedDocument(id) {

    const documents =
        getDocuments();


    const doc =
        documents.find(
            function (item) {

                return item.id === id;
            }
        );


    if (!doc) {

        alert(
            "Document not found."
        );

        return;
    }


    currentDocumentId =
        doc.id;

    currentDocumentType =
        doc.document_type;


    const main =
        getMainContainer();


    if (!main) {
        return;
    }


    main.innerHTML = `

        <div class="page-header">

            <div>

                <h1>
                    ${escapeHTML(
                        doc.document_type
                    )}
                </h1>

                <p>
                    Saved legal document
                </p>

            </div>

            <button
                id="backToDocuments"
                class="primary-outline-button"
            >
                ← My Documents
            </button>

        </div>


        <div class="saved-document-viewer">

            <div class="saved-document-toolbar">

                <button
                    id="savedEditBtn"
                >
                    Edit
                </button>

                <button
                    id="savedCopyBtn"
                >
                    Copy
                </button>

                <button
                    id="savedTxtBtn"
                >
                    Download TXT
                </button>

                <button
                    id="savedDocxBtn"
                >
                    Download DOCX
                </button>

                <button
                    id="savedPdfBtn"
                >
                    Download PDF
                </button>

            </div>


            <div
                id="savedDocumentContent"
                class="saved-document-content"
            >
                ${escapeHTML(
                    doc.content
                )}
            </div>

        </div>

    `;


    document
        .getElementById(
            "backToDocuments"
        )
        .addEventListener(
            "click",
            function () {

                openMyDocuments();
            }
        );


    const savedContent =
        document.getElementById(
            "savedDocumentContent"
        );


    document
        .getElementById(
            "savedEditBtn"
        )
        .addEventListener(
            "click",
            function () {

                if (
                    savedContent.contentEditable ===
                    "true"
                ) {

                    savedContent.contentEditable =
                        "false";

                    this.textContent =
                        "Edit";


                    const allDocuments =
                        getDocuments();


                    const index =
                        allDocuments.findIndex(
                            function (item) {

                                return (
                                    item.id ===
                                    doc.id
                                );
                            }
                        );


                    if (index !== -1) {

                        allDocuments[index].content =
                            savedContent.textContent;

                        allDocuments[index].updated_at =
                            new Date().toISOString();

                        saveDocuments(
                            allDocuments
                        );
                    }


                } else {

                    savedContent.contentEditable =
                        "true";

                    savedContent.focus();

                    this.textContent =
                        "Save";
                }
            }
        );


    document
        .getElementById(
            "savedCopyBtn"
        )
        .addEventListener(
            "click",
            async function () {

                try {

                    await navigator.clipboard.writeText(
                        savedContent.textContent
                    );

                    const button =
                        this;

                    button.textContent =
                        "Copied!";

                    setTimeout(
                        function () {

                            button.textContent =
                                "Copy";

                        },
                        1500
                    );

                } catch (error) {

                    alert(
                        "Unable to copy document."
                    );
                }
            }
        );


    document
        .getElementById(
            "savedTxtBtn"
        )
        .addEventListener(
            "click",
            function () {

                downloadSavedDocument(
                    doc.id,
                    "txt"
                );
            }
        );


    document
        .getElementById(
            "savedDocxBtn"
        )
        .addEventListener(
            "click",
            function () {

                downloadSavedDocument(
                    doc.id,
                    "docx"
                );
            }
        );


    document
        .getElementById(
            "savedPdfBtn"
        )
        .addEventListener(
            "click",
            function () {

                downloadSavedDocument(
                    doc.id,
                    "pdf"
                );
            }
        );
}


/* =========================================================
   DOWNLOAD SAVED DOCUMENT
   ========================================================= */

async function downloadSavedDocument(
    id,
    type
) {

    const documents =
        getDocuments();


    const doc =
        documents.find(
            function (item) {

                return item.id === id;
            }
        );


    if (!doc) {
        return;
    }


    await downloadContent(
        doc.content,
        doc.document_type,
        type
    );
}


async function downloadContent(
    content,
    documentType,
    type
) {

    let endpoint = "";
    let extension = "";


    if (type === "txt") {

        endpoint =
            "/download/txt";

        extension =
            "txt";

    } else if (type === "docx") {

        endpoint =
            "/download/docx";

        extension =
            "docx";

    } else if (type === "pdf") {

        endpoint =
            "/download/pdf";

        extension =
            "pdf";

    } else {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}${endpoint}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            content:
                                content,

                            document_type:
                                documentType
                        })
                }
            );


        if (!response.ok) {

            let errorMessage =
                "Download failed.";

            try {

                const data =
                    await response.json();

                errorMessage =
                    data.detail ||
                    errorMessage;

            } catch (error) {
                // Ignore JSON parsing error
            }


            throw new Error(
                errorMessage
            );
        }


        const blob =
            await response.blob();


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;

        link.download =
            `${documentType}.${extension}`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );


    } catch (error) {

        alert(
            `Download failed: ${error.message}`
        );
    }
}


/* =========================================================
   DELETE DOCUMENT
   ========================================================= */

function deleteDocument(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this document?"
        );


    if (!confirmed) {
        return;
    }


    const documents =
        getDocuments();


    const updated =
        documents.filter(
            function (doc) {

                return doc.id !== id;
            }
        );


    saveDocuments(
        updated
    );


    renderDocuments(
        updated
    );
}


/* =========================================================
   SETTINGS PAGE
   ========================================================= */

function openSettings() {

    const settings =
        getSettings();


    const main =
        getMainContainer();


    if (!main) {
        return;
    }


    main.innerHTML = `

        <div class="page-header">

            <div>

                <h1>
                    Settings
                </h1>

                <p>
                    Manage your LegalEase AI preferences.
                </p>

            </div>

        </div>


        <div class="settings-container">

            <div class="settings-card">

                <h2>
                    Document Preferences
                </h2>

                <p class="settings-description">
                    These preferences are used when creating new documents.
                </p>


                <div class="setting-group">

                    <label>
                        Default Jurisdiction
                    </label>

                    <input
                        id="settingsJurisdiction"
                        type="text"
                        value="${escapeHTML(
                            settings.defaultJurisdiction
                        )}"
                        placeholder="India"
                    >

                </div>


                <div class="setting-group">

                    <label>
                        Default Language
                    </label>

                    <select
                        id="settingsLanguage"
                    >

                        <option value="English">
                            English
                        </option>

                        <option value="Hindi">
                            Hindi
                        </option>

                        <option value="Tamil">
                            Tamil
                        </option>

                    </select>

                </div>


                <div class="setting-toggle">

                    <div>

                        <strong>
                            Automatically save documents
                        </strong>

                        <p>
                            Save generated documents in My Documents.
                        </p>

                    </div>


                    <label class="switch">

                        <input
                            id="settingsAutoSave"
                            type="checkbox"
                            ${
                                settings.autoSave !== false
                                    ? "checked"
                                    : ""
                            }
                        >

                        <span class="slider"></span>

                    </label>

                </div>


                <button
                    id="saveSettingsBtn"
                    class="settings-save-button"
                >
                    Save Settings
                </button>


                <div
                    id="settingsMessage"
                    class="settings-message"
                ></div>

            </div>


            <div class="settings-card">

                <h2>
                    API Connection
                </h2>

                <p class="settings-description">
                    LegalEase AI uses the local FastAPI backend for AI generation.
                </p>


                <div class="api-status-row">

                    <span>
                        Backend
                    </span>

                    <strong
                        id="settingsApiStatus"
                    >
                        Checking...
                    </strong>

                </div>


                <div class="api-url">
                    ${API_URL}
                </div>

            </div>


            <div class="settings-card danger-card">

                <h2>
                    Data Management
                </h2>

                <p class="settings-description">
                    Documents are currently stored locally in your browser.
                </p>


                <button
                    id="clearDocumentsBtn"
                    class="danger-button"
                >
                    Delete All Saved Documents
                </button>

            </div>


            <div class="settings-card">

                <h2>
                    About LegalEase AI
                </h2>

                <p class="settings-description">
                    LegalEase AI is an AI-assisted legal document
                    drafting application.
                </p>

                <p class="settings-version">
                    Version 1.0.0
                </p>

                <p class="settings-disclaimer">
                    Documents generated by LegalEase AI are drafts
                    and should be reviewed by a qualified legal
                    professional before use.
                </p>

            </div>

        </div>

    `;


    const languageSelect =
        document.getElementById(
            "settingsLanguage"
        );


    if (languageSelect) {

        languageSelect.value =
            settings.defaultLanguage;
    }


    const saveSettingsButton =
        document.getElementById(
            "saveSettingsBtn"
        );


    if (saveSettingsButton) {

        saveSettingsButton.addEventListener(
            "click",
            function () {

                const newSettings = {

                    defaultJurisdiction:
                        document.getElementById(
                            "settingsJurisdiction"
                        ).value.trim() ||
                        "India",

                    defaultLanguage:
                        document.getElementById(
                            "settingsLanguage"
                        ).value,

                    autoSave:
                        document.getElementById(
                            "settingsAutoSave"
                        ).checked
                };


                saveSettings(
                    newSettings
                );


                applySettingsToForm(
                    newSettings
                );


                const message =
                    document.getElementById(
                        "settingsMessage"
                    );


                if (message) {

                    message.textContent =
                        "Settings saved successfully.";

                    message.classList.add(
                        "show"
                    );


                    setTimeout(
                        function () {

                            message.classList.remove(
                                "show"
                            );

                        },
                        2500
                    );
                }
            }
        );
    }


    const clearDocumentsButton =
        document.getElementById(
            "clearDocumentsBtn"
        );


    if (clearDocumentsButton) {

        clearDocumentsButton.addEventListener(
            "click",
            function () {

                const confirmed =
                    confirm(
                        "Delete all saved documents? This cannot be undone."
                    );


                if (!confirmed) {
                    return;
                }


                localStorage.removeItem(
                    DOCUMENTS_KEY
                );


                alert(
                    "All saved documents have been deleted."
                );
            }
        );
    }


    checkSettingsApiStatus();
}


/* =========================================================
   SETTINGS API STATUS
   ========================================================= */

async function checkSettingsApiStatus() {

    const status =
        document.getElementById(
            "settingsApiStatus"
        );


    if (!status) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/health`
            );


        if (response.ok) {

            status.textContent =
                "Connected";

            status.style.color =
                "#16a34a";

        } else {

            status.textContent =
                "Unavailable";

            status.style.color =
                "#dc2626";
        }


    } catch (error) {

        status.textContent =
            "Offline";

        status.style.color =
            "#dc2626";
    }
}


/* =========================================================
   APPLY SETTINGS
   ========================================================= */

function applySettingsToForm(
    settings
) {

    const jurisdiction =
        document.getElementById(
            "jurisdiction"
        );


    const language =
        document.getElementById(
            "language"
        );


    if (jurisdiction) {

        jurisdiction.value =
            settings.defaultJurisdiction;
    }


    if (language) {

        language.value =
            settings.defaultLanguage;
    }
}


/* =========================================================
   MAIN CONTAINER
   ========================================================= */

function getMainContainer() {

    let main =
        document.querySelector(
            "main"
        );


    if (main) {
        return main;
    }


    main =
        document.querySelector(
            ".main-content"
        );


    if (main) {
        return main;
    }


    main =
        document.querySelector(
            ".content"
        );


    return main;
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const sidebarLinks =
        document.querySelectorAll(
            "aside a, aside button, nav a, nav button, .sidebar a, .sidebar button"
        );


    sidebarLinks.forEach(
        function (element) {

            const text =
                element.textContent
                    .trim()
                    .toLowerCase();


            /* MY DOCUMENTS */

            if (
                text.includes(
                    "my documents"
                )
            ) {

                element.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        openMyDocuments();
                    }
                );
            }


            /* SETTINGS */

            /*
             * IMPORTANT FIX:
             * Use includes() instead of ===
             * so buttons like "⚙ Settings"
             * also work.
             */

            if (
                text.includes(
                    "settings"
                )
            ) {

                element.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        openSettings();
                    }
                );
            }


            /* GENERATE DOCUMENT */

            if (
                text.includes(
                    "generate document"
                )
            ) {

                element.addEventListener(
                    "click",
                    function (event) {

                        const href =
                            element.getAttribute(
                                "href"
                            );


                        if (
                            !href ||
                            href === "#" ||
                            href === ""
                        ) {

                            event.preventDefault();

                            location.reload();
                        }
                    }
                );
            }

        }
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(
    dateString
) {

    if (!dateString) {
        return "Unknown";
    }


    try {

        return new Date(
            dateString
        ).toLocaleString(
            "en-IN",
            {
                dateStyle:
                    "medium",

                timeStyle:
                    "short"
            }
        );

    } catch (error) {

        return dateString;
    }
}


/* =========================================================
   BACKEND CHECK
   ========================================================= */

async function checkBackend() {

    try {

        const response =
            await fetch(
                `${API_URL}/health`
            );


        if (response.ok) {

            console.log(
                "LegalEase backend connected."
            );
        }


    } catch (error) {

        console.warn(
            "Backend is not reachable.",
            error
        );
    }
}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeApp() {

    const settings =
        getSettings();


    applySettingsToForm(
        settings
    );


    setupNavigation();


    checkBackend();


    disableDocumentButtons(
        true
    );
}


initializeApp();