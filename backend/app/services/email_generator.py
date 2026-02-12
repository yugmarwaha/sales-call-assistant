import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


async def generate_follow_up_email(transcript: str) -> dict:
    """
    Generate a follow-up sales email based on a call transcript.

    Args:
        transcript: The transcribed text from the sales call
    Returns:
        dict with the generated email and metadata
    """
    try:
        prompt = f"""You are a sales assistant. Based on the following sales call transcript, 
write a professional follow-up email that:
- Thanks the prospect for their time
- References specific topics discussed in the call
- Includes a clear next step or call to action
- Keeps a warm but professional tone
- Is concise (under 200 words)

TRANSCRIPT:
{transcript}

Write only the email, starting with the subject line in the format:
Subject: [subject here]

Then the email body."""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )

        response_text = message.content[0].text

        return {
            "email": response_text,
            "status": "completed",
            "model": "claude-sonnet-4-20250514",
        }

    except Exception as e:
        return {"email": None, "status": "error", "error": str(e)}
