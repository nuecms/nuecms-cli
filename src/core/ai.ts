import OpenAI from "openai";
import { loadConfig } from '../config/loadConfig';
export function useAI(aiConfig: { baseURL: string, apiKey: string, model: string }) {
  if (!aiConfig) {
    throw new Error('AI configuration is missing');
  }
  const openai = new OpenAI({
      baseURL: aiConfig.baseURL,
      apiKey: aiConfig.apiKey,
  });
  return openai;
}



export async function JsonToSQL(json: string) {
  const nueConfig = await loadConfig();
  const aiConfig = nueConfig?.aiConfig as { baseURL: string, apiKey: string, model: string };
  const openai = await useAI(aiConfig);

  const promptRules = `
    1. Do not output markdown.
    2. Do not wrap code in **code** or __code__ or **__code__**
    3. Only produce code.
    4. No comments in code.
    5. Try to only produce code and do not add anything other than code to your reply.
    6. I only want code.
    7. You will not produce anything other than code.
    8. You will not produce any messages.
    9. Do not wrap code in \`\`\`.
    10. Strictly, no markdown in output.
    11. Do not use markdown bolding, italics, or any other formatting.
  `;
  const prompt = `You are a senior architect expert. Convert the following JSON into a SQL CREATE TABLE statement, auto detecting primaryKey and foreignKey fields, and setting default NULL or NOT NULL based on the field context. Use a 36-character UUID style for the primaryKey, the engine should be InnoDB, the charset should be utf8mb4, and each field must have a COMMENT with a description : ${json} ${promptRules}`;

  const response = await openai.chat.completions.create({
    model: aiConfig?.model as string,
    messages: [
      {
        role: "system",
        content: nueConfig?.jsonsql?.prompt || prompt,
      }
    ],
  });
  return response?.choices[0].message.content as string;
}
