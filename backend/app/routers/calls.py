from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
import shutil
import os
from datetime import datetime
from app.services.transcription import transcribe_audio
from app.services.email_generator import generate_follow_up_email

router = APIRouter(prefix="/api/calls", tags=["calls"])

# Directory to store uploaded files
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed video file extensions
ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm", ".mkv"}


@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    salesperson_name: str = Form("Sales Representative"),
    prospect_name: str = Form("Valued Customer"),
):
    """Upload a video file, transcribe it, and generate a follow-up email"""

    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Generate unique filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = UPLOAD_DIR / filename

    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    file_size = file_path.stat().st_size

    # Transcribe the uploaded file
    try:
        transcription_result = await transcribe_audio(str(file_path))
    finally:
        os.remove(file_path)

    if transcription_result["status"] == "error":
        return {
            "message": "File uploaded but transcription failed",
            "filename": filename,
            "file_size": file_size,
            "transcription_error": transcription_result.get("error"),
        }

    # Generate follow-up email from transcript
    email_result = await generate_follow_up_email(
        transcription_result["text"], salesperson_name, prospect_name
    )

    if email_result["status"] == "error":
        return {
            "message": "File uploaded and transcribed, but email generation failed",
            "filename": filename,
            "original_filename": file.filename,
            "file_size": file_size,
            "transcription": {
                "text": transcription_result["text"],
                "duration": transcription_result["duration"],
                "word_count": transcription_result["word_count"],
            },
            "email_error": email_result.get("error"),
        }

    return {
        "message": "File uploaded, transcribed, and email generated successfully",
        "filename": filename,
        "original_filename": file.filename,
        "file_size": file_size,
        "transcription": {
            "text": transcription_result["text"],
            "duration": transcription_result["duration"],
            "word_count": transcription_result["word_count"],
        },
        "email": email_result["email"],
    }
