import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileVideo, Image, Loader2, Sparkles, CheckCircle2, Zap, AlertCircle } from "lucide-react";
import { uploadMedia } from "../services/api";
import DashboardLayout from "../components/layout/DashboardLayout";

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
      setError(e.response?.data?.detail || "Analysis failed. Verify backend service status.");
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Vehicle Detection' }
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider mb-1">
          <Zap size={13} className="text-cyan-400" />
          Ultra-Fast YOLOv11 Engine
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Traffic Media Analysis
        </h1>
        <p className="text-gray-400 text-sm">
          Upload traffic junction images or MP4 recordings for automated detection, violation audit & signal scheduling.
        </p>
      </div>

      {/* Upload Box */}
      <div className="glass-card rounded-3xl p-8 border border-gray-800/80 space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
            isDragActive
              ? "border-blue-500 bg-blue-500/10 glow-blue scale-[1.01]"
              : "border-gray-700/80 hover:border-blue-500/50 hover:bg-gray-800/40"
          }`}
        >
          <input {...getInputProps()} />
          <div className="p-4 rounded-2xl bg-gray-800/60 text-blue-400 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-gray-700 group-hover:scale-110 transition-transform duration-300">
            <UploadIcon size={32} />
          </div>
          <p className="text-base font-semibold text-gray-200">
            {isDragActive ? "Drop the traffic file here..." : "Drag & drop traffic video or image"}
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            Supports <span className="text-gray-200 font-medium">JPG, PNG, MP4</span> (Max 100MB)
          </p>
        </div>

        {/* Media Preview Card */}
        {file && (
          <div className="glass-card bg-gray-900/60 rounded-2xl p-4 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-200">
              <div className="flex items-center gap-2 font-medium truncate">
                {file.type.startsWith("video") ? (
                  <FileVideo size={18} className="text-purple-400 shrink-0" />
                ) : (
                  <Image size={18} className="text-blue-400 shrink-0" />
                )}
                <span className="truncate">{file.name}</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700 shrink-0">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>

            {preview && (
              <div className="relative rounded-xl overflow-hidden bg-black/80 max-h-72 border border-gray-800 flex justify-center">
                <img src={preview} alt="Traffic preview" className="max-h-72 object-contain" />
              </div>
            )}
            {!preview && file.type.startsWith("video") && (
              <div className="relative rounded-xl overflow-hidden bg-black/80 max-h-72 border border-gray-800">
                <video src={URL.createObjectURL(file)} controls className="max-h-72 w-full" />
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Progress Bar */}
        {loading && progress > 0 && progress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400 font-semibold">
              <span>Uploading media stream...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed
            text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg glow-blue transition-all duration-300 hover:scale-[1.01]"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin text-cyan-300" />
              <span>{progress < 100 ? `Uploading ${progress}%...` : "Running YOLOv11 & RL Analysis..."}</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Analyze Media Now</span>
            </>
          )}
        </button>
      </div>
    </div>
    </DashboardLayout>
  );
}
