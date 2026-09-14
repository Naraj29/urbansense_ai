import React, { useState } from 'react';
import { Sparkles, Upload, CheckCircle2, Eye } from 'lucide-react';
import { apiService } from '../services/api';

export const AIDetectionLab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [eventCreated, setEventCreated] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setEventCreated(false);
    }
  };

  const handleRunInference = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    try {
      const res = await apiService.runAIInference(selectedFile);
      setResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!result) return;
    try {
      await apiService.triggerDemoEvent(result.event_type, 'High', 1);
      setEventCreated(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>AI Computer Vision Detection Lab</span>
          </h1>
          <p className="text-xs text-slate-400">Interactive sandbox to test YOLO object detection, road defect localization & ANPR OCR pipeline.</p>
        </div>

        <div className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded text-xs font-mono font-bold">
          DEMO INFERENCE MODE
        </div>
      </div>

      {/* Main Grid: Upload Sandbox & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Box: Upload & Processing */}
        <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white">Upload Media Frame for Inspection</h3>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-900/60 transition cursor-pointer relative">
              <input
                type="file"
                accept="image/*,video/mp4"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-blue-400" />
                <p className="text-xs text-slate-200 font-semibold">
                  {selectedFile ? selectedFile.name : 'Click or Drag & Drop Image / Video'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">Supports JPG, PNG, WEBP, MP4 (Max 15MB)</p>
              </div>
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 max-h-56 flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="max-h-56 object-contain" />
              </div>
            )}
          </div>

          <button
            onClick={handleRunInference}
            disabled={!selectedFile || isAnalyzing}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center space-x-2 text-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? 'Running YOLOv8 Object Detection...' : 'Run AI Detection Inference'}</span>
          </button>
        </div>

        {/* Right Box: Annotated Result & Telemetry */}
        <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-800 space-y-5">
          <h3 className="font-bold text-sm text-white">AI Detection & Bounding Box Output</h3>

          {result ? (
            <div className="space-y-4">
              {/* Annotated Image Frame */}
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 relative">
                <img
                  src={`http://localhost:8000${result.annotated_image_url}`}
                  alt="Annotated Inference"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur text-amber-400 text-xs px-2.5 py-1 rounded border border-slate-700 font-mono">
                  {result.inference_mode}
                </div>
              </div>

              {/* Inference Telemetry Card */}
              <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-200 font-bold border-b border-slate-800 pb-2">
                  <span>DETECTION: {result.event_type}</span>
                  <span className="text-emerald-400">{(result.confidence * 100).toFixed(1)}% CONFIDENCE</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1 text-[11px]">
                  <p>Category: <span className="text-slate-200">{result.category_group}</span></p>
                  <p>Processing Time: <span className="text-blue-400">{result.processing_time_ms} ms</span></p>
                  <p>Bounding Box: <span className="text-slate-300">[{result.bounding_box.x1}, {result.bounding_box.y1}, {result.bounding_box.x2}, {result.bounding_box.y2}]</span></p>
                  <p>Model Architecture: <span className="text-slate-300">YOLOv8 Object Detector</span></p>
                </div>

                {/* ANPR OCR Result if present */}
                {result.anpr && (
                  <div className="mt-3 p-3 bg-slate-950 rounded border border-purple-500/30 text-purple-300 text-[11px] space-y-1">
                    <span className="font-bold block text-purple-400">ANPR OCR RESULT:</span>
                    <p>License Plate: <span className="text-white font-bold">{result.anpr.plate_number}</span></p>
                    <p>OCR Confidence: <span className="text-emerald-400">{(result.anpr.ocr_confidence * 100).toFixed(1)}%</span></p>
                  </div>
                )}
              </div>

              {/* Create Event Button */}
              <button
                onClick={handleCreateEvent}
                disabled={eventCreated}
                className={`w-full font-semibold py-2.5 rounded-lg transition text-xs flex items-center justify-center space-x-2 ${
                  eventCreated
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{eventCreated ? 'Event Ingested into GIS Platform' : 'Create Urban Event from Detection'}</span>
              </button>
            </div>
          ) : (
            <div className="h-72 border border-slate-800/60 rounded-lg bg-slate-900/40 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
              <Eye className="w-8 h-8 text-slate-600" />
              <p>Upload a frame and click 'Run AI Detection Inference' to view results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
