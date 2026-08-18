"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMode = exports.PageStatus = exports.OperationMode = exports.ModelProvider = exports.ModelOptions = void 0;
var ModelOptions;
(function (ModelOptions) {
    // Bedrock Claude 3 Models
    ModelOptions["BEDROCK_CLAUDE_3_HAIKU_2024_10"] = "anthropic.claude-3-5-haiku-20241022-v1:0";
    ModelOptions["BEDROCK_CLAUDE_3_SONNET_2024_06"] = "anthropic.claude-3-5-sonnet-20240620-v1:0";
    ModelOptions["BEDROCK_CLAUDE_3_SONNET_2024_10"] = "anthropic.claude-3-5-sonnet-20241022-v2:0";
    ModelOptions["BEDROCK_CLAUDE_3_HAIKU_2024_03"] = "anthropic.claude-3-haiku-20240307-v1:0";
    ModelOptions["BEDROCK_CLAUDE_3_OPUS_2024_02"] = "anthropic.claude-3-opus-20240229-v1:0";
    ModelOptions["BEDROCK_CLAUDE_3_SONNET_2024_02"] = "anthropic.claude-3-sonnet-20240229-v1:0";
    // OpenAI GPT-4 Models
    ModelOptions["OPENAI_GPT_4_1"] = "gpt-4.1";
    ModelOptions["OPENAI_GPT_4_1_MINI"] = "gpt-4.1-mini";
    ModelOptions["OPENAI_GPT_4O"] = "gpt-4o";
    ModelOptions["OPENAI_GPT_4O_MINI"] = "gpt-4o-mini";
    // Google Gemini Models
    ModelOptions["GOOGLE_GEMINI_1_5_FLASH"] = "gemini-1.5-flash";
    ModelOptions["GOOGLE_GEMINI_1_5_FLASH_8B"] = "gemini-1.5-flash-8b";
    ModelOptions["GOOGLE_GEMINI_1_5_PRO"] = "gemini-1.5-pro";
    ModelOptions["GOOGLE_GEMINI_2_5_PRO"] = "gemini-2.5-pro-preview-03-25";
    ModelOptions["GOOGLE_GEMINI_2_FLASH"] = "gemini-2.0-flash-001";
    ModelOptions["GOOGLE_GEMINI_2_FLASH_LITE"] = "gemini-2.0-flash-lite-preview-02-05";
})(ModelOptions || (exports.ModelOptions = ModelOptions = {}));
var ModelProvider;
(function (ModelProvider) {
    ModelProvider["AZURE"] = "AZURE";
    ModelProvider["BEDROCK"] = "BEDROCK";
    ModelProvider["GOOGLE"] = "GOOGLE";
    ModelProvider["OPENAI"] = "OPENAI";
})(ModelProvider || (exports.ModelProvider = ModelProvider = {}));
var OperationMode;
(function (OperationMode) {
    OperationMode["EXTRACTION"] = "EXTRACTION";
    OperationMode["OCR"] = "OCR";
})(OperationMode || (exports.OperationMode = OperationMode = {}));
var PageStatus;
(function (PageStatus) {
    PageStatus["SUCCESS"] = "SUCCESS";
    PageStatus["ERROR"] = "ERROR";
})(PageStatus || (exports.PageStatus = PageStatus = {}));
var ErrorMode;
(function (ErrorMode) {
    ErrorMode["THROW"] = "THROW";
    ErrorMode["IGNORE"] = "IGNORE";
})(ErrorMode || (exports.ErrorMode = ErrorMode = {}));
