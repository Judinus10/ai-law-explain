# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import fitz  # PyMuPDF
# from summarizer import summarize_text
# from clause_detector import detect_clauses
# from qa_engine import answer_question

# app = Flask(__name__)
# CORS(app)  # Allow frontend (React) to call backend

# @app.route("/upload", methods=["POST"])
# def upload_pdf():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file uploaded"}), 400

#     file = request.files['file']
#     pdf = fitz.open(stream=file.read(), filetype="pdf")
#     text = ""
#     for page in pdf:
#         text += page.get_text()

#     summary = summarize_text(text)
#     clauses, risks = detect_clauses(text)

#     return jsonify({
#         "summary": summary,
#         "clauses": clauses,
#         "risks": risks,
#         "context": text  # full text for Q&A
#     })

# @app.route("/ask", methods=["POST"])
# def ask_question():
#     data = request.json
#     question = data.get("question")
#     context = data.get("context")

#     if not question or not context:
#         return jsonify({"error": "Missing question or context"}), 400

#     answer, confidence = answer_question(question, context)
#     return jsonify({
#         "answer": answer,
#         "confidence": confidence
#     })

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)


from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
import fitz  # PyMuPDF
from transformers import pipeline
from keybert import KeyBERT

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
EMAIL_PASSWORD = "tlcm hmuq lvhv fynw"  # ⚠️ Use Gmail App Password, not your real password


# ---------------------
# Helper Functions
# ---------------------
def summarize_text(text):
    max_chunk = 1000
    chunks = [text[i:i+max_chunk] for i in range(0, len(text), max_chunk)]
    summary = ""
    for chunk in chunks:
        result = summarizer(chunk, max_length=150, min_length=40, do_sample=False)
        summary += result[0]['summary_text'] + " "
    return summary.strip()


def detect_clauses(text):
    keywords = kw_model.extract_keywords(text, top_n=10)
    clauses = [{"type": "Clause", "text": k[0]} for k in keywords]

    risks = []
    for word, score in keywords:
        if word.lower() in ["penalty", "termination", "auto-renewal"]:
            risks.append({"text": word, "severity": "major"})
    return clauses, risks


def answer_question(question, context):
    result = qa_model(question=question, context=context)
    answer = result['answer']
    confidence = round(result['score'] * 100, 2)
    return answer, confidence


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
    text = ""
    for page in pdf:
        text += page.get_text()

    summary = summarize_text(text)
    clauses, risks = detect_clauses(text)

    return jsonify({
        "summary": summary,
        "clauses": clauses,
        "risks": risks,
        "context": text
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
    recipient_email = data.get("email", "")

    if not summary:
        return jsonify({"error": "No summary provided"}), 400

    if not recipient_email:
        return jsonify({"error": "No recipient email provided"}), 400

    msg = MIMEText(summary, "plain")
    msg["Subject"] = "Your Document Summary"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = recipient_email

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

        return jsonify({"message": "Summary sent successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------
# Run App
# ---------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
