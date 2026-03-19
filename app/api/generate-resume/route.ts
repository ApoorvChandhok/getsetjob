import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const cvText = formData.get("cvText") as string;
    const targetCompany = formData.get("targetCompany") as string;
    const jobDescription = formData.get("jobDescription") as string;

    if (!cvText || cvText.trim() === "") {
      return NextResponse.json({ error: "Missing CV text" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Internal Server Error: Missing Gemini API Key in .env.local" }, { status: 500 });
    }

    // 2. Build the Gemini Prompt
    const prompt = `
You are an expert ATS-resume writer and career coach.
I am providing you with my raw CV text, and an optional Target Role/Company and Target Job Description (JD).
Your job is to curate, restructure, and rewrite my CV into a highly optimized JSON format that identically matches the following required structure.
CRITICALLY IMPORTANT: REWRITE the content to specifically and directly address the "Target Job Description" (if provided). You must naturally weave in their required skills, keywords, and qualifications throughout the professional summary, experience bullet points, and skills section to maximize the ATS match score.
Highlight my most relevant experience for the target role if provided. Try to quantify achievements and use dynamic action verbs.
CRITICAL: You MUST wrap the most critical keywords/metrics in text with <strong></strong> tags for visual emphasis in the UI.

REQUIRED JSON STRUCTURE:
{
  "atsScore": "A number out of 100 representing how well this newly generated resume matches the Target Job Description. Provide a realistic integer, e.g., 85, 92",
  "personalInfo": {
    "name": "Full Name",
    "email": "Email",
    "phone": "Phone",
    "location": "City, Country",
    "linkedin": "LinkedIn URL",
    "portfolio": "Portfolio/Github URL"
  },
  "summary": "HTML formatted summary with <strong> tags where appropriate",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "Location",
      "startDate": "Start Date (e.g. Jan 2020)",
      "endDate": "End Date (e.g. Present)",
      "responsibilities": [
        "Responsibility/Achievement 1",
        "Responsibility/Achievement 2"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "University Name",
      "location": "Location",
      "graduationDate": "Graduation Year",
      "gpa": "GPA (if available)"
    }
  ],
  "skills": [
    {
      "category": "Skill Category (e.g. Technical, Soft Skills)",
      "items": "Comma separated skills, with important ones in <strong></strong>"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuer Name",
      "date": "Date"
    }
  ]
}

Ensure the output is strictly valid JSON containing NO code blocks or markdown wrappers (i.e. DO NOT output \`\`\`json). Just the JSON object itself.

MY RAW CV TEXT:
${cvText}

TARGET COMPANY / ROLE:
${targetCompany || "General / Not Specified"}

TARGET JOB DESCRIPTION:
${jobDescription || "Not Specified"}
`;

    // 3. Call Gemini 2.5 Flash API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API Error:", err);
      return NextResponse.json({ error: "Failed to generate resume from AI" }, { status: 502 });
    }

    const aiData = await response.json();
    const resultText = aiData.candidates[0].content.parts[0].text;
    
    // Parse the JSON
    const structuredResume = JSON.parse(resultText);

    return NextResponse.json({ success: true, data: structuredResume });

  } catch (error: any) {
    console.error("Resume Generation Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
