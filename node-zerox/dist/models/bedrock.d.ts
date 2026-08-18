import { BedrockCredentials, BedrockLLMParams, CompletionArgs, CompletionResponse, ExtractionArgs, ExtractionResponse, ModelInterface, OperationMode } from "../types";
export default class BedrockModel implements ModelInterface {
    private client;
    private model;
    private llmParams?;
    constructor(credentials: BedrockCredentials, model: string, llmParams?: Partial<BedrockLLMParams>);
    getCompletion(mode: OperationMode, params: CompletionArgs | ExtractionArgs): Promise<CompletionResponse | ExtractionResponse>;
    private createMessageContent;
    private handleOCR;
    private handleExtraction;
}
