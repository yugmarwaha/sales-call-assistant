import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


async def generate_follow_up_email(
    transcript: str, salesperson_name: str, prospect_name: str
) -> dict:
    """
    Generate a follow-up sales email based on a call transcript.

    Args:
        transcript: The transcribed text from the sales call
        salesperson_name: Name of the salesperson
        prospect_name: Name of the prospect
    Returns:
        dict with the generated email and metadata
    """
    try:
        prompt = f"""You are a sales email assistant. Based on the following sales call transcript, 
write a short, punchy follow-up email.

Rules:
- Address the prospect as {prospect_name}
- Sign off as {salesperson_name}
- Keep it under 100 words (excluding subject line)
- Reference 1-2 specific things from the call to show you were listening
- Include one clear call to action
- Be warm but direct — no fluff, no filler
- Start with the subject line in the format: Subject: [subject here]
- Then a blank line, then the email body

TRANSCRIPT:
{transcript}"""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        response_text = message.content[0].text

        # Parse subject line from body
        subject = ""
        body = response_text

        if response_text.startswith("Subject:"):
            lines = response_text.split("\n", 1)
            subject = lines[0].replace("Subject:", "").strip()
            body = lines[1].strip() if len(lines) > 1 else ""

        return {
            "email": {"subject": subject, "body": body},
            "status": "completed",
            "model": "claude-sonnet-4-20250514",
        }

    except Exception as e:
        return {"email": None, "status": "error", "error": str(e)}
