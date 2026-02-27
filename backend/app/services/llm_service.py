import json
from openai import OpenAI
from app.config import get_settings

settings = get_settings()


def _get_client():
    """Return an OpenAI-compatible client pointed at Groq API."""
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set. Please add it to your .env file.")
    return OpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )


def generate_text(prompt: str, system_instruction: str = "") -> str:
    """Generic text generation via Groq API."""
    client = _get_client()
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=2000,
    )
    return response.choices[0].message.content or ""


def generate_resume_summary(job_title: str, experience_summary: str) -> str:
    """Generate a professional resume summary."""
    system = "You are an expert resume writer. Write a concise, impactful professional summary (3-4 sentences) for a resume. Use strong action words and quantifiable achievements where possible. Do not use first person pronouns."
    prompt = f"Job Title: {job_title}\nExperience Overview: {experience_summary}\n\nWrite the professional summary:"
    return generate_text(prompt, system)


def generate_case_study(inputs: dict) -> dict:
    """Generate a full case study from user inputs."""
    system = "You are a professional technical writer. Generate a detailed case study from the following project details. Return valid JSON with keys: executive_summary, challenge, solution, results."
    prompt = f"""Project Name: {inputs.get('project_name', '')}
Role: {inputs.get('role', '')}
Tech Stack: {inputs.get('tech_stack', '')}
Problem: {inputs.get('problem', '')}
Solution: {inputs.get('solution', '')}
Results: {inputs.get('results', '')}

Generate the case study as JSON:"""

    raw = generate_text(prompt, system)
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        return json.loads(cleaned)
    except (json.JSONDecodeError, IndexError):
        return {"raw_text": raw}


def analyze_jd_match(job_description: str, resume_content: dict) -> dict:
    """Analyze how well a resume matches a job description."""
    system = """You are an ATS (Applicant Tracking System) expert. Analyze the match between a job description and a resume.
Return valid JSON with:
- match_score: integer 0-100
- matched_skills: list of skill strings found in both
- missing_skills: list of skill strings in JD but not in resume
- suggestions: list of objects with 'title' and 'description' keys for improvement tips"""

    prompt = f"""Job Description:
{job_description}

Resume Content:
{json.dumps(resume_content, indent=2)}

Analyze and return JSON:"""

    raw = generate_text(prompt, system)
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        return json.loads(cleaned)
    except (json.JSONDecodeError, IndexError):
        return {
            "match_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "suggestions": [{"title": "Error", "description": "Could not parse AI response."}]
        }


def get_recommendations(resumes: list, portfolios: list) -> dict:
    """Generate career recommendations based on user's assets."""
    system = """You are an AI career coach. Based on the user's resumes and portfolios, provide actionable career improvement recommendations.
Return valid JSON with:
- competitiveness_score: integer 0-100
- action_items: list of objects with 'title', 'description', and 'priority' (high/medium/low) keys
- interview_probability_boost: string like '+12%'"""

    prompt = f"""User's Resumes: {json.dumps(resumes, indent=2)}
User's Portfolios: {json.dumps(portfolios, indent=2)}

Generate recommendations as JSON:"""

    raw = generate_text(prompt, system)
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        return json.loads(cleaned)
    except (json.JSONDecodeError, IndexError):
        return {
            "competitiveness_score": 0,
            "action_items": [],
            "interview_probability_boost": "+0%"
        }


def enhance_bullet(bullet: str, job_title: str = "", company: str = "") -> str:
    """Rewrite a resume bullet point to be stronger and more impactful."""
    system = (
        "You are an expert resume writer. Rewrite the given resume bullet point to be more impactful. "
        "Use strong action verbs, include quantifiable results where possible, and follow the XYZ formula "
        "(Accomplished [X] as measured by [Y], by doing [Z]). Return ONLY the rewritten bullet point text, "
        "nothing else. Do not add quotes or explanation."
    )
    context = ""
    if job_title:
        context += f"Job Title: {job_title}\n"
    if company:
        context += f"Company: {company}\n"
    prompt = f"{context}Original bullet point: {bullet}\n\nRewrite this bullet point:"
    return generate_text(prompt, system).strip().strip('"').strip("'")


def suggest_skills(job_title: str, current_skills: list, experience_summary: str = "") -> list:
    """Suggest relevant skills the user is missing based on their profile."""
    system = (
        "You are a career coach and ATS expert. Based on the job title and current skills, "
        "suggest 8-12 additional relevant skills (technical and soft) that the candidate should add "
        "to strengthen their resume. Return valid JSON: a flat array of skill strings. "
        "Do NOT include skills already listed. Return ONLY the JSON array."
    )
    prompt = f"""Job Title: {job_title}
Current Skills: {json.dumps(current_skills)}
Experience: {experience_summary}

Suggest missing skills as a JSON array:"""

    raw = generate_text(prompt, system)
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        result = json.loads(cleaned)
        return result if isinstance(result, list) else []
    except (json.JSONDecodeError, IndexError):
        return []


def generate_portfolio_bio(name: str, title: str, skills: list, experience: str = "") -> dict:
    """Generate a portfolio hero tagline and about section."""
    system = (
        "You are a creative copywriter specializing in personal branding. "
        "Write a compelling portfolio hero tagline (1 short punchy sentence) and a longer about/bio paragraph "
        "(3-4 sentences, friendly professional tone). Return valid JSON with keys: tagline, bio. "
        "Return ONLY the JSON."
    )
    prompt = f"""Name: {name}
Title: {title}
Skills: {json.dumps(skills)}
Experience: {experience}

Generate tagline and bio as JSON:"""

    raw = generate_text(prompt, system)
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        return json.loads(cleaned)
    except (json.JSONDecodeError, IndexError):
        return {"tagline": "", "bio": ""}


def generate_cover_letter(resume_content: dict, job_description: str, company_name: str = "") -> str:
    """Generate a tailored cover letter from resume + JD."""
    system = (
        "You are an expert career counselor. Write a professional, tailored cover letter (3-4 paragraphs) "
        "that highlights the candidate's relevant experience and skills from their resume, matched to the "
        "job description. Use a confident but genuine tone. Include a proper greeting and sign-off. "
        "Do NOT use placeholder brackets like [Company Name] — use the actual details provided. "
        "Return ONLY the cover letter text."
    )
    prompt = f"""Resume:
{json.dumps(resume_content, indent=2)}

Job Description:
{job_description}

Company: {company_name or 'the company'}

Write the cover letter:"""

    return generate_text(prompt, system)
