import React, { useState } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import "./FileUploader.css";

const FileUploader = ({ onUploadSuccess, onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMessage({ type: "", text: "" });

    if (file && !file.name.endsWith(".db")) {
      setMessage({ type: "error", text: "Only .db files are allowed" });
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: "error", text: "Please select a .db file" });
      return;
    }

    setIsUploading(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("dbfile", selectedFile);
      const response = await fetch("http://localhost:3000/api/db/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setMessage({ type: "success", text: "File uploaded successfully!" });

      if (onUploadSuccess) onUploadSuccess(data);
      if (onFileSelect) onFileSelect(selectedFile);

      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);

    } catch (err) {
      setMessage({ type: "error", text: "Upload failed. Try again." });
      console.error(err);
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);

    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="file-uploader">
      <h2 className="title">Upload a Database File</h2>

      {/* Upload box */}
      <label htmlFor="file-upload" className="upload-box">
        <Upload className="upload-icon" />
        <p>
          Drag & drop a <b>.db</b> file here, or{" "}
          <span className="browse">browse</span>
        </p>
        <input
          type="file"
          accept=".db"
          id="file-upload"
          className="file-input"
          onChange={handleFileChange}
        />
      </label>

      {/* File name */}
      {selectedFile && <p className="file-name">📂 {selectedFile.name}</p>}

      {/* Upload button */}
      <button
        className="upload-btn"
        onClick={handleUpload}
        disabled={isUploading || !selectedFile}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>

      {/* Toast message */}
      {message.text && (
        <div className={`toast ${message.type}`}>
          {message.type === "success" ? (
            <CheckCircle className="toast-icon" />
          ) : (
            <AlertCircle className="toast-icon" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
