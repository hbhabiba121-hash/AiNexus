const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const axios = require("axios");

const router = express.Router();

/* -------------------- CONFIG -------------------- */
const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const AI_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.2-1b-preview", 
  "llama-3.2-3b-preview",
  "mixtral-8x7b-32768",
  "gemma2-9b-it"
];
const DEFAULT_MODEL = AI_MODELS[0];

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Use PDF, PNG, JPG, or TXT.'));
    }
  }
});

/* -------------------- TEXT EXTRACTION FUNCTIONS -------------------- */
async function extractTextFromPDF(pdfPath) {
  try {
    console.log("📄 Extracting text from PDF...");
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    let text = pdfData.text || "";
    
    // Clean the extracted text
    text = cleanExtractedText(text);
    
    // If text quality is poor, try OCR
    if (text.length < 200 || text.split(' ').length < 50) {
      console.log("🖼 PDF text quality low, attempting OCR...");
      const ocrText = await extractTextFromImagePDF(pdfPath);
      return ocrText || text;
    }
    
    return text;
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    return await extractTextFromImagePDF(pdfPath);
  }
}

async function extractTextFromImagePDF(pdfPath) {
  console.log("🔄 Converting PDF pages to images for OCR...");
  
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  
  const outputBase = path.join(tempDir, `page-${Date.now()}`);
  let allText = "";
  
  try {
    // Convert first 2 pages only (for speed)
    await new Promise((resolve, reject) => {
      const pdftoppmPath = "C:/Users/pc/Downloads/Release-25.12.0-0/poppler-25.12.0/Library/bin/pdftoppm.exe";
      exec(
        `"${pdftoppmPath}" -png -f 1 -l 2 "${pdfPath}" "${outputBase}"`,
        (err) => {
          if (err) {
            console.warn("pdftoppm failed, trying alternative...");
            // Try without specific path
            exec(`pdftoppm -png -f 1 -l 2 "${pdfPath}" "${outputBase}"`, (err2) => {
              if (err2) reject(err2);
              else resolve();
            });
          } else {
            resolve();
          }
        }
      );
    });
    
    // OCR each page
    for (let i = 1; i <= 2; i++) {
      const imagePath = `${outputBase}-${i}.png`;
      if (fs.existsSync(imagePath)) {
        console.log(`🧠 OCR on page ${i}...`);
        try {
          const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'eng+fra', // English + French
            { 
              logger: m => {
                if (m.status === 'recognizing text') {
                  console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
              }
            }
          );
          allText += text + "\n\n";
          fs.unlinkSync(imagePath);
        } catch (ocrErr) {
          console.error(`OCR error page ${i}:`, ocrErr.message);
          try { fs.unlinkSync(imagePath); } catch (e) {}
        }
      }
    }
    
    return cleanExtractedText(allText);
  } catch (error) {
    console.error("Image PDF extraction error:", error.message);
    return "";
  }
}

async function extractTextFromImage(imagePath) {
  try {
    console.log("🖼 Extracting text from image...");
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng+fra',
      { logger: m => console.log(`Image OCR: ${Math.round(m.progress * 100)}%`) }
    );
    return cleanExtractedText(text);
  } catch (err) {
    console.error("Image extraction error:", err.message);
    return "";
  }
}

function cleanExtractedText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[•\-*]\s+/g, '\n• ')
    .replace(/([.!?])\s+/g, '$1\n')
    .trim();
}

