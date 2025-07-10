require("dotenv").config();
const {GoogleGenAI}=require("@google/genai");
const {conceptExplainPrompt,questionAnswerPrompt}=require("../utils/prompts");
const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});


 async function generateInterviewQuestions(req, res) {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = questionAnswerPrompt({ role, experience, topicsToFocus, numberOfQuestions });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;
    console.log(rawText);
    // Clean it: remove beginning and end
    const cleanedText = rawText
  .replace(/^```json\s*|\s*```$/g, "") // Remove ```json at start and ``` at end
  .replace(/^[\s\S]*?(\[\s*\{)/, "$1") // Remove text until [{ as fallback
  .replace(/}\s*\][\s\S]*$/, "} ]") // Remove text after }]
  .replace(/,\s*]/, "]") // Remove extra comma before ]
  .trim() // Remove extra spaces
  .replace(/\s+/g, " ");
    const data=JSON.parse(cleanedText);
    
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error processing request",error:error.message});
  }
}

const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = conceptExplainPrompt(question);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    // Clean it: Remove ```json and ``` from beginning and end if present
    const cleanedText = rawText.replace(/^```json\s*|\s*```$/g, "") // Remove ```json at start and ``` at end
  .replace(/^[\s\S]*?(\[\s*\{)/, "$1") // Remove text until [{ as fallback
  .replace(/}\s*\][\s\S]*$/, "} ]") // Remove text after }]
  .replace(/,\s*]/, "]") // Remove extra comma before ]
  .trim() // Remove extra spaces
  .replace(/\s+/g, " ");

    const data = JSON.parse(cleanedText);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

module.exports={generateConceptExplanation,generateInterviewQuestions};