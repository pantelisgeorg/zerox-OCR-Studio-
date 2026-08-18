"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModel = void 0;
var types_1 = require("../types");
var model_1 = require("../utils/model");
var azure_1 = __importDefault(require("./azure"));
var bedrock_1 = __importDefault(require("./bedrock"));
var google_1 = __importDefault(require("./google"));
var openAI_1 = __importDefault(require("./openAI"));
// Type guard for Azure credentials
var isAzureCredentials = function (credentials) {
    return (credentials &&
        typeof credentials.endpoint === "string" &&
        typeof credentials.apiKey === "string");
};
// Type guard for Bedrock credentials
var isBedrockCredentials = function (credentials) {
    return credentials && typeof credentials.region === "string";
};
// Type guard for Google credentials
var isGoogleCredentials = function (credentials) {
    return credentials && typeof credentials.apiKey === "string";
};
// Type guard for OpenAI credentials
var isOpenAICredentials = function (credentials) {
    return credentials && typeof credentials.apiKey === "string";
};
var createModel = function (_a) {
    var credentials = _a.credentials, llmParams = _a.llmParams, model = _a.model, provider = _a.provider;
    var validatedParams = (0, model_1.validateLLMParams)(llmParams, provider);
    switch (provider) {
        case types_1.ModelProvider.AZURE:
            if (!isAzureCredentials(credentials)) {
                throw new Error("Invalid credentials for Azure provider");
            }
            return new azure_1.default(credentials, model, validatedParams);
        case types_1.ModelProvider.BEDROCK:
            if (!isBedrockCredentials(credentials)) {
                throw new Error("Invalid credentials for Bedrock provider");
            }
            return new bedrock_1.default(credentials, model, validatedParams);
        case types_1.ModelProvider.GOOGLE:
            if (!isGoogleCredentials(credentials)) {
                throw new Error("Invalid credentials for Google provider");
            }
            return new google_1.default(credentials, model, validatedParams);
        case types_1.ModelProvider.OPENAI:
            if (!isOpenAICredentials(credentials)) {
                throw new Error("Invalid credentials for OpenAI provider");
            }
            return new openAI_1.default(credentials, model, validatedParams);
        default:
            throw new Error("Unsupported model provider: ".concat(provider));
    }
};
exports.createModel = createModel;