/* -------------------- GROQ AI ANALYSIS -------------------- */
async function analyzeCVWithAI(cvText, fileName) {
  for (const model of AI_MODELS) {
    try {
      console.log(`🤖 Analyzing with ${model}...`);
      
      // Prepare optimized prompt
      const prompt = `Analyze this CV professionally and return JSON analysis:

CV CONTENT:
${cvText.substring(0, 3500)}

ANALYSIS REQUIREMENTS:
1. Score from 0-100 based on: completeness, skills, experience, structure
2. Grade (A+, A, B+, B, C, D, F)
3. Brief 2-line summary
4. Top 3-5 strengths
5. Top 3-5 weaknesses  
6. Section analysis (contact, summary, education, experience, skills, projects)
7. Skills categorization (technical, soft, tools, missing)
8. ATS optimization score & keywords
9. 4-6 specific recommendations
10. Suggested job titles
11. Experience level estimate
12. Salary range estimate

RETURN ONLY VALID JSON with this structure:
{
  "overallScore": 85,
  "grade": "A",
  "summary": "summary here",
  "strengths": ["s1", "s2"],
  "weaknesses": ["w1", "w2"],
  "sectionsAnalysis": {
    "contact": {"present": true, "score": 10, "feedback": "fb"},
    "summary": {"present": true, "score": 8, "feedback": "fb"},
    "education": {"present": true, "score": 9, "feedback": "fb"},
    "experience": {"present": true, "score": 9, "feedback": "fb"},
    "skills": {"present": true, "score": 8, "feedback": "fb"},
    "projects": {"present": true, "score": 7, "feedback": "fb"}
  },
  "skillsAnalysis": {
    "technical": ["tech1", "tech2"],
    "soft": ["soft1", "soft2"],
    "tools": ["tool1", "tool2"],
    "missing": ["miss1", "miss2"]
  },
  "atsOptimization": {
    "score": 75,
    "feedback": "fb here",
    "recommendedKeywords": ["kw1", "kw2"]
  },
  "detailedFeedback": ["fb1", "fb2"],
  "recommendations": ["rec1", "rec2"],
  "suggestedJobTitles": ["job1", "job2"],
  "estimatedExperienceLevel": "level",
  "industryFit": ["ind1"],
  "salaryRange": "range here"
}`;

      const response = await axios.post(
        GROQ_API_URL,
        {
          model: model,
          messages: [
            {
              role: "system",
              content: "You are an expert CV analyzer. Return ONLY valid JSON. No explanations, no markdown, just JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2500,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 45000
        }
      );

      console.log(`✅ AI analysis successful with ${model}`);
      
      const aiResponse = JSON.parse(response.data.choices[0].message.content);
      
      // Enhance with metadata
      return {
        ...aiResponse,
        metadata: {
          model: model,
          provider: "Groq AI",
          api: "Llama 3.1",
          analyzedAt: new Date().toISOString(),
          wordCount: cvText.split(/\s+/).length,
          hasEmail: /@/.test(cvText),
          hasPhone: /\d{6,}/.test(cvText)
        }
      };

    } catch (error) {
      console.log(`❌ Model ${model} failed:`, error.response?.data?.error?.message || error.message);
      continue;
    }
  }
  
  console.log("⚠️ All AI models failed, using smart analysis");
  return await smartRuleBasedAnalysis(cvText, fileName);
}

/* -------------------- SMART RULE-BASED ANALYSIS -------------------- */
async function smartRuleBasedAnalysis(cvText, fileName) {
  console.log("⚡ Using smart rule-based analysis");
  
  const text = cvText.toLowerCase();
  const cleanText = cvText;
  
  // Enhanced contact detection
  const email = (cleanText.match(/[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/) || [])[0];
  const phone = (cleanText.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/) || [])[0];
  const linkedin = (cleanText.match(/linkedin\.com\/in\/[A-Za-z0-9-]+/i) || [])[0];
  const github = (cleanText.match(/github\.com\/[A-Za-z0-9-]+/i) || [])[0];
  
  // Detect role from content
  let detectedRole = "Software Developer";
  if (text.includes("marketing") || text.includes("digital")) detectedRole = "Digital Marketer";
  if (text.includes("data") || text.includes("analyst")) detectedRole = "Data Analyst";
  if (text.includes("design") || text.includes("ui/ux")) detectedRole = "UI/UX Designer";
  
  // Extract skills
  const allSkills = {
    programming: ["javascript", "python", "java", "php", "c", "c++", "c#", "ruby", "go", "swift", "kotlin", "typescript"],
    web: ["html", "css", "react", "angular", "vue", "node", "express", "django", "flask", "laravel", "bootstrap"],
    database: ["mysql", "postgresql", "mongodb", "oracle", "sql", "nosql", "redis", "firebase"],
    devops: ["docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "git", "github", "gitlab", "linux"],
    tools: ["git", "vscode", "intellij", "eclipse", "photoshop", "figma", "jira", "confluence"],
    soft: ["communication", "teamwork", "leadership", "problem solving", "creativity", "adaptability"]
  };
  
  const foundSkills = { technical: [], soft: [], tools: [], missing: [] };
  
  Object.entries(allSkills).forEach(([category, skills]) => {
    skills.forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        if (category === 'soft') foundSkills.soft.push(skill);
        else if (category === 'tools') foundSkills.tools.push(skill);
        else foundSkills.technical.push(skill);
      }
    });
  });
  
  // Missing skills for the detected role
  const roleExpectedSkills = {
    "Software Developer": ["React", "Node.js", "Git", "REST API", "Testing"],
    "Digital Marketer": ["SEO", "Google Analytics", "Social Media", "Content Strategy", "Email Marketing"],
    "Data Analyst": ["Python", "SQL", "Excel", "Tableau", "Statistics"],
    "UI/UX Designer": ["Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research"]
  };
  
  foundSkills.missing = (roleExpectedSkills[detectedRole] || []).filter(skill => 
    !foundSkills.technical.concat(foundSkills.tools).some(s => 
      s.toLowerCase().includes(skill.toLowerCase().split(' ')[0])
    )
  ).slice(0, 5);
  
  // Section detection
  const sections = {
    contact: !!(email || phone),
    summary: /(summary|about|profile|à propos|objectif)/i.test(cleanText),
    education: /(education|formation|diploma|degree|baccalauréat|master|licence)/i.test(cleanText),
    experience: /(experience|work|employment|stage|internship|emploi)/i.test(cleanText),
    skills: /(skills|compétences|technologies|technical)/i.test(cleanText),
    projects: /(projects|projets|portfolio)/i.test(cleanText)
  };
  
  // Calculate comprehensive score
  let score = 50;
  
  // Contact (15 points)
  if (email) score += 10;
  if (phone) score += 5;
  if (linkedin) score += 3;
  if (github) score += 2;
  
  // Content quality (25 points)
  const wordCount = cleanText.split(/\s+/).length;
  if (wordCount > 300) score += 10;
  if (wordCount > 500) score += 5;
  if (wordCount > 700) score += 5;
  
  const hasAchievements = /\d+%|\d+\s*(increase|decrease|growth|improved|reduced)/i.test(cleanText);
  if (hasAchievements) score += 10;
  
  const hasActionVerbs = /(developed|created|implemented|managed|led|improved|increased|reduced|designed|built)/i.test(cleanText);
  if (hasActionVerbs) score += 5;
  
  // Sections (35 points)
  Object.values(sections).forEach((present, idx) => {
    if (present) score += [10, 5, 10, 15, 10, 5][idx] || 5;
  });
  
  // Skills (15 points)
  const skillCount = foundSkills.technical.length + foundSkills.tools.length;
  if (skillCount >= 10) score += 15;
  else if (skillCount >= 7) score += 10;
  else if (skillCount >= 5) score += 5;
  
  // Languages (5 points)
  const languageCount = (cleanText.match(/(arabic|french|english|spanish|german|chinese|japanese)/gi) || []).length;
  if (languageCount >= 3) score += 5;
  else if (languageCount >= 2) score += 3;
  
  score = Math.min(score, 100);
  
  // Determine grade
  const grade = score >= 90 ? "A+" :
                score >= 80 ? "A" :
                score >= 70 ? "B+" :
                score >= 60 ? "B" :
                score >= 50 ? "C" :
                "Needs Improvement";
  
  // Generate feedback
  const strengths = [];
  const weaknesses = [];
  
  if (email) strengths.push("Professional email address included");
  if (phone) strengths.push("Phone number provided");
  if (linkedin) strengths.push("LinkedIn profile included");
  if (skillCount >= 8) strengths.push(`Strong technical skills (${skillCount}+ skills)`);
  if (hasAchievements) strengths.push("Includes measurable achievements");
  if (languageCount >= 2) strengths.push(`Multilingual (${languageCount} languages)`);
  
  if (!email) weaknesses.push("Add professional email address");
  if (!phone) weaknesses.push("Add phone number for direct contact");
  if (!linkedin) weaknesses.push("Include LinkedIn profile URL");
  if (skillCount < 5) weaknesses.push("Add more technical skills");
  if (!hasAchievements) weaknesses.push("Quantify achievements with numbers/percentages");
  if (wordCount < 300) weaknesses.push("Add more detail about responsibilities");
  
  // ATS optimization
  const atsKeywords = {
    "Software Developer": ["software", "development", "programming", "web", "application", "code", "database", "api"],
    "Digital Marketer": ["marketing", "digital", "strategy", "content", "social media", "seo", "analytics", "campaign"],
    "Data Analyst": ["data", "analysis", "analytics", "sql", "python", "visualization", "reporting", "statistics"],
    "UI/UX Designer": ["design", "ui", "ux", "user experience", "wireframe", "prototype", "figma", "adobe xd"]
  };
  
  const relevantKeywords = atsKeywords[detectedRole] || atsKeywords["Software Developer"];
  const matchedKeywords = relevantKeywords.filter(kw => text.includes(kw.toLowerCase()));
  const atsScore = Math.min(50 + (matchedKeywords.length * 10), 95);
  
  return {
    overallScore: score,
    grade: grade,
    summary: `A ${detectedRole} CV with ${skillCount}+ technical skills. ${sections.experience ? 'Includes relevant experience.' : 'Could use more experience details.'} ${grade === 'A' || grade === 'A+' ? 'Well-structured and professional.' : 'Needs some improvements.'}`,
    strengths: strengths.length > 0 ? strengths : ["Good overall structure", "Clear sections"],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["Add more specific details"],
    sectionsAnalysis: {
      contact: { present: sections.contact, score: sections.contact ? (email && phone ? 10 : 7) : 3, feedback: sections.contact ? "Contact info present" : "Add contact section" },
      summary: { present: sections.summary, score: sections.summary ? 8 : 4, feedback: sections.summary ? "Professional summary included" : "Add summary section" },
      education: { present: sections.education, score: sections.education ? 9 : 4, feedback: sections.education ? "Education detailed" : "Add education" },
      experience: { present: sections.experience, score: sections.experience ? 9 : 4, feedback: sections.experience ? "Experience included" : "Add work experience" },
      skills: { present: sections.skills, score: sections.skills ? 8 : 4, feedback: sections.skills ? "Skills listed" : "Add skills section" },
      projects: { present: sections.projects, score: sections.projects ? 7 : 3, feedback: sections.projects ? "Projects showcased" : "Consider adding projects" }
    },
    skillsAnalysis: {
      technical: [...new Set(foundSkills.technical)].map(s => s.charAt(0).toUpperCase() + s.slice(1)).slice(0, 15),
      soft: [...new Set(foundSkills.soft)].map(s => s.charAt(0).toUpperCase() + s.slice(1)).slice(0, 10),
      tools: [...new Set(foundSkills.tools)].map(s => s.charAt(0).toUpperCase() + s.slice(1)).slice(0, 10),
      missing: foundSkills.missing
    },
    atsOptimization: {
      score: atsScore,
      feedback: atsScore > 80 ? "Good ATS optimization" : atsScore > 60 ? "Average ATS optimization" : "Needs better keyword optimization",
      recommendedKeywords: relevantKeywords.filter(kw => !matchedKeywords.includes(kw)).slice(0, 8),
      matchedKeywords: matchedKeywords
    },
    detailedFeedback: [
      email ? "✅ Professional email found" : "❌ Add email address",
      phone ? "✅ Phone number found" : "❌ Add phone number",
      sections.education ? "✅ Education section present" : "❌ Add education details",
      sections.experience ? "✅ Experience section present" : "❌ Add work experience",
      hasAchievements ? "✅ Quantified achievements" : "❌ Add more numbers/percentages",
      skillCount >= 8 ? `✅ Strong skills (${skillCount} skills)` : `⚠️ Add more skills (currently ${skillCount})`
    ],
    recommendations: [
      "Add LinkedIn and GitHub profiles",
      "Use bullet points for better readability",
      "Quantify achievements with specific numbers",
      `Add missing skills: ${foundSkills.missing.slice(0, 3).join(', ')}`,
      "Include a professional summary at the top",
      "Use consistent formatting throughout"
    ],
    suggestedJobTitles: [
      detectedRole,
      ...(detectedRole === "Software Developer" ? ["Web Developer", "Full Stack Developer", "Backend Developer", "Frontend Developer"] : 
          detectedRole === "Digital Marketer" ? ["Marketing Specialist", "Content Marketer", "Social Media Manager", "SEO Specialist"] :
          detectedRole === "Data Analyst" ? ["Business Analyst", "Data Scientist", "BI Analyst", "Marketing Analyst"] :
          ["UI Designer", "UX Designer", "Product Designer", "Visual Designer"])
    ].slice(0, 5),
    estimatedExperienceLevel: wordCount > 500 ? "2-4 years" : wordCount > 300 ? "1-3 years" : "Entry-level",
    industryFit: ["Technology", "Software", "IT Services", "Digital"],
    salaryRange: wordCount > 500 ? "$50,000 - $75,000" : wordCount > 300 ? "$40,000 - $60,000" : "$30,000 - $50,000",
    metadata: {
      model: "Smart Rule-based Engine",
      provider: "CV Analyzer Pro",
      wordCount: wordCount,
      skillCount: skillCount,
      hasEmail: !!email,
      hasPhone: !!phone,
      hasLinkedIn: !!linkedin,
      detectedRole: detectedRole
    }
  };
}

