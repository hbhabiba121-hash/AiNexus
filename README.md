# AiNexus

> Full-stack AI Assistant for content creation, code optimization, CV analysis, and more.

**AiNexus** is a multifunctional AI assistant built with the MERN stack.  
It can understand context, answer questions, summarize text, generate structured content, optimize SEO, convert and analyze code, and even analyze/evaluate CVs.  

> ⚠️ **Note:** This project uses **Grok AI API** for AI-powered features. Make sure you have a valid Grok AI API key.
![image alt](https://github.com/hbhabiba121-hash/AiNexus/blob/19982980e12d3b105100deddc7a1c99bb2bb896a/Screenshot%202026-01-29%20181004.png)
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
![image alt](https://github.com/hbhabiba121-hash/AiNexus/blob/7da779f2ffb30bda297f3bba617828dc2b472b7f/Screenshot%202026-01-29%20181020.png)
![image alt](https://github.com/hbhabiba121-hash/AiNexus/blob/beaeb934396898517b29bb943e4e339ddd6fe4ad/Screenshot%202026-01-29%20181027.png)
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
