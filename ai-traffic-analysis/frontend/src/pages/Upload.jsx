import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileVideo, Image, Loader2 } from "lucide-react";
import { uploadMedia } from "../services/api";

const ACCEPTED = { "image/jpeg": [], "image/png": [], "video/mp4": [] };

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setError(null);
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await uploadMedia(file, setProgress);
      navigate(`/results/${data.id}`);
    } catch (e) {
      setError(e.response?.data?.detail || "Analysis failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Analyze Traffic Media</h1>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-950/30" : "border-gray-700 hover:border-gray-500"}`}
      >
        <input {...getInputProps()} />
        <UploadIcon size={40} className="mx-auto mb-3 text-gray-500" />
        <p className="text-gray-300">
          {isDragActive ? "Drop it here..." : "Drag & drop or click to select"}
        </p>
        <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, MP4 · Max 100MB</p>
      </div>

      {/* Preview */}
      {file && (
        <div className="bg-gray-900 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            {file.type.startsWith("video") ? <FileVideo size={16} /> : <Image size={16} />}
            <span className="font-medium">{file.name}</span>
            <span className="text-gray-500 ml-auto">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          {preview && (
            <img src={preview} alt="preview" className="rounded-lg max-h-64 w-full object-contain bg-black" />
          )}
          {!preview && file.type.startsWith("video") && (
            <video src={URL.createObjectURL(file)} controls className="rounded-lg max-h-64 w-full" />
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-950 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Progress */}
      {loading && progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!file || loading}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed
          text-white font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {progress < 100 ? `Uploading ${progress}%...` : "Analyzing..."}
          </>
        ) : (
          <>
            <UploadIcon size={18} />
            Run AI Analysis
          </>
        )}
      </button>
    </div>
  );
}
