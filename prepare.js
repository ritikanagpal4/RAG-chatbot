import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function indexTheDocument(filePath) {
    const loader = new PDFLoader(filePath, {splitPages: false});
    const document = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });

    const docs = await textSplitter.splitText(document[0].pageContent);
    console.log(docs);
}