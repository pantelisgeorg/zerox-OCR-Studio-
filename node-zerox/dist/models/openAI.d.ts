import { CompletionArgs, CompletionResponse, ExtractionArgs, ExtractionResponse, ModelInterface, OpenAICredentials, OpenAILLMParams, OperationMode } from "../types";
export default class OpenAIModel implements ModelInterface {
    private apiKey;
    private model;
    private llmParams?;
    constructor(credentials: OpenAICredentials, model: string, llmParams?: Partial<OpenAILLMParams>);
    getCompletion(mode: OperationMode, params: CompletionArgs | ExtractionArgs): Promise<CompletionResponse | ExtractionResponse>;
    private createMessageContent;
    private handleOCR;
    private handleExtraction;
}
