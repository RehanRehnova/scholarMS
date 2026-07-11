import os
from flask import Flask, render_template, abort, request, jsonify
from supabase import create_client, Client
from dotenv import load_dotenv
import re
from datetime import datetime


load_dotenv()


app = Flask(__name__)

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
        result = supabase.table("demo_requests").insert(demo_request).execute()
        print(result)
        if not result.data:
            return jsonify({"error": "Failed to save request"}), 500

        return jsonify({
            "success": True,
            "message": "Demo request received",
            "id": result.data[0]['id']
        }), 201

    except Exception as e:
        print(f"Demo booking error: {e}")
        return jsonify({"error": "Server error. Please try again later."}), 500
    


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