/* -------------------- MAIN ANALYZE ROUTE -------------------- */
router.post("/analyze", upload.single("cv"), async (req, res) => {
  console.log("📁 CV Analyzer endpoint hit!");
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = req.file.originalname;
    
    let extractedText = "";
    
    // Extract text based on file type
    switch (ext) {
      case '.pdf':
        extractedText = await extractTextFromPDF(filePath);
        break;
      case '.png':
      case '.jpg':
      case '.jpeg':
        extractedText = await extractTextFromImage(filePath);
        break;
      case '.txt':
        extractedText = fs.readFileSync(filePath, 'utf8');
        break;
      default:
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: `Unsupported file type: ${ext}` });
    }
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 100) {
      return res.status(400).json({
        error: "Insufficient text extracted",
        suggestion: "Try uploading a clearer file or text-based PDF",
        extractedLength: extractedText?.length || 0
      });
    }
    
    console.log(`✅ Successfully extracted ${extractedText.length} characters`);
    
    // Perform AI analysis
    const aiAnalysis = await analyzeCVWithAI(extractedText, fileName);
    
    // Prepare response
    const response = {
      success: true,
      fileName,
      fileType: ext,
      textPreview: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? "..." : ""),
      basicMetrics: {
        wordCount: extractedText.split(/\s+/).length,
        characterCount: extractedText.length,
        hasEmail: /@/.test(extractedText),
        hasPhone: /\d{6,}/.test(extractedText),
        extractedSuccessfully: true
      },
      aiAnalysis,
      generatedAt: new Date().toISOString(),
      analysisType: aiAnalysis.metadata?.model?.includes("Rule-based") ? "rule-based" : "ai-powered"
    };
    
    res.json(response);
    
  } catch (err) {
    console.error("❌ CV Analyzer error:", err.message);
    // Clean up file if exists
    try { if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); } catch (e) {}
    res.status(500).json({ 
      success: false,
      error: "Analysis failed",
      details: err.message,
      suggestion: "Try a different file or check server logs"
    });
  }
});

