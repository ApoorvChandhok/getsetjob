"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, Upload, Save, FileText, Loader2, CheckCircle, X } from "lucide-react";

interface UserData {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  cvUrl?: string | null;
}

export function ProfileForm({ user }: { user: UserData }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name ?? "");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState(user.cvUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    setCvFile(file);

    // Upload CV via API
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("cv", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.cvUrl) {
        setCvUrl(data.cvUrl);
      }
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const body: Record<string, string> = {};
      if (name.trim()) body.name = name.trim();
      if (cvUrl) body.cvUrl = cvUrl;

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Your Profile</h1>
        <p className="text-neutral-400">Manage your name and CV — these are used when you apply for jobs.</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
          <div className="text-green-300 font-semibold">Profile saved successfully!</div>
        </div>
      )}

      {/* Avatar */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/5 mb-4 flex items-center gap-4">
        {user.image ? (
          <img src={user.image} alt="avatar" className="w-16 h-16 rounded-full ring-2 ring-violet-500/50" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <UserCircle className="w-8 h-8 text-violet-400" />
          </div>
        )}
        <div>
          <div className="text-white font-semibold">{user.email}</div>
          <div className="text-xs text-neutral-500 mt-0.5">Google account · Profile photo synced automatically</div>
        </div>
      </div>

      {/* Name */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/5 mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
          Display Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition"
        />
      </div>

      {/* CV Upload */}
      <div className="p-6 rounded-xl border border-white/10 bg-white/5 mb-6">
        <div className="text-sm font-medium text-neutral-300 mb-3">Curriculum Vitae (CV)</div>

        {cvUrl && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
            <FileText className="w-5 h-5 text-violet-400 shrink-0" />
            <div className="flex-1 truncate">
              <div className="text-sm text-white truncate">{cvFile?.name ?? cvUrl}</div>
              <div className="text-xs text-neutral-500">PDF · Ready for applications</div>
            </div>
            <button
              onClick={() => { setCvFile(null); setCvUrl(""); }}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full p-4 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center gap-2 text-neutral-400 hover:border-violet-500/40 hover:text-violet-400 hover:bg-violet-500/5 transition-all duration-150 disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 className="w-6 h-6 animate-spin" /><span className="text-sm">Uploading...</span></>
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-sm font-medium">{cvUrl ? "Replace CV" : "Upload CV"}</span>
              <span className="text-xs">PDF only · Max 10MB</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {saving ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
        ) : (
          <><Save className="w-5 h-5" /> Save Profile</>
        )}
      </button>
    </div>
  );
}
