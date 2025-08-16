from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz  # PyMuPDF
from summarizer import summarize_text
from clause_detector import detect_clauses
from qa_engine import answer_question

app = Flask(__name__)
CORS(app)  # Allow frontend (React) to call backend

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "AI Law Backend is running ✅"})

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
        "context": text  # full text for Q&A
    })

@app.route("/ask", methods=["POST"])
def ask_question():
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

if __name__ == "__main__":
    app.run(debug=True, port=5000)
