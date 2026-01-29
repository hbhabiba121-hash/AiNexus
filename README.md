# AiNexus

> Full-stack AI Assistant for content creation, code optimization, CV analysis, and more.

**AiNexus** is a multifunctional AI assistant built with the MERN stack.  
It can understand context, answer questions, summarize text, generate structured content, optimize SEO, convert and analyze code, and even analyze/evaluate CVs.  

> ⚠️ **Note:** This project uses **Grok AI API** for AI-powered features. Make sure you have a valid Grok AI API key.

---

## Features

### AI Assistant
- Answer questions intelligently  
- Multilingual support  
- Understand context for better responses  

### Text Summarizer & Paragraph Generator
- Extract key points from text  
- Generate structured and coherent paragraphs  

### Article Writer
- Create complete articles with professional formatting  
- Optimize content for SEO  
- Control tone and style  

### Code Tools
- Convert code between programming languages  
- Syntax check and optimization  

### CV Analyzer
- Upload a CV  
- Get detailed analysis  
- Receive suggestions for improvement  

---

## Tech Stack

- **Frontend:** React.js  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT / MERN authentication  
- **AI Integration:** Grok AI API  

---

## Environment Variables

Create a `.env` file in the **server** folder with the following:  

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatgpt-clone
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_grok_ai_key
