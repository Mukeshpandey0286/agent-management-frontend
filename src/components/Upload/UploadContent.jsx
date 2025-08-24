import React, { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import { FadeIn, LoadingSpinner } from "../common/Animations";
import { uploadFile } from "../../utils/api";

const UploadContent = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please select a valid CSV, XLSX, or XLS file");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File size should be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setError("");
    setSuccess("");
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      await uploadFile("/lists/upload", file, (progress) => {
        setUploadProgress(progress);
      });

      setSuccess("File uploaded and distributed successfully!");
      setFile(null);
      onUploadSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    setSuccess("");
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Upload & Distribute Lists
        </h2>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? "border-purple-400 bg-purple-50"
                : file
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) =>
                e.target.files[0] && handleFileSelect(e.target.files[0])
              }
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />

            {!file ? (
              <div className="space-y-4">
                <Upload
                  className={`w-12 h-12 mx-auto ${
                    dragActive ? "text-purple-500" : "text-gray-400"
                  }`}
                />
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {dragActive
                      ? "Drop your file here"
                      : "Choose file or drag and drop"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports CSV, XLSX, and XLS files (Max 10MB)
                  </p>
                </div>
                <button
                  type="button"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Select File
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <FileText className="w-12 h-12 mx-auto text-green-500" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!uploading && (
                  <button
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-800 transition-colors flex items-center mx-auto"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove file
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Uploading...
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-6 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Upload Button */}
          {file && !uploading && (
            <div className="mt-6 text-center">
              <button
                onClick={handleUpload}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center mx-auto"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload & Distribute
              </button>
            </div>
          )}

          {uploading && (
            <div className="mt-6 text-center">
              <button
                disabled
                className="bg-gray-400 text-white px-8 py-3 rounded-lg font-medium cursor-not-allowed flex items-center mx-auto"
              >
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">Processing...</span>
              </button>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Instructions */}
      <FadeIn delay={200}>
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            File Format Requirements
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              • <strong>FirstName:</strong> Text field containing the contact's
              first name
            </p>
            <p>
              • <strong>Phone:</strong> Number field containing the contact's
              phone number
            </p>
            <p>
              • <strong>Notes:</strong> Text field containing any additional
              notes
            </p>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Distribution:</strong> The system will automatically
              distribute the uploaded contacts equally among all active agents.
              If the total number of contacts is not divisible by the number of
              agents, remaining contacts will be distributed sequentially.
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default UploadContent;
