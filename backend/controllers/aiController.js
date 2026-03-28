// require("dotenv").config();
// const {GoogleGenAI}=require("@google/genai");
// const {conceptExplainPrompt,questionAnswerPrompt}=require("../utils/prompts");
// const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});


//  async function generateInterviewQuestions(req, res) {
//   try {
//     const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

//     if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const prompt = questionAnswerPrompt({ role, experience, topicsToFocus, numberOfQuestions });

//     const response = await ai.models.generateContent({
//       model: "gemini-2.0-flash-lite",
//       contents: prompt,
//     });

//     let rawText = response.text;
//     console.log(rawText);
//     // Clean it: remove beginning and end
//     const cleanedText = rawText
//   .replace(/^```json\s*|\s*```$/g, "") // Remove ```json at start and ``` at end
//   .replace(/^[\s\S]*?(\[\s*\{)/, "$1") // Remove text until [{ as fallback
//   .replace(/}\s*\][\s\S]*$/, "} ]") // Remove text after }]
//   .replace(/,\s*]/, "]") // Remove extra comma before ]
//   .trim() // Remove extra spaces
//   .replace(/\s+/g, " ");
//     const data=JSON.parse(cleanedText);
    
//     return res.json(data);
//   } catch (error) {
//     return res.status(500).json({ message: "Error processing request",error:error.message});
//   }
// }

// const generateConceptExplanation = async (req, res) => {
//   try {
//     const { question } = req.body;

//     if (!question) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const prompt = conceptExplainPrompt(question);

//     const response = await ai.models.generateContent({
//       model: "gemini-2.0-flash-lite",
//       contents: prompt,
//     });

//     let rawText = response.text;

//     // Clean it: Remove ```json and ``` from beginning and end if present
//     const cleanedText = rawText.replace(/^```json\s*|\s*```$/g, "") // Remove ```json at start and ``` at end
//   .replace(/^[\s\S]*?(\[\s*\{)/, "$1") // Remove text until [{ as fallback
//   .replace(/}\s*\][\s\S]*$/, "} ]") // Remove text after }]
//   .replace(/,\s*]/, "]") // Remove extra comma before ]
//   .trim() // Remove extra spaces
//   .replace(/\s+/g, " ");

//     const data = JSON.parse(cleanedText);

//     res.status(200).json({ success: true, data });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Failed to generate questions",
//       error: error.message,
//     });
//   }
// };

// module.exports={generateConceptExplanation,generateInterviewQuestions};

require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { conceptExplainPrompt, questionAnswerPrompt } = require("../utils/prompts");
const retryWithBackoff = require("../utils/retryWithBackoff");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

async function generateInterviewQuestions(req, res) {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = questionAnswerPrompt({ role, experience, topicsToFocus, numberOfQuestions });

    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      })
    );

    let rawText = response.text;
    console.log("Raw AI response:", rawText);

    const cleanedText = rawText
      .replace(/^```json\s*|\s*```$/g, "")
      .replace(/^[\s\S]*?(\[\s*\{)/, "$1")
      .replace(/}\s*\][\s\S]*$/, "} ]")
      .replace(/,\s*]/, "]")
      .trim()
      .replace(/\s+/g, " ");

    const data = JSON.parse(cleanedText);
    return res.json(data);
  } catch (error) {
    console.error("generateInterviewQuestions error:", error);

    const msg = (error?.message || "").toLowerCase();
    const status =
      error?.status ||
      error?.statusCode ||
      error?.code ||
      error?.response?.status ||
      "";

    const isRateLimit =
      status === 429 ||
      status === "429" ||
      status === "RESOURCE_EXHAUSTED" ||
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("rate") ||
      msg.includes("resource_exhausted") ||
      msg.includes("too many requests") ||
      msg.includes("exhausted") ||
      msg.includes("limit");

    if (isRateLimit) {
      return res.status(503).json({
        message: "AI service is currently busy. Please wait a moment and try again.",
      });
    }

    return res.status(500).json({
      message: "Error processing request",
      error: error.message,
    });
  }
}

const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = conceptExplainPrompt(question);

    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      })
    );

    let rawText = response.text;

    const cleanedText = rawText
      .replace(/^```json\s*|\s*```$/g, "")
      .replace(/^[\s\S]*?(\[\s*\{)/, "$1")
      .replace(/}\s*\][\s\S]*$/, "} ]")
      .replace(/,\s*]/, "]")
      .trim()
      .replace(/\s+/g, " ");

    const data = JSON.parse(cleanedText);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("generateConceptExplanation error:", error);

    const msg = (error?.message || "").toLowerCase();
    const status =
      error?.status ||
      error?.statusCode ||
      error?.code ||
      error?.response?.status ||
      "";

    const isRateLimit =
      status === 429 ||
      status === "429" ||
      status === "RESOURCE_EXHAUSTED" ||
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("rate") ||
      msg.includes("resource_exhausted") ||
      msg.includes("too many requests") ||
      msg.includes("exhausted") ||
      msg.includes("limit");

    if (isRateLimit) {
      return res.status(503).json({
        message: "AI service is currently busy. Please wait a moment and try again.",
      });
    }

    res.status(500).json({
      message: "Failed to generate explanation",
      error: error.message,
    });
  }
};

module.exports = { generateConceptExplanation, generateInterviewQuestions };
