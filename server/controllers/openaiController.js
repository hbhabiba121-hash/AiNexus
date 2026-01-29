const dotenv = require("dotenv");
dotenv.config();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Available Groq models (as of 2024):
// - "llama3-70b-8192"      (Most powerful)
// - "llama3-8b-8192"       (Fastest)
// - "mixtral-8x7b-32768"   (Good balance) - might be deprecated
// - "gemma-7b-it"          (Newer option)

const GROQ_MODEL = "llama-3.1-8b-instant"; // Change this if needed

// Helper function for Groq API calls
const groqCompletion = async (prompt, maxTokens = 500, temperature = 0.5) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      temperature: temperature,
    });
    
    return completion.choices[0]?.message?.content || "No response generated";
  } catch (error) {
    console.error("Groq API Error:", error.message);
    // Try with different model if first fails
    if (error.message.includes("model_decommissioned") || error.message.includes("not found")) {
      console.log("Trying alternative model...");
      // Try llama3-8b instead
      try {
        const retryCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama3-8b-8192",
          max_tokens: maxTokens,
          temperature: temperature,
        });
        return retryCompletion.choices[0]?.message?.content || "No response";
      } catch (retryError) {
        throw new Error(`Groq API failed with all models: ${retryError.message}`);
      }
    }
    throw error;
  }
};

// Helper for system-prompt based completions (better for article writing)
const groqChatCompletion = async (systemPrompt, userPrompt, maxTokens = 1000, temperature = 0.7) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      temperature: temperature,
    });
    
    return completion.choices[0]?.message?.content || "No response generated";
  } catch (error) {
    console.error("Groq Chat Completion Error:", error.message);
    // Try with alternative model
    try {
      const retryCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: "llama3-8b-8192",
        max_tokens: maxTokens,
        temperature: temperature,
      });
      return retryCompletion.choices[0]?.message?.content || "No response";
    } catch (retryError) {
      throw new Error(`Groq API failed: ${retryError.message}`);
    }
  }
};

// ARTICLE WRITER CONTROLLER
exports.articleWriterController = async (req, res) => {
  try {
    const { 
      topic, 
      articleType = "blog", 
      tone = "professional", 
      wordCount = 500, 
      includeSEO = true, 
      includeSections = true 
    } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    console.log(`Generating ${articleType} article about: ${topic}`);

    // Prepare the prompt based on user preferences
    let userPrompt = `Write a ${articleType} article about "${topic}" in a ${tone} tone. `;
    userPrompt += `The article should be approximately ${wordCount} words. `;
    
    if (includeSEO) {
      userPrompt += `Make it SEO-optimized with proper keywords and meta descriptions. Include relevant keywords naturally in the content. `;
    }
    
    if (includeSections) {
      userPrompt += `Include proper sections with headings (H1, H2, H3) and subheadings. Use HTML tags for structure. `;
    }
    
    userPrompt += `Format the article professionally with introduction, body, and conclusion.`;
    
    // Add specific instructions based on article type
    switch(articleType) {
      case "blog":
        userPrompt += ` Make it engaging for blog readers with a conversational style.`;
        break;
      case "news":
        userPrompt += ` Write in journalistic style with facts and quotes. Include the 5 Ws (who, what, when, where, why).`;
        break;
      case "tutorial":
        userPrompt += ` Make it step-by-step with clear instructions and examples.`;
        break;
      case "academic":
        userPrompt += ` Use formal academic language with citations and references.`;
        break;
      case "marketing":
        userPrompt += ` Make it persuasive with calls-to-action and benefits-focused language.`;
        break;
      case "opinion":
        userPrompt += ` Present a clear viewpoint with supporting arguments.`;
        break;
      case "product":
        userPrompt += ` Provide honest review with pros, cons, and recommendations.`;
        break;
    }

    // System prompt for article writing
    const systemPrompt = `You are a professional article writer with expertise in ${articleType} writing. 
                         Generate well-structured, engaging articles with proper formatting. 
                         Use appropriate HTML tags for structure (h1, h2, h3, p, ul, ol, li, strong, em, blockquote).
                         Write in a ${tone} tone.`;

    // Calculate appropriate tokens based on word count
    const maxTokens = Math.min(wordCount * 1.5, 3000);

    // Call Groq API
    const article = await groqChatCompletion(
      systemPrompt, 
      userPrompt, 
      maxTokens, 
      0.7
    );

    // Calculate actual word count
    const actualWordCount = article.split(/\s+/).length;

    // Return response
    res.json({
      success: true,
      article: article,
      metadata: {
        topic: topic,
        type: articleType,
        tone: tone,
        targetWordCount: wordCount,
        actualWordCount: actualWordCount,
        includeSEO: includeSEO,
        includeSections: includeSections,
        generatedAt: new Date().toISOString(),
        model: GROQ_MODEL
      }
    });

  } catch (error) {
    console.error("Article Writer Error:", error);
    
    // Fallback to a simple response if API fails
    const { topic = "your topic", articleType = "blog" } = req.body;
    
    const fallbackArticle = `
      <h1>${topic}</h1>
      <h2>Introduction</h2>
      <p>This is a ${articleType} article about <strong>${topic}</strong>. While our AI service is currently experiencing high demand, here's a basic structure for your article.</p>
      
      <h2>Main Content</h2>
      <p>${topic} is an important subject that deserves attention. Here are some key points:</p>
      <ul>
        <li>Understanding ${topic} is crucial in today's world</li>
        <li>There are many aspects to consider when discussing ${topic}</li>
        <li>Future developments in ${topic} will impact various industries</li>
      </ul>
      
      <h2>Practical Applications</h2>
      <p>The application of ${topic} can be seen in multiple domains including technology, business, and daily life.</p>
      
      <h2>Conclusion</h2>
      <p>In summary, ${topic} represents a significant area for consideration and further exploration. Understanding it can provide valuable insights and opportunities.</p>
      
      <p><em>Note: This is a fallback response. The AI service will be available shortly for full content generation.</em></p>
    `;
    
    res.json({
      success: true,
      article: fallbackArticle,
      metadata: {
        topic: topic,
        type: articleType,
        isFallback: true,
        generatedAt: new Date().toISOString(),
        note: "Fallback response - AI service temporarily unavailable"
      }
    });
  }
};

