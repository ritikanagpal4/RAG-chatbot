import Groq from "groq-sdk";
import readline from 'node:readline/promises';
import { vectorStore } from './prepare.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function chat() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    while (true) {
        const question = await rl.question('Ask a question about the document: ');
        if (question.toLowerCase() === 'exit') {
            console.log('Exiting the chat. Goodbye!');
            rl.close();
            break;
        }

        await vectorStore.similaritySearch(question, 3).then(async (results) => {
            const context = results.map(result => result.pageContent).join('\n');
            const SYSTEM_PROMPT = "You are a helpful assistant that answers questions based on the provided context. Use only the information from the context to answer the question. If the answer is not in the context, say you don't know.";

            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Context:\n${context}\n\nQuestion:\n${question}` }
                ],
            });

            console.log('Answer:', completion.choices[0].message.content);
        });

    }

    rl.close();
}

chat();
