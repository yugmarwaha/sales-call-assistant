import { useState, useRef } from "react";
import axios from "axios";
import {
  Upload,
  CheckCircle,
  XCircle,
  Loader,
  FileVideo,
  FileText,
  Mail,
  User,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:8000";

const STEPS = [
  { label: "Uploading file", key: "uploading" },
  { label: "Transcribing audio", key: "transcribing" },
  { label: "Generating email", key: "generating" },
];

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [salespersonName, setSalespersonName] = useState("");
  const [prospectName, setProspectName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setError(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadResult(null);
      setError(null);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError(null);
    setProcessingStep(0);
    setSalespersonName("");
    setProspectName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);
    setProcessingStep(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("salesperson_name", salespersonName || "[Your Name]");
    formData.append("prospect_name", prospectName || "[Prospect Name]");

    // Simulate step progression since we can't get real progress from the API
    const stepTimer1 = setTimeout(() => setProcessingStep(1), 3000);
    const stepTimer2 = setTimeout(() => setProcessingStep(2), 15000);

    try {
      const response = await axios.post(
        `${API_URL}/api/calls/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setUploadResult(response.data);
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setUploading(false);
      setProcessingStep(0);
    }
  };

  return (
    <div className="App">
      <h1>Sales Call Assistant</h1>
      <p className="subtitle">
        Upload your sales call recording to generate a transcript and follow-up
        email
      </p>

      {!uploadResult && (
        <div className="upload-container">
          <div className="file-input-wrapper">
            <input
              type="file"
              id="file-input"
              ref={fileInputRef}
              accept="video/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <label
              htmlFor="file-input"
              className={`file-input-label${dragActive ? " drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileVideo size={36} strokeWidth={1.5} />
              <span className="drop-zone-title">
                {dragActive ? "Drop your file here" : "Choose Video File"}
              </span>
              <span className="drop-zone-hint">
                Drag & drop or click to browse — MP4, MOV, AVI, WebM, MKV
              </span>
            </label>
          </div>

          {selectedFile && (
            <div className="selected-file">
              <FileVideo size={18} />
              <div>
                <p>
                  <strong>{selectedFile.name}</strong>
                </p>
                <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}

          {selectedFile && (
            <div className="name-inputs">
              <div className="input-group">
                <label htmlFor="salesperson-name">
                  <User size={14} />
                  Your Name
                </label>
                <input
                  type="text"
                  id="salesperson-name"
                  placeholder="e.g. John Smith"
                  value={salespersonName}
                  onChange={(e) => setSalespersonName(e.target.value)}
                  disabled={uploading}
                />
              </div>
              <div className="input-group">
                <label htmlFor="prospect-name">
                  <UserCheck size={14} />
                  Prospect's Name
                </label>
                <input
                  type="text"
                  id="prospect-name"
                  placeholder="e.g. Sarah Johnson"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  disabled={uploading}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="upload-button"
          >
            {uploading ? (
              <>
                <Loader className="spinner" size={20} />
                Processing...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload & Process
              </>
            )}
          </button>

          {uploading && (
            <div className="processing-steps">
              {STEPS.map((step, i) => (
                <div
                  key={step.key}
                  className={`step${i < processingStep ? " step-done" : ""}${i === processingStep ? " step-active" : ""}${i > processingStep ? " step-pending" : ""}`}
                >
                  <div className="step-indicator">
                    {i < processingStep ? (
                      <CheckCircle size={16} />
                    ) : i === processingStep ? (
                      <Loader className="spinner" size={16} />
                    ) : (
                      <span className="step-dot" />
                    )}
                  </div>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="result error">
              <XCircle size={20} />
              <p>{error}</p>
            </div>
          )}
        </div>
      )}

      {uploadResult && (
        <div className="result success full-width">
          <CheckCircle size={20} />
          <div>
            <strong>{uploadResult.message}</strong>
            <p>File: {uploadResult.original_filename}</p>
            <p>
              Size: {(uploadResult.file_size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      {(uploadResult?.transcription || uploadResult?.email) && (
        <div className="results-grid">
          {uploadResult?.transcription && (
            <div className="result-section">
              <h2>
                <FileText size={18} />
                Transcript
              </h2>
              <div className="result-card">
                <p>{uploadResult.transcription.text}</p>
                <div className="result-meta">
                  <span>Duration: {uploadResult.transcription.duration}s</span>
                  <span>Words: {uploadResult.transcription.word_count}</span>
                </div>
              </div>
            </div>
          )}

          {uploadResult?.email && (
            <div className="result-section">
              <h2>
                <Mail size={18} />
                Follow-up Email
              </h2>
              <div className="result-card">
                {uploadResult.email.subject && (
                  <p className="email-subject">
                    <strong>Subject: {uploadResult.email.subject}</strong>
                  </p>
                )}
                <pre className="email-content">{uploadResult.email.body}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {uploadResult?.email_error && (
        <div className="result error full-width">
          <XCircle size={20} />
          <p>Email generation failed: {uploadResult.email_error}</p>
        </div>
      )}

      {uploadResult && (
        <button onClick={handleReset} className="reset-button">
          <RotateCcw size={18} />
          Process Another Call
        </button>
      )}
    </div>
  );
}

export default App;
