import sys
import requests
import random

BASE_URL = "http://127.0.0.1:8000/api"

try:
    # 1. Generate unique test user
    rand = random.randint(1000, 9999)
    username = f"seeker_{rand}"
    email = f"seeker_{rand}@example.com"
    password = "CareerClarityPassword123!"

    print(f"Creating user {username}...")
    signup_payload = {
        "username": username,
        "email": email,
        "password": password
    }
    r = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload)
    assert r.status_code == 201, f"Signup failed: {r.text}"
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("User created and authenticated successfully!")

    # 2. Add Profile Personal Info
    personal_payload = {
        "first_name": "Raj",
        "last_name": "Sharma",
        "email": email,
        "phone": "+91 9999999999",
        "location": "Roorkee, India",
        "github": "https://github.com/rajsharma",
        "linkedin": "https://linkedin.com/in/rajsharma",
        "website": "https://rajsharma.dev",
        "summary": "Enthusiastic computer science student focusing on cloud engineering and database systems."
    }
    r = requests.post(f"{BASE_URL}/profile/personal", json=personal_payload, headers=headers)
    assert r.status_code == 200, f"Failed to save personal info: {r.text}"
    print("Saved personal info!")

    # 3. Add Profile Project (with team_size and outcome columns)
    project_payload = {
        "title": "Attendance Tracker Dashboard",
        "description": "Built a scalable dashboard to monitor attendance automatically.",
        "technologies": "React, FastAPI, SQLite",
        "role": "Lead Backend Developer",
        "team_size": "4 members",
        "outcome": "Automated attendance tracking for 200+ students, reducing manual effort by 90%",
        "start_date": "05/2026",
        "end_date": "07/2026",
        "url": "https://github.com/rajsharma/attendance-tracker"
    }
    r = requests.post(f"{BASE_URL}/profile/projects", json=project_payload, headers=headers)
    assert r.status_code == 200, f"Failed to save project: {r.text}"
    proj_id = r.json()["id"]
    print(f"Saved project with team_size and outcome (ID: {proj_id})!")

    # 4. Add Skills
    r = requests.post(f"{BASE_URL}/profile/skills", json={"name": "Python", "level": "Advanced"}, headers=headers)
    assert r.status_code == 200
    r = requests.post(f"{BASE_URL}/profile/skills", json={"name": "React", "level": "Intermediate"}, headers=headers)
    assert r.status_code == 200
    print("Saved skills!")

    # 4.5 Add Certification
    cert_payload = {
        "name": "AWS Certified Solutions Architect",
        "issuer": "Amazon Web Services",
        "issue_date": "06/2026",
        "expiry_date": "06/2029",
        "url": "https://aws.amazon.com/verify/123"
    }
    r = requests.post(f"{BASE_URL}/profile/certifications", json=cert_payload, headers=headers)
    assert r.status_code == 200, f"Failed to save cert: {r.text}"
    print("Saved certification!")

    # 5. Add Job Description
    jd_payload = {
        "company_name": "Google",
        "role": "Cloud Software Engineer",
        "jd_text": "We are looking for a Cloud Software Engineer. Requirements: Python, SQL, cloud computing, Docker, Kubernetes. Experience working in agile team environments. Certifications like AWS/GCP developer are preferred."
    }
    r = requests.post(f"{BASE_URL}/jd", json=jd_payload, headers=headers)
    assert r.status_code == 201, f"Failed to save JD: {r.text}"
    jd_id = r.json()["id"]
    print(f"Saved JD (ID: {jd_id})!")

    # 6. Test ATS analysis (Career Clarity metrics validation)
    print("Triggering ATS Analysis...")
    r = requests.post(f"{BASE_URL}/resume/analyze", json={"jd_id": jd_id}, headers=headers)
    assert r.status_code == 200, f"ATS analysis failed: {r.text}"
    report = r.json()
    
    print("\n--- ATS CAREER CLARITY METRICS CHECK ---")
    print(f"Match percentage: {report.get('match_percentage')}%")
    print(f"Matching Skills: {report.get('matching_skills')}")
    print(f"Missing Skills: {report.get('missing_skills')}")
    print(f"Strengths: {report.get('strengths')}")
    print(f"Weaknesses: {report.get('weaknesses')}")
    print(f"Missing Experience: {report.get('missing_experience')}")
    print(f"Missing Certifications: {report.get('missing_certifications')}")
    print(f"Roadmap: {report.get('improvement_roadmap')}")
    
    assert "match_percentage" in report, "match_percentage missing"
    assert "weaknesses" in report, "weaknesses missing"
    assert "missing_experience" in report, "missing_experience missing"
    assert "missing_certifications" in report, "missing_certifications missing"
    assert "improvement_roadmap" in report, "improvement_roadmap missing"
    print("ATS Career Clarity validation succeeded!")

    # 7. Test Tailored Resume & History Generation
    print("Triggering Tailored Resume Generation...")
    r = requests.post(f"{BASE_URL}/resume/generate", json={"jd_id": jd_id}, headers=headers)
    assert r.status_code == 200, f"Resume generation failed: {r.text}"
    gen_resume = r.json()
    resume_id = gen_resume["id"]
    print(f"Generated Resume created successfully (ID: {resume_id})!")
    
    # 8. Test Export PDF
    print("Testing PDF Export...")
    r = requests.get(f"{BASE_URL}/resume/export/{resume_id}/pdf", headers=headers)
    assert r.status_code == 200, f"PDF Export failed: {r.text}"
    assert len(r.content) > 1000, "PDF content seems empty or corrupted"
    print(f"PDF Export succeeded! Received {len(r.content)} bytes.")

    # 9. Test Export DOCX
    print("Testing DOCX Export...")
    r = requests.get(f"{BASE_URL}/resume/export/{resume_id}/docx", headers=headers)
    assert r.status_code == 200, f"DOCX Export failed: {r.text}"
    assert len(r.content) > 1000, "DOCX content seems empty or corrupted"
    print(f"DOCX Export succeeded! Received {len(r.content)} bytes.")

    print("\n--- ALL VERIFICATION TESTS SUCCEEDED ---")
    sys.exit(0)

except Exception as e:
    print(f"Verification script failed: {e}")
    sys.exit(1)
