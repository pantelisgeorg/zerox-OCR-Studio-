"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../types");
var openai_1 = require("openai");
var utils_1 = require("../utils");
var constants_1 = require("../constants");
var fs_extra_1 = __importDefault(require("fs-extra"));
var AzureModel = /** @class */ (function () {
    function AzureModel(credentials, model, llmParams) {
        this.client = new openai_1.AzureOpenAI({
            apiKey: credentials.apiKey,
            apiVersion: "2024-10-21",
            deployment: model,
            endpoint: credentials.endpoint,
        });
        this.llmParams = llmParams;
    }
    AzureModel.prototype.getCompletion = function (mode, params) {
        return __awaiter(this, void 0, void 0, function () {
            var modeHandlers, handler;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        modeHandlers = (_a = {},
                            _a[types_1.OperationMode.EXTRACTION] = function () {
                                return _this.handleExtraction(params);
                            },
                            _a[types_1.OperationMode.OCR] = function () { return _this.handleOCR(params); },
                            _a);
                        handler = modeHandlers[mode];
                        if (!handler) {
                            throw new Error("Unsupported operation mode: ".concat(mode));
                        }
                        return [4 /*yield*/, handler()];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    AzureModel.prototype.createMessageContent = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var processImages, imagePaths, text, images;
            var _this = this;
            var input = _b.input, options = _b.options;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        processImages = function (imagePaths) { return __awaiter(_this, void 0, void 0, function () {
                            var nestedImages;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Promise.all(imagePaths.map(function (imagePath) { return __awaiter(_this, void 0, void 0, function () {
                                            var imageBuffer, buffers;
                                            var _a, _b, _c;
                                            return __generator(this, function (_d) {
                                                switch (_d.label) {
                                                    case 0: return [4 /*yield*/, fs_extra_1.default.readFile(imagePath)];
                                                    case 1:
                                                        imageBuffer = _d.sent();
                                                        return [4 /*yield*/, (0, utils_1.cleanupImage)({
                                                                correctOrientation: (_a = options === null || options === void 0 ? void 0 : options.correctOrientation) !== null && _a !== void 0 ? _a : false,
                                                                imageBuffer: imageBuffer,
                                                                scheduler: (_b = options === null || options === void 0 ? void 0 : options.scheduler) !== null && _b !== void 0 ? _b : null,
                                                                trimEdges: (_c = options === null || options === void 0 ? void 0 : options.trimEdges) !== null && _c !== void 0 ? _c : false,
                                                            })];
                                                    case 2:
                                                        buffers = _d.sent();
                                                        return [2 /*return*/, buffers.map(function (buffer) { return ({
                                                                image_url: {
                                                                    url: "data:image/png;base64,".concat((0, utils_1.encodeImageToBase64)(buffer)),
                                                                },
                                                                type: "image_url",
                                                            }); })];
                                                }
                                            });
                                        }); }))];
                                    case 1:
                                        nestedImages = _a.sent();
                                        return [2 /*return*/, nestedImages.flat()];
                                }
                            });
                        }); };
                        if (Array.isArray(input)) {
                            return [2 /*return*/, processImages(input)];
                        }
                        if (typeof input === "string") {
                            return [2 /*return*/, [{ text: input, type: "text" }]];
                        }
                        imagePaths = input.imagePaths, text = input.text;
                        return [4 /*yield*/, processImages(imagePaths)];
                    case 1:
                        images = _c.sent();
                        return [2 /*return*/, __spreadArray(__spreadArray([], images, true), [{ text: text, type: "text" }], false)];
                }
            });
        });
    };
    AzureModel.prototype.handleOCR = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var systemPrompt, messages, imageContents, response, result, err_1;
            var _c, _d, _e, _f, _g;
            var buffers = _b.buffers, maintainFormat = _b.maintainFormat, priorPage = _b.priorPage, prompt = _b.prompt;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        systemPrompt = prompt || constants_1.SYSTEM_PROMPT_BASE;
                        messages = [{ role: "system", content: systemPrompt }];
                        // If content has already been generated, add it to context.
                        // This helps maintain the same format across pages
                        if (maintainFormat && priorPage && priorPage.length) {
                            messages.push({
                                role: "system",
                                content: (0, constants_1.CONSISTENCY_PROMPT)(priorPage),
                            });
                        }
                        imageContents = buffers.map(function (buffer) { return ({
                            type: "image_url",
                            image_url: {
                                url: "data:image/png;base64,".concat((0, utils_1.encodeImageToBase64)(buffer)),
                            },
                        }); });
                        messages.push({ role: "user", content: imageContents });
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.chat.completions.create(__assign({ messages: messages, model: "" }, (0, utils_1.convertKeysToSnakeCase)((_c = this.llmParams) !== null && _c !== void 0 ? _c : null)))];
                    case 2:
                        response = _h.sent();
                        result = {
                            content: response.choices[0].message.content || "",
                            inputTokens: ((_d = response.usage) === null || _d === void 0 ? void 0 : _d.prompt_tokens) || 0,
                            outputTokens: ((_e = response.usage) === null || _e === void 0 ? void 0 : _e.completion_tokens) || 0,
                        };
                        if ((_f = this.llmParams) === null || _f === void 0 ? void 0 : _f.logprobs) {
                            result["logprobs"] = (_g = (0, utils_1.convertKeysToCamelCase)(response.choices[0].logprobs)) === null || _g === void 0 ? void 0 : _g.content;
                        }
                        return [2 /*return*/, result];
                    case 3:
                        err_1 = _h.sent();
                        console.error("Error in Azure completion", err_1);
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AzureModel.prototype.handleExtraction = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var messages, _c, _d, response, result, err_2;
            var _e;
            var _f, _g, _h, _j, _k;
            var input = _b.input, options = _b.options, prompt = _b.prompt, schema = _b.schema;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        _l.trys.push([0, 3, , 4]);
                        messages = [];
                        if (prompt) {
                            messages.push({ role: "system", content: prompt });
                        }
                        _d = (_c = messages).push;
                        _e = {
                            role: "user"
                        };
                        return [4 /*yield*/, this.createMessageContent({ input: input, options: options })];
                    case 1:
                        _d.apply(_c, [(_e.content = _l.sent(),
                                _e)]);
                        return [4 /*yield*/, this.client.chat.completions.create(__assign({ messages: messages, model: "", response_format: {
                                    json_schema: { name: "extraction", schema: schema },
                                    type: "json_schema",
                                } }, (0, utils_1.convertKeysToSnakeCase)((_f = this.llmParams) !== null && _f !== void 0 ? _f : null)))];
                    case 2:
                        response = _l.sent();
                        result = {
                            extracted: JSON.parse(response.choices[0].message.content || ""),
                            inputTokens: ((_g = response.usage) === null || _g === void 0 ? void 0 : _g.prompt_tokens) || 0,
                            outputTokens: ((_h = response.usage) === null || _h === void 0 ? void 0 : _h.completion_tokens) || 0,
                        };
                        if ((_j = this.llmParams) === null || _j === void 0 ? void 0 : _j.logprobs) {
                            result["logprobs"] = (_k = (0, utils_1.convertKeysToCamelCase)(response.choices[0].logprobs)) === null || _k === void 0 ? void 0 : _k.content;
                        }
                        return [2 /*return*/, result];
                    case 3:
                        err_2 = _l.sent();
                        console.error("Error in Azure completion", err_2);
                        throw err_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AzureModel;
}());
exports.default = AzureModel;
