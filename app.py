from flask import Flask, jsonify, request, send_file
import sqlite3
import secrets
import os
import json
import urllib.request
import urllib.error
from werkzeug.security import generate_password_hash

app = Flask(__name__)

DATABASE = "fixgrid.db"


# =========================
# DATABASE
# =========================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'researcher',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS bounties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            reward REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_code TEXT NOT NULL UNIQUE,
            company_name TEXT NOT NULL,
            reporter_name TEXT,
            reporter_email TEXT,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            severity TEXT DEFAULT 'medium',
            status TEXT NOT NULL DEFAULT 'submitted',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS contact_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_code TEXT NOT NULL UNIQUE,
            company_name TEXT NOT NULL,
            reporter_name TEXT,
            reporter_email TEXT,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


# =========================
# MAIN WEBSITE
# =========================

@app.route("/")
def home():
    return send_file("index.html")


@app.route("/style.css")
def style():
    return send_file("style.css", mimetype="text/css")


@app.route("/script.js")
def script():
    return send_file("script.js", mimetype="application/javascript")


# =========================
# FIXGRID AI CHAT
# =========================

@app.route("/ask", methods=["POST"])
def ask():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "reply": "No message received."
        }), 400

    message = data.get("message", "").strip()
    company_name = data.get("company", "FixGrid").strip()

    if not message:
        return jsonify({
            "success": False,
            "reply": "Please type a message."
        }), 400

    # Get Gemini API key from environment
    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        return jsonify({
            "success": False,
            "reply": "⚠️ Gemini API key is not configured on the server."
        }), 500

    # AI instructions
    prompt = f"""
You are FixGrid AI, the official AI support assistant for FixGrid.

Company:
{company_name}

User message:
{message}

Your job is to help the user with FixGrid.

You can help with:
- Reporting problems
- Explaining FixGrid
- Feedback
- Report tracking
- Company contact requests
- General questions about FixGrid

Rules:
1. Be friendly and professional.
2. Keep answers clear and reasonably short.
3. Use simple language.
4. Do not pretend that an action was completed if the website has not actually completed it.
5. If the user wants to track a report, ask for their report ID/code.
6. If the user wants to report a problem, help them describe the problem clearly.
7. If the question is unrelated to FixGrid, still answer helpfully when appropriate.
"""

    # Gemini REST API
    url = (
        "https://generativelanguage.googleapis.com/"
        "v1beta/models/gemini-3.8-flash:generateContent"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }

    try:

        request_data = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(
            url,
            data=request_data,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": api_key
            },
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=30) as response:

            response_data = response.read().decode("utf-8")

            result = json.loads(response_data)

        # Get AI response
        reply = (
            result["candidates"][0]
            ["content"]
            ["parts"][0]
            ["text"]
        )

        return jsonify({
            "success": True,
            "reply": reply
        })

    except urllib.error.HTTPError as error:

        error_body = error.read().decode(
            "utf-8",
            errors="ignore"
        )

        print("Gemini HTTP Error:")
        print(error_body)

        return jsonify({
            "success": False,
            "reply": "⚠️ Gemini AI request failed. Please check the API key or model."
        }), 500

    except Exception as error:

        print("Gemini Error:")
        print(error)

        return jsonify({
            "success": False,
            "reply": "⚠️ FixGrid AI is temporarily unavailable."
        }), 500


# =========================
# BASIC TEST
# =========================

@app.route("/api/test")
def api_test():

    return jsonify({
        "success": True,
        "message": "FixGrid Flask server is working!"
    })


# =========================
# DATABASE TEST
# =========================

@app.route("/api/database-test")
def database_test():

    try:

        conn = get_db()

        tables = conn.execute("""
            SELECT name
            FROM sqlite_master
            WHERE type='table'
        """).fetchall()

        table_names = [row["name"] for row in tables]

        conn.close()

        return jsonify({
            "success": True,
            "message": "FixGrid database is working!",
            "tables": table_names
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# =========================
# SIGNUP
# =========================

@app.route("/api/signup", methods=["POST"])
def signup():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not name or not email or not password:

        return jsonify({
            "success": False,
            "message": "Name, email and password are required."
        }), 400

    try:

        conn = get_db()

        password_hash = generate_password_hash(password)

        conn.execute("""
            INSERT INTO users
            (name, email, password_hash)
            VALUES (?, ?, ?)
        """, (
            name,
            email,
            password_hash
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Account created successfully!"
        })

    except sqlite3.IntegrityError:

        return jsonify({
            "success": False,
            "message": "This email is already registered."
        }), 409

    except Exception as error:

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500


# =========================
# REPORT PROBLEM
# =========================

@app.route("/api/reports", methods=["POST"])
def create_report():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    company_name = data.get("company_name", "").strip()
    reporter_name = data.get("reporter_name", "").strip()
    reporter_email = data.get("reporter_email", "").strip()
    report_type = data.get("type", "").strip()
    message = data.get("message", "").strip()
    severity = data.get("severity", "medium").strip()

    if not company_name or not report_type or not message:

        return jsonify({
            "success": False,
            "message": "Company, type and message are required."
        }), 400

    report_code = "FG-" + secrets.token_hex(4).upper()

    try:

        conn = get_db()

        conn.execute("""
            INSERT INTO reports
            (
                report_code,
                company_name,
                reporter_name,
                reporter_email,
                type,
                message,
                severity
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            report_code,
            company_name,
            reporter_name,
            reporter_email,
            report_type,
            message,
            severity
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Report submitted successfully!",
            "report_code": report_code
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500


# =========================
# CHECK REPORT
# =========================

@app.route("/api/reports/<report_code>")
def get_report(report_code):

    try:

        conn = get_db()

        report = conn.execute("""
            SELECT *
            FROM reports
            WHERE report_code = ?
        """, (report_code,)).fetchone()

        conn.close()

        if not report:

            return jsonify({
                "success": False,
                "message": "Report not found."
            }), 404

        return jsonify({
            "success": True,
            "report": dict(report)
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500


# =========================
# CONTACT COMPANY
# =========================

@app.route("/api/contact-company", methods=["POST"])
def contact_company():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    company_name = data.get("company_name", "").strip()
    reporter_name = data.get("reporter_name", "").strip()
    reporter_email = data.get("reporter_email", "").strip()
    message = data.get("message", "").strip()

    if not company_name or not message:

        return jsonify({
            "success": False,
            "message": "Company and message are required."
        }), 400

    request_code = "FC-" + secrets.token_hex(4).upper()

    try:

        conn = get_db()

        conn.execute("""
            INSERT INTO contact_requests
            (
                request_code,
                company_name,
                reporter_name,
                reporter_email,
                message
            )
            VALUES (?, ?, ?, ?, ?)
        """, (
            request_code,
            company_name,
            reporter_name,
            reporter_email,
            message
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Contact request submitted successfully!",
            "request_code": request_code
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500


# =========================
# START SERVER
# =========================

if __name__ == "__main__":

    init_db()

    app.run(
        debug=True
    )