from flask import Flask, jsonify, request
import sqlite3
from werkzeug.security import generate_password_hash

app = Flask(__name__)

DATABASE = "fixgrid.db"


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
            description TEXT NOT NULL,
            reward REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


@app.route("/api/test")
def test():
    return jsonify({
        "success": True,
        "message": "FixGrid backend is working!"
    })


@app.route("/api/database-test")
def database_test():
    conn = get_db()

    result = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()

    conn.close()

    tables = [row["name"] for row in result]

    return jsonify({
        "success": True,
        "message": "FixGrid database is working!",
        "tables": tables
    })


@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Name, email and password are required."
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters."
        }), 400

    password_hash = generate_password_hash(password)

    conn = get_db()

    try:
        cursor = conn.execute("""
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
        """, (name, email, password_hash))

        conn.commit()

        user_id = cursor.lastrowid

    except sqlite3.IntegrityError:
        conn.close()

        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 409

    conn.close()

    return jsonify({
        "success": True,
        "message": "Account created successfully!",
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "role": "researcher"
        }
    }), 201


if __name__ == "__main__":
    init_db()
    app.run(debug=True)