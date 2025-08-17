from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)
CORS(app)

# configure email
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_ADDRESS = "your_email@gmail.com"
EMAIL_PASSWORD = "your_app_password"  # Use app password (not real Gmail pwd)

@app.route("/send-summary", methods=["POST"])
def send_summary():
    data = request.json
    summary = data.get("summary", "")

    if not summary:
        return jsonify({"error": "No summary provided"}), 400

    # create email
    msg = MIMEText(summary, "plain")
    msg["Subject"] = "Your Summary"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = "receiver_email@gmail.com"

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

        return jsonify({"message": "Summary sent successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
