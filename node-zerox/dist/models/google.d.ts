import { CompletionArgs, CompletionResponse, ExtractionArgs, ExtractionResponse, GoogleCredentials, GoogleLLMParams, ModelInterface, OperationMode } from "../types";
export default class GoogleModel implements ModelInterface {
    private client;
    private model;
    private llmParams?;
    constructor(credentials: GoogleCredentials, model: string, llmParams?: Partial<GoogleLLMParams>);
    getCompletion(mode: OperationMode, params: CompletionArgs | ExtractionArgs): Promise<CompletionResponse | ExtractionResponse>;
    private createMessageContent;
    private handleOCR;
    private handleExtraction;
}
