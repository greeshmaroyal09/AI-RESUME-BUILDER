import json
import re
from typing import List, Dict, Any, Optional, Tuple
import google.generativeai as genai
from app.config import settings
from app.schemas import ChatMessage

# ─────────────────────────────────────────────────────────────────────────────
# Field definitions per section
# ─────────────────────────────────────────────────────────────────────────────
SECTION_FIELDS = {
    "personal_info": ["first_name", "last_name", "email", "phone", "location", "github", "linkedin", "website", "summary"],
    "education":     ["institution", "degree", "field_of_study", "start_date", "end_date", "gpa", "location"],
    "skills":        ["name", "level"],
    "technologies":  ["name", "category"],
    "projects":      ["title", "description", "technologies", "role", "team_size", "outcome", "start_date", "end_date", "url"],
    "internships":   ["company", "role", "description", "start_date", "end_date", "location"],
    "certifications":["name", "issuer", "issue_date", "expiry_date", "url"],
    "leadership":    ["organization", "role", "description", "start_date", "end_date"],
    "achievements":  ["title", "description", "date"],
    "positions":     ["organization", "role", "description", "start_date", "end_date"],
}

# ─────────────────────────────────────────────────────────────────────────────
# Ordered question flows per section  (field_key, question, field_type)
# field_type: text | date | gpa | url | phone | email | level | category | team_size | optional_url | optional_date | multiline
# ─────────────────────────────────────────────────────────────────────────────
SECTION_PROMPTS: Dict[str, List[tuple]] = {
    "education": [
        ("institution",  "What is the name of your school, college, or university?",                                          "text"),
        ("degree",       "What degree or diploma did you pursue? (e.g. B.Tech, B.Sc, High School)",                            "text"),
        ("field_of_study","What was your major or field of study? (e.g. Computer Science, Electronics)",                      "text"),
        ("start_date",   "When did you start? (Format: MM/YYYY — e.g. 08/2021)",                                               "date"),
        ("end_date",     "When did you graduate or expect to? (Format: MM/YYYY or type 'Present')",                            "date_or_present"),
        ("gpa",          "What was your GPA / CGPA / percentage? (e.g. 8.67, 92%) — type 'Skip' to leave blank",              "gpa"),
        ("location",     "Where is this institution located? (e.g. Roorkee, Uttarakhand)",                                    "text"),
    ],
    "projects": [
        ("title",        "What is the project name / title?",                                                                   "text"),
        ("description",  "Describe the project: What problem did it solve? What was your approach?",                            "multiline"),
        ("technologies", "What technologies, languages, or frameworks did you use? (comma-separated)",                           "text"),
        ("role",         "What was your specific role? (e.g. Backend Developer, Full Stack Lead)",                               "text"),
        ("team_size",    "What was the team size? (e.g. Solo, 3 members, 5 members)",                                           "team_size"),
        ("outcome",      "What was the measurable outcome or impact? (e.g. Reduced loading time by 40%, served 500 users)",    "multiline"),
        ("start_date",   "When did this project start? (MM/YYYY — e.g. 01/2024)",                                               "date"),
        ("end_date",     "When did it end? (MM/YYYY or 'Present')",                                                             "date_or_present"),
        ("url",          "Do you have a GitHub or live URL? (type 'Skip' to leave blank)",                                      "optional_url"),
    ],
    "internships": [
        ("company",      "What was the company or organization name?",                                                           "text"),
        ("role",         "What was your role or title? (e.g. Software Engineering Intern)",                                      "text"),
        ("description",  "Describe your key responsibilities and accomplishments during the internship.",                        "multiline"),
        ("start_date",   "When did the internship start? (MM/YYYY)",                                                             "date"),
        ("end_date",     "When did it end? (MM/YYYY or 'Present')",                                                              "date_or_present"),
        ("location",     "Where was it located? (e.g. Bengaluru, India or Remote)",                                             "text"),
    ],
    "personal_info": [
        ("first_name",   "What is your first name?",                                                                             "text"),
        ("last_name",    "What is your last name?",                                                                              "text"),
        ("email",        "What is your professional email address?",                                                             "email"),
        ("phone",        "What is your contact phone number? (e.g. +91 9876543210)",                                            "phone"),
        ("location",     "Where are you currently located? (e.g. New Delhi, India)",                                            "text"),
        ("github",       "Your GitHub profile URL? (type 'Skip' to leave blank)",                                               "optional_url"),
        ("linkedin",     "Your LinkedIn profile URL? (type 'Skip' to leave blank)",                                             "optional_url"),
        ("website",      "Your portfolio/personal website URL? (type 'Skip' to leave blank)",                                   "optional_url"),
        ("summary",      "Write a brief professional summary about yourself — your skills, goals, and background.",             "multiline"),
    ],
    "skills": [
        ("name",         "What is the skill name? (e.g. Python, UI/UX Design, Machine Learning)",                               "text"),
        ("level",        "What is your proficiency level? (Beginner / Intermediate / Advanced)",                                 "level"),
    ],
    "technologies": [
        ("name",         "What technology did you work with? (e.g. Docker, React, PostgreSQL)",                                  "text"),
        ("category",     "What category does it belong to? (Languages / Frameworks / Databases / Developer Tools / Cloud)",     "category"),
    ],
    "certifications": [
        ("name",         "What is the official certification name?",                                                              "text"),
        ("issuer",       "Who issued it? (e.g. AWS, Coursera, Google, NPTEL)",                                                   "text"),
        ("issue_date",   "When was it issued? (MM/YYYY)",                                                                        "date"),
        ("expiry_date",  "When does it expire? (MM/YYYY or type 'Never' / 'Skip')",                                              "optional_date"),
        ("url",          "Do you have a credential verification URL? (type 'Skip' to leave blank)",                              "optional_url"),
    ],
    "leadership": [
        ("organization", "What was the organization or student club name?",                                                       "text"),
        ("role",         "What was your leadership title? (e.g. Club President, Technical Head)",                                "text"),
        ("description",  "Describe your responsibilities and key achievements in this role.",                                    "multiline"),
        ("start_date",   "When did you start? (MM/YYYY)",                                                                        "date"),
        ("end_date",     "When did you finish? (MM/YYYY or 'Present')",                                                          "date_or_present"),
    ],
    "achievements": [
        ("title",        "What was the title of the achievement or award?",                                                      "text"),
        ("description",  "Describe the achievement — what did you do to earn it and what was its significance?",                 "multiline"),
        ("date",         "When did you receive it? (MM/YYYY)",                                                                    "date"),
    ],
    "positions": [
        ("organization", "What was the organization name?",                                                                       "text"),
        ("role",         "What was your position title?",                                                                         "text"),
        ("description",  "Describe your duties and what you managed or organized.",                                               "multiline"),
        ("start_date",   "When did you start? (MM/YYYY)",                                                                        "date"),
        ("end_date",     "When did you finish? (MM/YYYY or 'Present')",                                                          "date_or_present"),
    ],
}


