# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import smtplib
# from email.mime.text import MIMEText

# app = Flask(__name__)
# CORS(app)

# # configure email
# EMAIL_HOST = "smtp.gmail.com"
# EMAIL_PORT = 587
# EMAIL_ADDRESS = "judinushu@gmail.com"
# EMAIL_PASSWORD = "tlcm hmuq lvhv fynw"  # Use app password (not real Gmail pwd)

# @app.route("/send-summary", methods=["POST"])
# def send_summary():
#     if request.method == "OPTIONS":
#         return jsonify({"status": "ok"}), 200
    
#     data = request.json
#     summary = data.get("summary", "")
#     recipient_email = data.get("email", "")

#     if not summary:
#         return jsonify({"error": "No summary provided"}), 400

#     if not recipient_email:
#         return jsonify({"error": "No recipient email provided"}), 400

#     # create email
#     msg = MIMEText(summary, "plain")
#     msg["Subject"] = "Your Summary"
#     msg["From"] = EMAIL_ADDRESS
#     msg["To"] = recipient_email

#     try:
#         with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
#             server.starttls()
#             server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
#             server.send_message(msg)

#         return jsonify({"message": "Summary sent successfully!"})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# if __name__ == "__main__":
#     app.run(debug=True)
