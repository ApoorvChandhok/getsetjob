"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Briefcase, Download, Sparkles, Wand2 } from "lucide-react";

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
  }[];
  education: {
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
    gpa: string;
  }[];
  skills: {
    category: string;
    items: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  atsScore?: number;
}

const defaultData: ResumeData = {
  personalInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    linkedin: "linkedin.com/in/johndoe",
    portfolio: "github.com/johndoe"
  },
  summary: "Results-driven professional with experience in technical execution. Upload your actual CV, entering a target company, and pasting the job description to have AI magically populate this entirely.",
  experience: [
    {
      title: "Software Engineer",
      company: "Tech Corp",
      location: "New York, NY",
      startDate: "Jan 2020",
      endDate: "Present",
      responsibilities: [
        "Upload your exact resume via PDF and this section will be overwritten."
      ]
    }
  ],
  education: [
    {
      degree: "B.S. in Computer Science",
      school: "University of Technology",
      location: "New York, NY",
      graduationDate: "2019",
      gpa: "3.8/4.0"
    }
  ],
  skills: [
    {
      category: "Technical",
      items: "Python, JavaScript, React, SQL"
    }
  ],
  certifications: [
    {
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2021"
    }
  ],
  atsScore: 85
};

function processText(text: string) {
  if (!text) return { __html: "" };
  
  // Just in case LLM hallucinates a highlight block, strip the tags but keep the text
  const processed = text
    .replace(/<highlight>/g, "")
    .replace(/<\/highlight>/g, "")
    .replace(/<strong>/g, "<strong>")
    .replace(/<\/strong>/g, "</strong>");
    
  return { __html: processed };
}

