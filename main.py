import os
from flask import Flask, render_template, abort, request, jsonify
from supabase import create_client, Client
from dotenv import load_dotenv
import re
from datetime import datetime
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import request, jsonify
import gspread
from google.oauth2.service_account import Credentials
import json

load_dotenv()


app = Flask(__name__)

#url: str = os.environ.get("SUPABASE_URL")
#key: str = os.environ.get("SUPABASE_KEY")

#if not url or not key:
 #   raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env")

#supabase: Client = create_client(url, key)


SMTP_EMAIL = os.getenv("SMTP_EMAIL") 
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD") 
GSHEET_ID = os.getenv("GSHEET_ID")
GCREDS_PATH = os.getenv("GCREDS_PATH", "service_account.json")

def get_site_data():
    """Fetch all data from Supabase in parallel-ish calls"""
    try:
        testimonials = supabase.table("testimonials")\
            .select("*")\
            .eq("is_active", True)\
            .order("display_order")\
            .execute()
            
        stats = supabase.table("site_stats")\
            .select("*")\
            .eq("id", 1)\
            .single()\
            .execute()
            
        features = supabase.table("features")\
            .select("*")\
            .eq("is_active", True)\
            .order("display_order")\
            .execute()

        return {
            "testimonials": testimonials.data,
            "stats": stats.data,
            "features": features.data
        }
    except Exception as e:
        print(f"Supabase error: {e}")
        return {
            "testimonials": [],
            "stats": {"schools_onboarded": "100+", "parent_satisfaction": "98%", "setup_time": "< 5 min", "uptime_sla": "99.9%"},
            "features": []
        }

@app.route("/")
def home():
    data = get_site_data()
    return render_template(
        "index.html",
        testimonials=data["testimonials"],
        stats=data["stats"],
        features=data["features"],
        trusted_count=data["stats"].get("schools_onboarded"),
        year=2025
    )


def send_email_notification(data):
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = 'rehnova@proton.me'
        msg['Subject'] = f"New ScholarMS Demo: {data['school_name']}"

        body = f"""
        New demo request received:

        Name: {data['full_name']}
        School: {data['school_name']}
        Phone: {data['phone']}
        Email: {data['email']}
        Students: {data['students_count']}
        Preferred Time: {data['preferred_time']}
        Message: {data.get('message', 'N/A')}
        Source: website
        """

        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Email send error: {e}")
        return False

def log_to_gsheet(data):
    try:
        scope = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
        
        # Check if we have JSON content in env var first
        gcreds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
        if gcreds_json:
            creds_info = json.loads(gcreds_json)
            creds = Credentials.from_service_account_info(creds_info, scopes=scope)
        else:
            # Fallback to file for local dev
            creds = Credentials.from_service_account_file(GCREDS_PATH, scopes=scope)
            
        client = gspread.authorize(creds)
        sheet = client.open_by_key(GSHEET_ID).worksheet('scholarms_inquiries')

        # Add headers if sheet is empty
        if not sheet.row_values(1):
            sheet.append_row([
                "Timestamp", "Full Name", "School Name", "Phone", "Email",
                "Students Count", "Preferred Time", "Message", "Status"
            ])

        from datetime import datetime
        sheet.append_row([
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            data['full_name'],
            data['school_name'],
            data['phone'],
            data['email'],
            data['students_count'],
            data['preferred_time'],
            data.get('message', ''),
            "new"
        ])
        return True
    except Exception as e:
        print(f"GSheet error: {e}")
        return False

@app.route("/api/book-demo", methods=["POST"])
def book_demo():
    try:
        data = request.get_json()

        required_fields = ['full_name', 'school_name', 'phone', 'email', 'students_count', 'preferred_time']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400

        email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_regex, data['email']):
            return jsonify({"error": "Invalid email format"}), 400

        phone_digits = re.sub(r'\D', '', data['phone'])
        if len(phone_digits) < 10:
            return jsonify({"error": "Phone number must have at least 10 digits"}), 400

        demo_request = {
            "full_name": data['full_name'].strip(),
            "school_name": data['school_name'].strip(),
            "phone": data['phone'].strip(),
            "email": data['email'].strip().lower(),
            "students_count": data['students_count'],
            "preferred_time": data['preferred_time'],
            "message": data.get('message', '').strip(),
            "status": "new",
            "source": "website"
        }


        # 2. Send email - don't fail request if this breaks
        send_email_notification(demo_request)

        # 3. Log to GSheet - don't fail request if this breaks
        log_to_gsheet(demo_request)

        return jsonify({
            "success": True,
            "message": "Demo request received",
        }), 200

    except Exception as e:
        print(f"Demo booking error: {e}")
        return jsonify({"error": "Server error. Please try again later."}), 500
    


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
