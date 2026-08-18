import { AzureCredentials, AzureLLMParams, CompletionArgs, CompletionResponse, ExtractionArgs, ExtractionResponse, ModelInterface, OperationMode } from "../types";
export default class AzureModel implements ModelInterface {
    private client;
    private llmParams?;
    constructor(credentials: AzureCredentials, model: string, llmParams?: Partial<AzureLLMParams>);
    getCompletion(mode: OperationMode, params: CompletionArgs | ExtractionArgs): Promise<CompletionResponse | ExtractionResponse>;
    private createMessageContent;
    private handleOCR;
    private handleExtraction;
}
