from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
from datetime import datetime
from app.services.transcription import transcribe_audio

router = APIRouter(prefix="/api/calls", tags=["calls"])

# Directory to store uploaded files
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed video file extensions
ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm", ".mkv"}


@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    """Upload a video file and transcribe it"""

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

    # Transcribe the uploaded file
    transcription_result = await transcribe_audio(str(file_path))

    if transcription_result["status"] == "error":
        return {
            "message": "File uploaded but transcription failed",
            "filename": filename,
            "file_size": file_path.stat().st_size,
            "transcription_error": transcription_result.get("error"),
        }

    return {
        "message": "File uploaded and transcribed successfully",
        "filename": filename,
        "original_filename": file.filename,
        "file_size": file_path.stat().st_size,
        "transcription": {
            "text": transcription_result["text"],
            "duration": transcription_result["duration"],
            "word_count": transcription_result["word_count"],
        },
    }
