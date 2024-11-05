import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

const generateAction = async (req, res) => {
    console.log(`API: ${req.body.prompt}`);
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = req.body.prompt;
    const result = await model.generateContent(prompt);
    
    const response = await result.response;
    const text = await response.text();
    console.log(text);
    
    res.status(200).json({ output: text });
}

export default generateAction;
