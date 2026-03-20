"use client";

import { useState, useEffect } from "react";
import { getLinkedinProfile, updateLinkedinProfile } from "@/app/actions/linkedinBot";

export default function LinkedinProfileForm() {
  const [data, setData] = useState({
    phone: "",
    location: "",
    desiredSalary: 0,
    currentSalary: 0,
    noticePeriodDays: 0,
    headline: "",
    summary: "",
    coverLetterTemplate: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLinkedinProfile().then((res) => {
      if (res.profile) setData(res.profile as any);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateLinkedinProfile(data);
    alert("Profile saved successfully!");
  };

  if (loading) return <div className="p-4 border">Loading Profile...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full p-4 border rounded shadow-sm">
      <h2 className="text-xl font-bold mb-4">Core Profile & Settings</h2>
      
      <div className="space-y-1">
        <label className="text-sm font-semibold">Phone Number</label>
        <input type="text" className="w-full border p-2 rounded" placeholder="E.g. +91 9999999999" value={data.phone || ""} onChange={e => setData({...data, phone: e.target.value})} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold">Target Location</label>
        <input type="text" className="w-full border p-2 rounded" placeholder="E.g. Gurgaon, Haryana, India" value={data.location || ""} onChange={e => setData({...data, location: e.target.value})} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold">Desired Salary (CTC)</label>
          <input type="number" className="w-full border p-2 rounded" value={data.desiredSalary || 0} onChange={e => setData({...data, desiredSalary: parseInt(e.target.value)})} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">Current Salary (CTC)</label>
          <input type="number" className="w-full border p-2 rounded" value={data.currentSalary || 0} onChange={e => setData({...data, currentSalary: parseInt(e.target.value)})} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold">Notice Period (Days)</label>
        <input type="number" className="w-full border p-2 rounded" value={data.noticePeriodDays || 0} onChange={e => setData({...data, noticePeriodDays: parseInt(e.target.value)})} />
      </div>

      <hr className="my-4" />
      <h3 className="font-semibold text-lg">Text Templates</h3>

      <div className="space-y-1">
        <label className="text-sm font-semibold">LinkedIn Headline</label>
        <input type="text" className="w-full border p-2 rounded" placeholder="Software Engineer @ Google" value={data.headline || ""} onChange={e => setData({...data, headline: e.target.value})} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold">Summary</label>
        <textarea className="w-full border p-2 rounded" rows={3} value={data.summary || ""} onChange={e => setData({...data, summary: e.target.value})} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold">Cover Letter Boilerplate</label>
        <textarea className="w-full border p-2 rounded" rows={4} value={data.coverLetterTemplate || ""} onChange={e => setData({...data, coverLetterTemplate: e.target.value})} />
      </div>

      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition">
        Save Profile
      </button>
    </form>
  );
}
