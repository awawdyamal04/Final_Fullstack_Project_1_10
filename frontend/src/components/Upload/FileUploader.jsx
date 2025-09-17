import React, { useState } from "react";
import "./FileUploader.css";

const FileUploader = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError("");
    setSuccess("");

    if (file && !file.name.endsWith(".db")) {
      setError("Only .db files are allowed");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a .db file to upload");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("dbfile", selectedFile);

      const response = await fetch("http://localhost:3000/api/db/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setSuccess("File uploaded successfully!");

      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="file-uploader">
      <h2>Upload a Database File</h2>
      <div className="upload-box">
        <input
          type="file"
          accept=".db"
          onChange={handleFileChange}
          className="file-input"
          id="file-upload"
        />
        {selectedFile && (
          <p className="file-name">Selected: {selectedFile.name}</p>
        )}
        <button
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
          className="upload-btn"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default FileUploader;