export default function ResumeBuilderPage() {
  const [data, setData] = useState<ResumeData>(defaultData);
  const [cvText, setCvText] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (typeof window === "undefined" || !resumeRef.current) return;
    const element = resumeRef.current;
    
    // Load script dynamically to bypass all Webpack/Turbopack SSR module errors natively!
    if (!(window as any).html2pdf) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load html2pdf script"));
        document.head.appendChild(script);
      });
    }

    const html2pdf = (window as any).html2pdf;
    
    // Configure html2pdf options specifically for ATS formatting (standard letter size, crisp fonts)
    const opt = {
      margin: 0,
      filename: `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      if (!cvText || cvText.trim() === "") {
        alert("Please paste your base CV text first!");
        setIsGenerating(false);
        return;
      }

      const formData = new FormData();
      formData.append("cvText", cvText);
      formData.append("targetCompany", targetCompany);
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/generate-resume", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Failed to generate resume");
      }

      // Automatically populate the UI with the AI curated ATS data!
      setData(result.data);
      
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An unexpected error occurred during AI parsing.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 h-[calc(100vh-6rem)]">
      {/* LEFT COLUMN: Controls */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Wand2 className="text-violet-400" />
          AI Resume Builder
        </h1>

        <div className="space-y-6 flex-1">
          {/* 1. Base CV Upload */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <label className="text-sm font-semibold text-neutral-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              1. Base Information (CV Text)
            </label>
            <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
              Paste your massive master CV text here. We will intelligently compress it and extract only what is highly relevant for ATS parsing.
            </p>
            <textarea 
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              className="w-full h-32 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 resize-none custom-scrollbar" 
              placeholder="Paste your raw CV text here..."
            />
          </div>

          {/* 2. Target Details */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              2. Target Details (Optional)
            </h3>
            
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Target Company / Target Role</label>
              <input 
                type="text" 
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500" 
                placeholder="e.g. Amazon - Technical Business Analyst"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Target Job Description (JD)</label>
              <textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-32 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 resize-none custom-scrollbar" 
                placeholder="Paste the raw requirements here..."
              />
            </div>
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="mt-6 space-y-3 pt-6 border-t border-white/10">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 py-3 rounded-xl transition-all shadow-lg active:scale-[0.98]"
          >
            {isGenerating ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isGenerating ? "Curating ATS Resume..." : "Curate with AI"}
          </button>

          <button 
            onClick={handleDownloadPDF}
            className="w-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-semibold flex items-center justify-center gap-2 py-3 rounded-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Download ATS PDF
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Live ATS CV Preview */}
      <div className="bg-[#1e1e1e] rounded-2xl border border-white/10 overflow-hidden flex flex-col relative shadow-2xl">
        <div className="bg-black/50 border-b border-white/10 p-4 flex justify-between items-center z-10">
          <h2 className="text-white font-bold flex items-center gap-2">
            <FileText className="text-zinc-400 w-5 h-5" /> Live A4 ATS Preview
          </h2>
          <span className={`text-xs px-2 py-1 rounded border font-medium tracking-wide shadow-lg transition-colors ${
            (data.atsScore ?? 0) >= 80 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
              : ((data.atsScore ?? 0) >= 60)
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                : 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
          }`}>
            ATS TARGET MATCH: {data.atsScore ?? 0}%
          </span>
        </div>

        <div className="flex-1 overflow-auto bg-zinc-900 p-8 flex justify-center custom-scrollbar">
          {/* 
            This div perfectly mimics an 8.5 x 11 US Letter page or A4 inside the browser wrapper,
            rendering the exact CSS the user injected! It is strictly targeted for the html2pdf saving mechanism.
          */}
          <div 
            ref={resumeRef}
            className="bg-white shadow-lg shrink-0"
            style={{ 
              width: "8.5in", 
              minHeight: "11in",
              padding: "0.5in",
              fontFamily: "Arial, sans-serif",
              fontSize: "11pt",
              lineHeight: 1.5,
              color: "#000000",
              boxSizing: "border-box"
            }}
          >
            <style dangerouslySetInnerHTML={{__html: `
              #cv-root h1 { font-size: 20pt; font-weight: bold; margin-bottom: 8pt; text-align: center; }
              #cv-root h2 { font-size: 14pt; font-weight: bold; margin-top: 16pt; margin-bottom: 8pt; border-bottom: 1px solid #000000; padding-bottom: 4pt; }
              #cv-root h3 { font-size: 12pt; font-weight: bold; margin-top: 10pt; margin-bottom: 4pt; }
              #cv-root p { margin-bottom: 8pt; }
              #cv-root .contact-info { text-align: center; margin-bottom: 16pt; font-size: 10pt; }
              #cv-root .contact-info p { margin-bottom: 2pt; }
              #cv-root .entry { margin-bottom: 12pt; }
              #cv-root .entry-header { margin-bottom: 4pt; }
              #cv-root .job-title, #cv-root .degree { font-weight: bold; font-size: 11pt; }
              #cv-root .company, #cv-root .school { font-weight: normal; font-size: 11pt; }
              #cv-root .date-location { font-size: 10pt; font-style: italic; margin-top: 2pt; }
              #cv-root ul { margin-left: 20pt; margin-bottom: 8pt; }
              #cv-root li { margin-bottom: 4pt; }
              #cv-root .skills-list { margin-left: 0; list-style: none; }
              #cv-root .skills-list li { margin-bottom: 6pt; }
              #cv-root .skill-category { font-weight: bold; }
              #cv-root .summary { margin-bottom: 16pt; text-align: justify; }
              #cv-root strong, #cv-root b { font-weight: bold; }
            `}} />

            <div id="cv-root">
              <h1>{data.personalInfo.name}</h1>
              <div className="contact-info">
                <p>{data.personalInfo.email} | {data.personalInfo.phone} | {data.personalInfo.location}</p>
                <p>{data.personalInfo.linkedin}</p>
              </div>

              <h2>Professional Summary</h2>
              <p className="summary" dangerouslySetInnerHTML={processText(data.summary)} />

              <h2>Professional Experience</h2>
              {data.experience.map((job, i) => (
                <div key={i} className="entry">
                  <div className="entry-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <span className="job-title" dangerouslySetInnerHTML={processText(job.title)} /> - <span className="company" dangerouslySetInnerHTML={processText(job.company)} />
                      </div>
                    </div>
                    <div className="date-location">{job.startDate} - {job.endDate} | {job.location}</div>
                  </div>
                  <ul>
                    {job.responsibilities.map((resp, j) => (
                      <li key={j} dangerouslySetInnerHTML={processText(resp)} />
                    ))}
                  </ul>
                </div>
              ))}

              <h2>Technical & Business Skills</h2>
              <ul className="skills-list">
                {data.skills.map((skill, i) => (
                  <li key={i}>
                    <span className="skill-category">{skill.category}:</span> <span dangerouslySetInnerHTML={processText(skill.items)} />
                  </li>
                ))}
              </ul>

              <h2>Certifications</h2>
              <ul>
                {data.certifications.map((cert, i) => (
                  <li key={i}>
                    <span dangerouslySetInnerHTML={processText(cert.name)} /> - {cert.issuer}, {cert.date}
                  </li>
                ))}
              </ul>

              <h2>Education</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="entry">
                  <div className="entry-header">
                    <div>
                      <span className="degree" dangerouslySetInnerHTML={processText(edu.degree)} /> - <span className="school" dangerouslySetInnerHTML={processText(edu.school)} />
                    </div>
                    <div className="date-location">{edu.graduationDate} | {edu.location}</div>
                  </div>
                  <p>GPA: {edu.gpa}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
