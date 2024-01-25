import { OpenAI } from "openai";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const { context, prompt } = (await readBody(event)) as {
      context: string;
      prompt: string;
    };
    const client = new OpenAI({
      apiKey: config.openaiApiKey,
    });
    const answerToOutsideContextPrompts = "I have no idea boss";

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a virtual financial assistant. Answer questions based on the financial context provided. If a question can't be answered with the context, say "${answerToOutsideContextPrompts}"\n\n`,
        },
        {
          role: "user",
          content: `Context:\n${context}\n\n---\n\nQuestion: ${prompt}\nAnswer:`,
        },
      ],
      temperature: 0.7,
      max_tokens: 250, // Adjust as needed
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: null,
    });

    return response.choices[0]?.message?.content?.replace(/\.[^.]+$/, ".");
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: (err as any).message,
    });
  }
});