# ─────────────────────────────────────────────────────────────────────────────
# Field validators
# ─────────────────────────────────────────────────────────────────────────────
DATE_PATTERN   = re.compile(r'^(0[1-9]|1[0-2])/\d{4}$')
URL_PATTERN    = re.compile(r'^https?://', re.IGNORECASE)
EMAIL_PATTERN  = re.compile(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$')
PHONE_PATTERN  = re.compile(r'^\+?\d[\d\s\-\(\)]{7,}$')
GPA_PATTERN    = re.compile(r'^\d{1,3}(\.\d{1,2})?%?$')
LEVEL_VALUES   = {"beginner", "intermediate", "advanced"}
CATEGORY_VALUES = {"languages", "frameworks", "databases", "developer tools", "cloud", "tools", "libraries", "other"}
TEAM_PATTERN   = re.compile(r'(solo|individual|\d+)', re.IGNORECASE)
SKIP_WORDS     = {"skip", "none", "no", "n/a", "skip this", "nothing", "na", "never"}


def validate_field(value: str, field_type: str) -> Tuple[bool, str]:
    """
    Returns (is_valid, error_message).
    empty string = valid (means user skipped optional field intentionally handled upstream).
    """
    v = value.strip()
    lv = v.lower()

    if field_type == "text":
        if len(v) < 2:
            return False, "Please provide a proper answer (at least 2 characters)."
            
        # Reject meaningless single/short words
        meaningless = {"ok", "yes", "no", "test", "na", "n/a", "none", "skip", "idk"}
        if lv in meaningless:
            return False, f'"{v}" is not a valid answer for this field. Please provide actual details.'
            
        # Reject inputs that look like field names or other section data
        suspicious = ["responsibilities", "achievements", "technologies", "certifications", "internship", "cgpa", "gpa"]
        if any(s in lv for s in suspicious) and len(v.split()) <= 2:
            return False, f'That looks like a category name, not a valid answer. Please give me the actual information.'
        return True, ""

    elif field_type == "date":
        if not DATE_PATTERN.match(v):
            return False, f'I need a date in MM/YYYY format. For example: **08/2021**. Please try again.'
        return True, ""

    elif field_type == "date_or_present":
        if lv == "present" or DATE_PATTERN.match(v):
            return True, ""
        return False, 'Please enter a date in MM/YYYY format or the word **Present**. Example: 06/2024'

    elif field_type == "optional_date":
        if lv in SKIP_WORDS or lv == "never" or lv == "n/a":
            return True, ""
        if DATE_PATTERN.match(v):
            return True, ""
        return False, 'Please enter a date in MM/YYYY format, or type **Skip** / **Never** if it does not apply.'

    elif field_type == "gpa":
        if lv in SKIP_WORDS:
            return True, ""
        if GPA_PATTERN.match(v):
            val_num = float(v.replace('%', ''))
            if val_num < 0 or val_num > 100:
                return False, 'GPA/CGPA should be a number between 0–10 (e.g. 8.67) or a percentage like 92%. Please re-enter.'
            return True, ""
        return False, f'"{v}" does not look like a valid GPA or percentage. Examples: **8.67** (CGPA) or **92%**. Type **Skip** to leave blank.'

    elif field_type == "email":
        if not EMAIL_PATTERN.match(v):
            return False, f'"{v}" is not a valid email address. Example: **name@gmail.com**. Please try again.'
        return True, ""

    elif field_type == "phone":
        if not PHONE_PATTERN.match(v):
            return False, f'"{v}" does not look like a valid phone number. Example: **+91 9876543210**. Please try again.'
        return True, ""

    elif field_type == "url":
        if not URL_PATTERN.match(v):
            return False, f'"{v}" is not a valid URL. It must start with http:// or https://. Example: **https://github.com/yourname**'
        return True, ""

    elif field_type == "optional_url":
        if lv in SKIP_WORDS:
            return True, ""
        if not URL_PATTERN.match(v):
            return False, f'"{v}" is not a valid URL. It must start with https://. Or type **Skip** to leave blank.'
        return True, ""

    elif field_type == "level":
        if lv in LEVEL_VALUES:
            return True, ""
        # Handle numeric-style inputs
        if v.isdigit():
            return False, f'Please type one of: **Beginner**, **Intermediate**, or **Advanced** — not a number.'
        return False, f'"{v}" is not a valid proficiency level. Please choose: **Beginner**, **Intermediate**, or **Advanced**.'

    elif field_type == "category":
        if any(cat in lv for cat in CATEGORY_VALUES):
            return True, ""
        return False, f'"{v}" is not a recognized category. Please choose from: **Languages**, **Frameworks**, **Databases**, **Developer Tools**, **Cloud**, or **Libraries**.'

    elif field_type == "team_size":
        if lv in SKIP_WORDS or TEAM_PATTERN.search(v):
            return True, ""
        return False, f'Please describe the team size, e.g. **Solo**, **3 members**, or **Team of 5**.'

    elif field_type == "multiline":
        if len(v) < 10:
            return False, f'Please provide more detail (at least 10 characters). Describe with specifics.'
        return True, ""

    return True, ""


def run_fallback_assistant(section: str, messages: List[ChatMessage], current_form_data: Optional[Dict[str, Any]]) -> Tuple[str, bool, Optional[Dict[str, Any]]]:
    """
    Stateful rule-based chatbot with per-field type validation.
    Rejects invalid values and re-asks the same question.
    """
    prompts = SECTION_PROMPTS.get(section, [])
    if not prompts:
        return "I'm sorry, I cannot assist with this section.", False, None

    form_data = current_form_data.copy() if current_form_data else {}
    for field, _, _ in prompts:
        if field not in form_data:
            form_data[field] = ""

    user_messages   = [msg for msg in messages if msg.role == "user"]
    assistant_messages = [msg for msg in messages if msg.role == "assistant"]

    # If no user messages yet, ask the first question
    if not user_messages:
        _, first_q, _ = prompts[0]
        return f"Let's build your **{section.replace('_', ' ').title()}** entry step by step.\n\n{first_q}", False, None

    # Walk through answered questions, filling form_data
    # Track which prompt index we are at
    prompt_idx = 0   # tracks filled prompts
    rejection_pending = False
    rejection_message = ""

    answered_count = 0
    for u_msg in user_messages:
        if prompt_idx >= len(prompts):
            break
        field, question, field_type = prompts[prompt_idx]
        raw_value = u_msg.content.strip()

        # Check for skip on optional fields
        lv = raw_value.lower()
        is_optional = field_type.startswith("optional")
        if is_optional and lv in {s for s in ["skip", "none", "no", "n/a", "na", "nothing", "never"]}:
            form_data[field] = ""
            prompt_idx += 1
            answered_count += 1
            continue

        is_valid, error_msg = validate_field(raw_value, field_type)
        if not is_valid:
            # This answer was rejected — we need to re-ask THIS question
            rejection_pending = True
            rejection_message = f"⚠️ {error_msg}\n\n**{question}**"
            # Don't advance prompt_idx, move to next user message to see if they corrected it
            continue
        else:
            # Reset rejection if they provided a valid answer in a subsequent message
            rejection_pending = False
            # Normalise certain field types
            if field_type == "level":
                raw_value = raw_value.strip().capitalize()
            elif field_type == "gpa" and lv in {"skip", "none", "n/a", "na"}:
                raw_value = ""
            form_data[field] = raw_value
            prompt_idx += 1
            answered_count += 1

    # If we ended because the LATEST answer for the current prompt was a rejection, re-ask
    if rejection_pending:
        return rejection_message, False, None

    # Determine next question
    if prompt_idx < len(prompts):
        _, next_q, _ = prompts[prompt_idx]
        progress = f"({prompt_idx + 1}/{len(prompts)})"
        return f"✅ Got it! {progress}\n\n{next_q}", False, None

    # All done — clean up technologies field if present
    if "technologies" in form_data and isinstance(form_data["technologies"], str):
        techs = [t.strip() for t in re.split(r'[,;/]+', form_data["technologies"]) if t.strip()]
        form_data["technologies"] = ", ".join(techs)

    return (
        "🎉 I have collected all the details!\n\n"
        "Please review the form on the left and click **Save Entry** to save it to your profile.",
        True,
        form_data
    )


def run_gemini_assistant(section: str, messages: List[ChatMessage], current_form_data: Optional[Dict[str, Any]]) -> Tuple[str, bool, Optional[Dict[str, Any]]]:
    """
    Gemini-powered assistant with strict validation instructions.
    """
    genai.configure(api_key=settings.GEMINI_API_KEY)

    prompts = SECTION_PROMPTS.get(section, [])
    field_descriptions = "\n".join(
        f"  - {field} ({ftype}): {question}" for field, question, ftype in prompts
    )

    system_instruction = f"""
You are a strict, professional AI Profile Assistant helping a student or job seeker fill out their "{section}" section.

FIELDS TO COLLECT (in order):
{field_descriptions}

CRITICAL VALIDATION RULES:
1. NEVER accept an answer for the wrong field type. If asked for a date and user says "Python", REJECT it and re-ask.
2. NEVER invent or fabricate any information. Only use what the user explicitly tells you.
3. For each field, validate the value STRICTLY:
   - date fields: must be MM/YYYY format or "Present"
   - gpa fields: must be a number 0-10 or a percentage, or "Skip"
   - email fields: must be valid email format
   - phone fields: must look like a real phone number  
   - url fields: must start with http:// or https://, or "Skip"
   - level fields: ONLY accept "Beginner", "Intermediate", or "Advanced"
   - text/multiline fields: must be meaningful and relevant content, not other field names
4. Ask ONE question at a time, in order.
5. When a value is invalid, say why clearly and re-ask the SAME question. Show an example.
6. When ALL fields are collected (user can type Skip for optional ones), output:
```json
{{"is_complete": true, "parsed_data": {{...all fields...}}}}
```
7. Otherwise output:
```json
{{"is_complete": false, "question": "Your message and next question here"}}
```

Always output valid JSON in one of those two structures.
"""

    history = []
    for msg in messages:
        role = "user" if msg.role == "user" else "model"
        history.append({"role": role, "parts": [msg.content]})

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=system_instruction,
        generation_config={"response_mime_type": "application/json"}
    )

    try:
        chat = model.start_chat()
        for h in history[:-1]:
            chat.send_message(h["parts"][0])

        last_msg = history[-1]["parts"][0] if history else "Hello, let's start"
        response = chat.send_message(last_msg)
        data = json.loads(response.text.strip())

        is_complete = data.get("is_complete", False)
        if is_complete:
            parsed_data = data.get("parsed_data", {})
            for field, _, _ in prompts:
                if field not in parsed_data:
                    parsed_data[field] = ""
            return "🎉 Perfect! I have collected all the details. Please review the form and click **Save Entry**.", True, parsed_data
        else:
            question = data.get("question", "Could you provide more details?")
            return question, False, None

    except Exception as e:
        print(f"Gemini AI Assistant error: {e}. Falling back to rule-based assistant.")
        return run_fallback_assistant(section, messages, current_form_data)


def handle_ai_chat(section: str, messages: List[ChatMessage], current_form_data: Optional[Dict[str, Any]]) -> Tuple[str, bool, Optional[Dict[str, Any]]]:
    """Main entry point. Uses Gemini if configured, otherwise rule-based."""
    if settings.GEMINI_API_KEY:
        return run_gemini_assistant(section, messages, current_form_data)
    else:
        return run_fallback_assistant(section, messages, current_form_data)
