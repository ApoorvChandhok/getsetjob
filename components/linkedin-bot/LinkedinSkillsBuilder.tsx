"use client";

import { useState, useEffect } from "react";
import { getLinkedinProfile, saveLinkedinSkills } from "@/app/actions/linkedinBot";

export default function LinkedinSkillsBuilder() {
  const [skills, setSkills] = useState<{skillName: string, yearsExperience: number}[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newExp, setNewExp] = useState(1);

  useEffect(() => {
    getLinkedinProfile().then((res) => {
      if (res.skills) setSkills(res.skills);
    });
  }, []);

  const addSkill = () => {
    if (!newSkill) return;
    setSkills([...skills, { skillName: newSkill, yearsExperience: newExp }]);
    setNewSkill("");
    setNewExp(1);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    await saveLinkedinSkills(skills);
    alert("Skills saved!");
  };

  return (
    <div className="space-y-4 w-full p-4 border rounded shadow-sm mt-6">
      <h2 className="text-xl font-bold mb-2">Dynamic Skill Builder</h2>
      <p className="text-sm text-gray-600 mb-4">Add the technologies you know and your years of experience. The bot will automatically map these when a job asks about your skills.</p>
      
      <div className="flex gap-2">
        <input type="text" placeholder="Skill (e.g., Python)" className="flex-1 border p-2 rounded" value={newSkill} onChange={e => setNewSkill(e.target.value)} />
        <input type="number" placeholder="Years" className="w-24 border p-2 rounded" value={newExp} onChange={e => setNewExp(parseInt(e.target.value))} />
        <button onClick={addSkill} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium">Add</button>
      </div>

      <ul className="space-y-2 mt-4">
        {skills.map((s, i) => (
          <li key={i} className="flex justify-between items-center p-3 py-2 bg-gray-50 border rounded text-sm">
            <span className="font-medium text-gray-800">{s.skillName} <span className="text-gray-500 font-normal ml-2">({s.yearsExperience} years)</span></span>
            <button onClick={() => removeSkill(i)} className="text-red-500 hover:text-red-700 font-semibold px-2">Remove</button>
          </li>
        ))}
        {skills.length === 0 && <li className="text-sm text-gray-400 italic">No skills added yet.</li>}
      </ul>

      <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded mt-4 transition">
        Save All Skills
      </button>
    </div>
  );
}
