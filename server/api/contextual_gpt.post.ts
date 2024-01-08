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
    const answerToOutsideContextPrompts =
      "I'm here to help with financial or administrative matters within my role. For topics beyond that scope, I might not have the information needed to provide accurate guidance.";

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Answer the question based on the context below, and if the question can\'t be answered based on the context, say "${answerToOutsideContextPrompts}"\n\n`,
        },
        {
          role: "user",
          content: `Context: ${context}\n\n---\n\nQuestion: ${prompt}\nAnswer:`,
        },
      ],
      temperature: 0,
      max_tokens: 150,
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
