import os
import re
import sqlite3
from datetime import datetime
from flask import Flask, jsonify, request, session, render_template, send_from_directory, redirect, url_for
from hashlib import sha256


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(BASE_DIR, 'db')
USERS_DB_PATH = os.path.join(DB_DIR, 'users.db')
OFFERS_DB_PATH = os.path.join(DB_DIR, 'offers.db')
SERVICES_DB_PATH = os.path.join(DB_DIR, 'services.db')


def create_app() -> Flask:
    app = Flask(
        __name__,
        static_folder='assets',
        template_folder='.'
    )
    app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev-secret-change-me')
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

    os.makedirs(DB_DIR, exist_ok=True)
    _init_users_db()
    _ensure_file(OFFERS_DB_PATH)
    _ensure_file(SERVICES_DB_PATH)

    @app.get('/')
    def home():
        return render_template('index.html')

    # Map main pages to templates
    @app.get('/index.html')
    def index_html():
        return render_template('index.html')

    @app.get('/offres.html')
    def offres_html():
        return render_template('offres.html')

    @app.get('/etudiants.html')
    def etudiants_html():
        return render_template('etudiants.html')

    @app.get('/entreprises.html')
    def entreprises_html():
        return render_template('entreprises.html')

    @app.get('/particuliers.html')
    def particuliers_html():
        return render_template('particuliers.html')

    @app.get('/contact.html')
    def contact_html():
        return render_template('contact.html')

    @app.get('/bug.html')
    def bug_html():
        return render_template('bug.html')

    @app.get('/confidentialite.html')
    def privacy_html():
        return render_template('confidentialite.html')

    # Static files already served via app.static_folder ('/assets/...')

    # Auth API
    @app.get('/api/auth_state')
    def api_auth_state():
        if 'user' in session:
            return jsonify({
                'authenticated': True,
                'user': session['user']
            })
        return jsonify({'authenticated': False})

    @app.post('/api/register')
    def api_register():
        data = request.get_json(silent=True) or {}
        name = (data.get('name') or '').strip()
        email = ((data.get('email') or '').strip()).lower()
        password = data.get('password') or ''
        role = (data.get('role') or 'etudiant').strip()

        if not name:
            return _error('Veuillez saisir un nom.'), 400
        if not _valid_email(email):
            return _error('Adresse e-mail invalide.'), 400
        if len(password) < 6:
            return _error('Mot de passe trop court (min. 6 caractères).'), 400
        if role not in {'etudiant', 'entreprise', 'particulier', 'admin'}:
            return _error('Rôle invalide.'), 400

        with _users_conn() as conn:
            cur = conn.cursor()
            cur.execute('SELECT id FROM users WHERE email = ?', (email,))
            if cur.fetchone():
                return _error('Un compte existe déjà avec cet e-mail.'), 409
            password_hash = sha256(password.encode('utf-8')).hexdigest()
            now = datetime.utcnow().isoformat()
            cur.execute(
                'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
                (name, email, password_hash, role, now)
            )
            user_id = cur.lastrowid
            user = {'id': user_id, 'name': name, 'email': email, 'role': role}
            session['user'] = user
            return jsonify({'ok': True, 'user': user})

    @app.post('/api/login')
    def api_login():
        data = request.get_json(silent=True) or {}
        email = ((data.get('email') or '').strip()).lower()
        password = data.get('password') or ''
        if not _valid_email(email):
            return _error('Adresse e-mail invalide.'), 400
        with _users_conn() as conn:
            cur = conn.cursor()
            cur.execute('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', (email,))
            row = cur.fetchone()
            if not row:
                return _error('Aucun compte trouvé pour cet e-mail.'), 404
            pw_hash = row[3]
            if sha256(password.encode('utf-8')).hexdigest() != pw_hash:
                return _error('Mot de passe incorrect.'), 401
            user = {'id': row[0], 'name': row[1], 'email': row[2], 'role': row[4]}
            session['user'] = user
            return jsonify({'ok': True, 'user': user})

    @app.post('/api/logout')
    def api_logout():
        session.clear()
        return jsonify({'ok': True})

    return app


def _ensure_file(path: str) -> None:
    if not os.path.exists(path):
        open(path, 'a').close()


def _users_conn():
    conn = sqlite3.connect(USERS_DB_PATH)
    return conn


def _init_users_db() -> None:
    with _users_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            '''CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TEXT NOT NULL
            )'''
        )
        conn.commit()


def _valid_email(email: str) -> bool:
    return re.match(r"^\S+@\S+\.\S+$", email) is not None


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', '3200'))
    app.run(host='0.0.0.0', port=port, debug=True)