// Existing controllers...
exports.summaryController = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }
    
    const prompt = `Summarize this text in a concise way:\n\n${text}`;
    const summary = await groqCompletion(prompt, 300, 0.3);
    
    return res.status(200).json(summary);
  } catch (err) {
    console.log("Summary Error:", err);
    return res.status(500).json({
      message: err.message || "Failed to generate summary",
    });
  }
};

exports.paragraphController = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }
    
    const prompt = `Write a detailed paragraph about: ${text}`;
    const paragraph = await groqCompletion(prompt, 500, 0.5);
    
    return res.status(200).json(paragraph);
  } catch (err) {
    console.log("Paragraph Error:", err);
    return res.status(500).json({
      message: err.message || "Failed to generate paragraph",
    });
  }
};

exports.chatbotController = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }
    
    const prompt = `As a helpful AI assistant, respond to this: ${text}`;
    const response = await groqCompletion(prompt, 300, 0.7);
    
    return res.status(200).json(response);
  } catch (err) {
    console.log("Chatbot Error:", err);
    return res.status(500).json({
      message: err.message || "Failed to generate chat response",
    });
  }
};

exports.jsconverterController = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }
    
    const prompt = `Convert these instructions into clean JavaScript code with comments:\n${text}`;
    const code = await groqCompletion(prompt, 400, 0.25);
    
    return res.status(200).json(code);
  } catch (err) {
    console.log("JS Converter Error:", err);
    return res.status(500).json({
      message: err.message || "Failed to generate JavaScript code",
    });
  }
};

exports.scifiImageController = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }
    
    const prompt = `Describe in detail a sci-fi image of: ${text}. Include visual details about colors, lighting, style, and atmosphere.`;
    const description = await groqCompletion(prompt, 300, 0.8);
    
    return res.status(200).json({
      type: "description",
      content: description,
      note: "Groq API provides text only. This is a detailed description of your sci-fi image."
    });
  } catch (err) {
    console.log("Sci-fi Image Error:", err);
    return res.status(500).json({
      message: err.message || "Failed to generate image description",
    });
  }
};