import { CompletionResponse, ExtractionResponse, LLMParams, ModelProvider, OperationMode, ProcessedCompletionResponse, ProcessedExtractionResponse } from "../types";
export declare const isCompletionResponse: (mode: OperationMode, response: CompletionResponse | ExtractionResponse) => response is CompletionResponse;
export declare class CompletionProcessor {
    static process<T extends OperationMode>(mode: T, response: CompletionResponse | ExtractionResponse): T extends OperationMode.EXTRACTION ? ProcessedExtractionResponse : ProcessedCompletionResponse;
}
export declare const validateLLMParams: <T extends LLMParams>(params: Partial<T>, provider: ModelProvider | string) => LLMParams;
