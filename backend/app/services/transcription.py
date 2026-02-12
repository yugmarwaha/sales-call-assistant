import assemblyai as aai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure AssemblyAI with API key
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")


async def transcribe_audio(file_path: str) -> dict:
    """
    Transcribe audio/video file using AssemblyAI

    Args:
        file_path: Path to the audio/video file

    Returns:
        dict with transcript text and metadata
    """
    try:
        # Create transcriber
        transcriber = aai.Transcriber()

        # Transcribe the file
        config = aai.TranscriptionConfig(
            speech_models=["universal-3-pro", "universal-2"],
            language_detection=True
        )
        transcript = aai.Transcriber(config=config).transcribe(file_path)

        # Check if transcription was successful
        if transcript.status == aai.TranscriptStatus.error:
            raise Exception(f"Transcription failed: {transcript.error}")

        return {
            "text": transcript.text,
            "status": "completed",
            "duration": transcript.audio_duration,
            "word_count": len(transcript.text.split()) if transcript.text else 0,
        }

    except Exception as e:
        return {"text": None, "status": "error", "error": str(e)}
