import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './config/env.js';

console.log('Testing Gemini API key:', env.GEMINI_API_KEY ? `${env.GEMINI_API_KEY.substring(0, 8)}...` : 'NONE');

async function testGeminiModel(modelName: string) {
  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    const response = await model.generateContent('Say hello in 3 words');
    console.log(`✅ Model ${modelName} Success:`, response.response.text().trim());
  } catch (err: any) {
    console.error(`❌ Model ${modelName} Error:`, err.message || err);
  }
}

async function runTests() {
  await testGeminiModel('gemini-3.6-flash');
}

runTests();
