import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = 'AIzaSyCpI6tX9zV_Kh3PaVc9T-Qxt3z0D-ZCIRk';

const genAI = new GoogleGenerativeAI(API_KEY);

const generateAction = async (req, res) => {
   // Run first prompt
   console.log(`API: ${req.body.prompt}`);

   // For text-only input, use the gemini-pro model
   const model = genAI.getGenerativeModel({ model: "gemini-pro"});

   const prompt = req.body.prompt;

   const result = await model.generateContent(prompt);
   const response = await result.response;
   const text = await response.text();
   console.log(text);

   res.status(200).json({ output: text });
}

export default generateAction;
