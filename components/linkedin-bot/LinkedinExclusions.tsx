"use client";

import { useState, useEffect } from "react";
import { getLinkedinProfile, saveLinkedinExclusions } from "@/app/actions/linkedinBot";

export default function LinkedinExclusions() {
  const [exclusions, setExclusions] = useState<{exclusionType: string, value: string}[]>([]);
  const [newType, setNewType] = useState("COMPANY_BLACKLIST");
  const [newVal, setNewVal] = useState("");

  useEffect(() => {
    getLinkedinProfile().then((res) => {
      if (res.exclusions) setExclusions(res.exclusions);
    });
  }, []);

  const addExclusion = () => {
    if (!newVal) return;
    setExclusions([...exclusions, { exclusionType: newType, value: newVal }]);
    setNewVal("");
  };

  const removeExclusion = (index: number) => {
    setExclusions(exclusions.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    await saveLinkedinExclusions(exclusions);
    alert("Exclusions saved!");
  };

  return (
    <div className="space-y-4 w-full p-4 border rounded shadow-sm mt-6">
      <h2 className="text-xl font-bold mb-2">Application Exclusions (Blacklists)</h2>
      <p className="text-sm text-gray-600 mb-4">Define rules to skip certain companies or job descriptions containing specific terms.</p>
      
      <div className="flex gap-2">
        <select value={newType} onChange={e => setNewType(e.target.value)} className="w-[180px] border p-2 rounded text-sm bg-white">
          <option value="COMPANY_BLACKLIST">Company Blacklist</option>
          <option value="KEYWORD_BLACKLIST">Keyword Blacklist</option>
          <option value="COMPANY_WHITELIST">Company Whitelist</option>
        </select>
        <input type="text" placeholder="e.g. Crossover or Clearance" className="flex-1 border p-2 rounded" value={newVal} onChange={e => setNewVal(e.target.value)} />
        <button onClick={addExclusion} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium">Add</button>
      </div>

      <ul className="space-y-2 mt-4">
        {exclusions.map((e, i) => (
          <li key={i} className="flex justify-between items-center p-3 py-2 bg-gray-50 border rounded text-sm">
            <span>
              <span className="font-bold text-xs uppercase tracking-wider text-gray-500 mr-2 border border-gray-300 rounded px-1">{e.exclusionType.replace("_", " ")}</span> 
              <span className="font-medium text-gray-800">{e.value}</span>
            </span>
            <button onClick={() => removeExclusion(i)} className="text-red-500 hover:text-red-700 font-semibold px-2">Remove</button>
          </li>
        ))}
        {exclusions.length === 0 && <li className="text-sm text-gray-400 italic">No exclusions added yet.</li>}
      </ul>

      <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded mt-4 transition">
        Save Exclusions
      </button>
    </div>
  );
}
