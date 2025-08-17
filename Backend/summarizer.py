# from transformers import pipeline

# # Use a summarization model from Hugging Face
# summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# def summarize_text(text):
#     # Split large text into chunks for summarization
#     max_chunk = 1000
#     chunks = [text[i:i+max_chunk] for i in range(0, len(text), max_chunk)]
#     summary = ""
#     for chunk in chunks:
#         result = summarizer(chunk, max_length=150, min_length=40, do_sample=False)
#         summary += result[0]['summary_text'] + " "
#     return summary.strip()
