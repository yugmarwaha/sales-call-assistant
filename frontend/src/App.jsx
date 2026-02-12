import { useState } from "react";
import axios from "axios";
import { Upload, CheckCircle, XCircle, Loader } from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:8000";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [salespersonName, setSalespersonName] = useState("");
  const [prospectName, setProspectName] = useState("");

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setUploadResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("salesperson_name", salespersonName || "[Your Name]");
    formData.append("prospect_name", prospectName || "[Prospect Name]");
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
      setUploading(false);
    }
  };

  return (
    <div className="App">
      <h1>Sales Call Assistant</h1>
      <p className="subtitle">Upload your sales call recording</p>

      <div className="upload-container">
        <div className="file-input-wrapper">
          <input
            type="file"
            id="file-input"
            accept="video/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor="file-input" className="file-input-label">
            <Upload size={20} />
            Choose Video File
          </label>
        </div>

        {selectedFile && (
          <div className="selected-file">
            <p>
              Selected: <strong>{selectedFile.name}</strong>
            </p>
            <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        {selectedFile && (
          <div className="name-inputs">
            <div className="input-group">
              <label htmlFor="salesperson-name">Your Name</label>
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
              <label htmlFor="prospect-name">Prospect's Name</label>
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
              Upload
            </>
          )}
        </button>

        {uploadResult && (
          <div className="result success">
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

        {uploadResult?.transcription && (
          <div className="result-section">
            <h2>Transcript</h2>
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
            <h2>Follow-up Email</h2>
            <div className="result-card">
              {uploadResult.email.subject && (
                <p>
                  <strong>Subject: {uploadResult.email.subject}</strong>
                </p>
              )}
              <pre className="email-content">{uploadResult.email.body}</pre>
            </div>
          </div>
        )}

        {uploadResult?.email_error && (
          <div className="result error">
            <XCircle size={20} />
            <p>Email generation failed: {uploadResult.email_error}</p>
          </div>
        )}

        {error && (
          <div className="result error">
            <XCircle size={20} />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