/* -------------------- HEALTH CHECK -------------------- */
router.get("/health", async (req, res) => {
  try {
    // Test Groq API with a simple request
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: DEFAULT_MODEL,
        messages: [{ role: "user", content: "Say 'AI service is operational'" }],
        max_tokens: 10,
        temperature: 0.1
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 8000
      }
    );
    
    res.json({
      status: "✅ Operational",
      aiService: "Groq Cloud AI",
      model: DEFAULT_MODEL,
      provider: "Groq",
      message: "AI analysis service is ready",
      supportedModels: AI_MODELS,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.log("Health check error:", error.response?.data?.error?.message || error.message);
    
    res.json({
      status: "⚠️ Limited",
      aiService: "Groq Cloud AI",
      error: error.response?.data?.error?.message || "Connection failed",
      fallback: "Smart rule-based analysis available",
      supportedModels: AI_MODELS,
      suggestion: "Check API key or internet connection",
      timestamp: new Date().toISOString()
    });
  }
});

/* -------------------- TEST ENDPOINT (Optional) -------------------- */
router.post("/test", upload.single("cv"), async (req, res) => {
  // Simple test endpoint
  if (!req.file) {
    return res.status(400).json({ error: "No file" });
  }
  
  try {
    const filePath = req.file.path;
    const text = fs.existsSync(filePath) ? "File received" : "Error";
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: "Test endpoint working",
      fileReceived: !!req.file,
      text: text
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;