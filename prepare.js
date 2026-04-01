import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { PineconeStore } from "@langchain/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { OpenAIEmbeddings } from "@langchain/openai";

dotenv.config();

const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    openAIApiKey: process.env.OPENAI_API_KEY
});  

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const pineconeIndex = pinecone.index("pdf-chatbot-rag");
export const vectorStore = new PineconeStore(embeddings, {
    pineconeIndex, maxConcurrency: 5
});

export async function indexTheDocument(filePath) {
    const loader = new PDFLoader(filePath, {splitPages: false});
    const doc = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });

    const texts = await textSplitter.splitText(doc[0].pageContent);

    const documents = texts.map((chunk) => ({
    pageContent: chunk,
    metadata: {
        source: doc[0].metadata.source,
    },
    }));

    await vectorStore.addDocuments(documents);
    console.log("UPSERT SUCCESS");
    console.log(await pineconeIndex.describeIndexStats());
}