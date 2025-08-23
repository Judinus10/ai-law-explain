import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import fitz  # PyMuPDF
from transformers import pipeline
from keybert import KeyBERT
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# ---------------------
# Flask App Setup
# ---------------------
app = Flask(__name__)
CORS(app)

# ---------------------
# AI Models
# ---------------------
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
qa_model = pipeline("question-answering", model="distilbert-base-cased-distilled-squad")
kw_model = KeyBERT()

# ---------------------
# Email Config
# ---------------------
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_ADDRESS = "judinushu@gmail.com"
EMAIL_PASSWORD = "tlcm hmuq lvhv fynw"

# ---------------------
# Helper Functions
# ---------------------
def summarize_text(text):
    """Summarize text into readable bullet points."""
    max_chunk = 1000
    chunks = [text[i:i + max_chunk] for i in range(0, len(text), max_chunk)]
    summary = ""
    for chunk in chunks:
        result = summarizer(chunk, max_length=150, min_length=50, do_sample=False)
        summary += result[0]['summary_text'] + " "

    sentences = summary.split(". ")
    bullets = [f"• {s.strip()}." for s in sentences if s.strip()]
    formatted_summary = "\n".join(bullets)
    return formatted_summary

def detect_clauses(text: str):
    """Detect key clauses and risks in the legal text."""
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)

    # Extract keywords using KeyBERT
    keywords = [k[0].lower() for k in kw_model.extract_keywords(text, top_n=15)]

    # ----------------------
    # Clauses
    # ----------------------
    clauses = []
    for sent in sentences:
        for kw in keywords:
            if kw in sent.lower() and len(sent.strip()) > 20:
                if sent.strip() not in [c["text"] for c in clauses]:
                    clauses.append({"type": "Clause", "text": sent.strip()})
    clauses = clauses[:10]  # Top 10 clauses

    # ----------------------
    # Risks / Red Flags
    # ----------------------
    risk_keywords = [
        "penalty", "termination", "auto-renewal", "breach",
        "liable", "indemnify", "damages", "loss", "obligation"
    ]
    risks = []
    for sent in sentences:
        for rk in risk_keywords:
            if rk in sent.lower() and len(sent.strip()) > 10:
                severity = "major" if rk in ["penalty", "termination", "breach", "liable", "indemnify"] else "minor"
                if sent.strip() not in [r["text"] for r in risks]:
                    risks.append({"text": sent.strip(), "severity": severity})
    risks = risks[:10]

    return clauses, risks


def answer_question(question, context):
    """Answer a question based on the context."""
    result = qa_model(question=question, context=context)
    answer = result['answer']
    confidence = round(result['score'] * 100, 2)
    return answer, confidence

def generate_pdf(document_name: str, summary: str):
    """Generate a PDF in memory with document name and formatted summary."""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, f"Document Summary: {document_name}")

    c.setFont("Helvetica", 12)
    c.drawString(50, height - 80, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Add bullet-pointed summary with page wrapping
    text_object = c.beginText(50, height - 120)
    text_object.setFont("Helvetica", 12)
    y_pos = height - 120
    for line in summary.split("\n"):
        if y_pos < 50:
            c.drawText(text_object)
            c.showPage()
            text_object = c.beginText(50, height - 50)
            text_object.setFont("Helvetica", 12)
            y_pos = height - 50
        text_object.textLine(line)
        y_pos -= 14
    c.drawText(text_object)

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer

# ---------------------
# Routes
# ---------------------
@app.route("/")
def home():
    return {"message": "Backend is running!"}

@app.route("/upload", methods=["POST"])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    pdf = fitz.open(stream=file.read(), filetype="pdf")
    text = "".join([page.get_text() for page in pdf])

    summary = summarize_text(text)
    bullets = summary.split(". ")
    formatted_summary = [f"• {s.strip()}." for s in bullets if s]

    clauses, risks = detect_clauses(text)

    return jsonify({
        "summary": formatted_summary,
        "clauses": clauses,
        "risks": risks,
        "context": text,
        "document_name": file.filename
    })

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question")
    context = data.get("context")

    if not question or not context:
        return jsonify({"error": "Missing question or context"}), 400

    answer, confidence = answer_question(question, context)
    return jsonify({
        "answer": answer,
        "confidence": confidence
    })

@app.route("/send-summary", methods=["POST"])
def send_summary():
    data = request.json
    summary = data.get("summary", "")
    risks = data.get("risks", [])
    recipient_email = data.get("email", "")
    document_name = data.get("document_name", "Legal Document")

    if not summary or not recipient_email:
        return jsonify({"error": "Missing summary or recipient email"}), 400

    # Combine summary and risks for PDF
    full_text = summary + "\n\n=== Risks ===\n" + "\n".join([f"- {r['text']} (Severity: {r['severity']})" for r in risks])

    # Generate PDF
    pdf_buffer = generate_pdf(document_name, full_text)

    # Prepare email
    message = MIMEMultipart()
    message["From"] = EMAIL_ADDRESS
    message["To"] = recipient_email
    message["Subject"] = f"Summary for {document_name}"

    body_text = (
        f"Dear user,\n\n"
        f"Please find attached the PDF summary for your document: {document_name}.\n\n"
        f"Generated by AI Legal Assistant on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}.\n\n"
        f"Regards,\nAI Legal Assistant"
    )
    message.attach(MIMEText(body_text, "plain"))

    # Attach PDF
    part = MIMEApplication(pdf_buffer.read(), Name=f"{document_name}-Summary.pdf")
    part['Content-Disposition'] = f'attachment; filename="{document_name}-Summary.pdf"'
    message.attach(part)

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(message)
        return jsonify({"message": "Summary sent successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# ---------------------
# Run App
# ---------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
