'use client';

import React, { useState } from 'react';
import { CategoryType, PanchayatProblem, UserRole } from '@/types';
import { uploadIssueImage } from '@/lib/supabaseClient';
import {
  PlusCircle,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  X,
  FileImage,
  Clock,
  Eye,
  Activity,
  BookmarkCheck,
  Building2,
  Calendar,
} from 'lucide-react';

interface ProblemEntryProps {
  problems: PanchayatProblem[];
  onAddProblem: (newProblem: PanchayatProblem) => void;
  onVerifyProblem: (problemId: string, updates: Partial<PanchayatProblem>) => void;
  userRole: UserRole;
}

export function ProblemEntry({
  problems,
  onAddProblem,
  userRole,
}: ProblemEntryProps) {
  // Form State
  const [title, setTitle] = useState('');
  const [panchayatName, setPanchayatName] = useState('Rampur Gram Panchayat');
  const [district, setDistrict] = useState('Sehore');
  const [category, setCategory] = useState<CategoryType>('water');
  const [location, setLocation] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(400000);
  const [peopleAffected, setPeopleAffected] = useState(1500);
  const [urgency, setUrgency] = useState(4);
  const [reportedBy, setReportedBy] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Image File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  // File Change Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setPhotoUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !reportedBy) return;

    let finalPhotoUrl = photoUrl;

    // Upload image if a file was selected
    if (selectedFile) {
      setIsUploadingImage(true);
      try {
        finalPhotoUrl = await uploadIssueImage(selectedFile);
      } catch (err) {
        console.error('Error uploading image:', err);
      } finally {
        setIsUploadingImage(false);
      }
    }

    if (!finalPhotoUrl) {
      finalPhotoUrl =
        'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=80';
    }

    const newProblem: PanchayatProblem = {
      id: `PRB-${Math.floor(100 + Math.random() * 900)}`,
      panchayat_id: 'GP-NEW-09',
      panchayat_name: panchayatName,
      district,
      title,
      category,
      location,
      estimated_cost: Number(estimatedCost),
      people_affected: Number(peopleAffected),
      urgency: Number(urgency),
      safety_impact: Math.min(5, Number(urgency) + 1),
      health_impact: category === 'water' || category === 'sanitation' || category === 'health' ? 4 : 2,
      current_condition: 2,
      status: 'reported',
      reported_by: reportedBy,
      reported_date: new Date().toISOString().split('T')[0],
      photo_url: finalPhotoUrl,
    };

    onAddProblem(newProblem);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);

    // Reset Form
    setTitle('');
    setLocation('');
    setReportedBy('');
    setPhotoUrl('');
    setSelectedFile(null);
    setImagePreview(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* SECTION 1: CITIZEN COMPLAINT FORM WITH IMAGE UPLOAD */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-teal-500/30 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wider mb-1">
            <PlusCircle className="w-4 h-4" /> Citizen Infrastructure Grievance Portal
          </div>
          <h2 className="text-2xl font-black text-white">Raise a Village Issue with Photo</h2>
          <p className="text-xs text-teal-100/70 mt-1">
            Submit problem details and site photos. Officials will review your submission and update its progress status.
          </p>
        </div>

        {isSubmitted && (
          <div className="p-4 rounded-2xl bg-teal-950/90 border border-teal-400/40 text-teal-200 flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 text-teal-300 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">Issue Successfully Logged!</div>
              <div className="text-xs text-teal-100">
                Your complaint and uploaded photos have been transmitted to official review. Check below for live status tracking.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">Gram Panchayat</label>
              <input
                type="text"
                value={panchayatName}
                onChange={(e) => setPanchayatName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-teal-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-teal-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">Problem Title</label>
            <input
              type="text"
              placeholder="e.g. Broken Handpump & Water Supply Contamination near Anganwadi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-teal-400 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-teal-400 focus:outline-none"
              >
                <option value="water">Drinking Water</option>
                <option value="road">Road & Bridge</option>
                <option value="health">Health & Sub-Centre</option>
                <option value="sanitation">Sanitation & Drainage</option>
                <option value="electricity">Electricity & Streetlights</option>
                <option value="education">School Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">Specific Location / Landmark</label>
              <input
                type="text"
                placeholder="e.g. Ward 3, Near Primary Health Sub-Centre"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-teal-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Image File Upload Format */}
          <div className="p-4 rounded-2xl bg-[#07242a] border border-teal-500/30 space-y-3">
            <label className="block text-xs font-bold text-teal-300 flex items-center gap-1.5">
              <FileImage className="w-4 h-4 text-cyan-400" />
              <span>Upload Site Photo / Image Evidence</span>
            </label>

            {imagePreview ? (
              <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-teal-400/40 group">
                <img
                  src={imagePreview}
                  alt="Uploaded preview"
                  className="w-full h-44 object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow"
                  >
                    <X className="w-3.5 h-3.5" /> Remove Image
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-teal-300 font-mono">
                  {selectedFile ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` : 'Image Attached'}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-teal-500/40 rounded-2xl p-6 text-center hover:border-teal-400 transition bg-teal-950/20">
                <Upload className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                <div className="text-xs font-bold text-white mb-1">
                  Click to select or drop site photo here
                </div>
                <div className="text-[11px] text-teal-200/70 mb-3">
                  Supports JPG, PNG, WEBP (Direct Supabase Storage bucket upload)
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload-input"
                />
                <label
                  htmlFor="image-upload-input"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer transition shadow"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Choose File from Device</span>
                </label>
              </div>
            )}

            <div className="text-[11px] text-teal-200/60">
              Or enter photo URL directly if hosted externally:
            </div>
            <input
              type="text"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#061e23] border border-teal-500/20 text-xs text-white focus:border-teal-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">
                Estimated Cost (₹)
              </label>
              <input
                type="number"
                step="50000"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-teal-400 focus:outline-none font-mono"
                required
              />
              <span className="text-[11px] text-teal-300 font-mono mt-1 block">
                = ₹{(estimatedCost / 100000).toFixed(1)} Lakhs
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">
                Villagers Affected
              </label>
              <input
                type="number"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-teal-400 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">
                Perceived Urgency: <span className="text-amber-300 font-bold">{urgency} / 5</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={urgency}
                onChange={(e) => setUrgency(Number(e.target.value))}
                className="w-full h-2 bg-[#061e23] rounded-lg appearance-none cursor-pointer accent-teal-400 mt-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-teal-100/90 mb-1.5">
              Submitted By (Citizen Name / Mobile)
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Kumar (Ward 3 Resident)"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#061e23] border border-teal-500/20 text-sm text-white focus:border-teal-400 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isUploadingImage}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-teal-950 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUploadingImage ? (
              <span>Uploading Image to Supabase Storage...</span>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>Submit Complaint to Official Master Admin</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* SECTION 2: CITIZEN PROGRESS TRACKER */}
      <div className="space-y-4">
        <div className="glass-panel rounded-3xl p-6 border border-teal-500/30 bg-gradient-to-r from-[#041418] via-[#06262d] to-[#07353f]">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-300" />
            Citizen Complaints & Live Progress Tracker
          </h3>
          <p className="text-xs text-teal-100/70 mt-1">
            Track the status of your submitted complaints in real time as officials mark them as <strong>Noted</strong>, <strong>Work in Progress</strong>, or <strong>Completed</strong>.
          </p>
        </div>

        <div className="space-y-4">
          {problems.map((problem) => (
            <CitizenComplaintCard
              key={problem.id}
              problem={problem}
              onViewImage={(url) => setModalImage(url)}
            />
          ))}

          {problems.length === 0 && (
            <div className="glass-panel p-12 text-center rounded-3xl text-teal-200/70 border border-teal-500/20">
              <CheckCircle2 className="w-10 h-10 text-teal-300 mx-auto mb-3" />
              <div className="text-white font-bold text-base">No Citizen Complaints Submitted Yet</div>
              <div className="text-xs text-teal-200/70 mt-1">
                Use the form above to submit your first village infrastructure problem with photo evidence.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal View */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl glass-panel border border-teal-500/40 p-2">
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/80 text-white hover:bg-rose-600 transition"
            >
              ✕
            </button>
            <img
              src={modalImage}
              alt="Full size photo"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CitizenComplaintCard({
  problem,
  onViewImage,
}: {
  problem: PanchayatProblem;
  onViewImage: (url: string) => void;
}) {
  const costLakhs = (problem.estimated_cost / 100000).toFixed(1);

  let currentStep = 1;
  if (problem.status === 'noted' || problem.status === 'verified' || problem.status === 'scored') currentStep = 2;
  if (problem.status === 'funded' || problem.status === 'in_progress') currentStep = 3;
  if (problem.status === 'completed') currentStep = 4;

  return (
    <div className="glass-panel rounded-3xl p-5 border border-teal-500/25 space-y-4">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {problem.photo_url ? (
            <div
              onClick={() => onViewImage(problem.photo_url!)}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-teal-500/30 flex-shrink-0 cursor-pointer group shadow-lg"
            >
              <img
                src={problem.photo_url}
                alt={problem.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-teal-950/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#061e23] border border-teal-500/20 flex flex-col items-center justify-center text-teal-400/50 flex-shrink-0">
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-[10px]">No Photo</span>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
                {problem.id}
              </span>
              <span className="text-xs font-bold text-teal-200/80">{problem.panchayat_name}</span>
            </div>

            <h4 className="text-lg font-black text-white">{problem.title}</h4>
            <p className="text-xs text-teal-100/70">Location: <strong>{problem.location}</strong></p>
            <div className="text-[11px] text-teal-200/60 pt-1">
              Submitted by: <span className="text-white font-medium">{problem.reported_by}</span> on {problem.reported_date}
            </div>
          </div>
        </div>

        <div className="text-left md:text-right font-mono flex-shrink-0">
          <div className="text-lg font-black text-teal-300">₹{costLakhs} Lakhs</div>
          <div className="text-xs text-teal-200/70">{problem.people_affected.toLocaleString('en-IN')} villagers affected</div>
        </div>
      </div>

      {/* Progress Milestone Bar */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-teal-500/15">
        <MilestoneStep step={1} title="Reported" active={currentStep >= 1} done={currentStep > 1} />
        <MilestoneStep step={2} title="Noted" active={currentStep >= 2} done={currentStep > 2} />
        <MilestoneStep step={3} title="Work in Progress" active={currentStep >= 3} done={currentStep > 3} />
        <MilestoneStep step={4} title="Completed" active={currentStep >= 4} done={currentStep === 4} />
      </div>
    </div>
  );
}

function MilestoneStep({
  step,
  title,
  active,
  done,
}: {
  step: number;
  title: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex flex-col items-center space-y-1">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
          done
            ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
            : active
            ? 'bg-amber-400 text-slate-950 animate-pulse font-extrabold'
            : 'bg-[#061e23] text-teal-400/50 border border-teal-500/20'
        }`}
      >
        {done ? '✓' : step}
      </div>
      <span className={`text-[11px] font-medium text-center ${active ? 'text-white font-bold' : 'text-teal-200/50'}`}>
        {title}
      </span>
    </div>
  );
}


