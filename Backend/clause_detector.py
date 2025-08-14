from keybert import KeyBERT

kw_model = KeyBERT()

def detect_clauses(text):
    # Extract top 10 keywords as "clauses"
    keywords = kw_model.extract_keywords(text, top_n=10)
    clauses = [{"type": "Clause", "text": k[0]} for k in keywords]

    # Very basic risk detection (example)
    risks = []
    for word, score in keywords:
        if word.lower() in ["penalty", "termination", "auto-renewal"]:
            risks.append(word)
    return clauses, risks
