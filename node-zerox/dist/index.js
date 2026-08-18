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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zerox = void 0;
var fs_extra_1 = __importDefault(require("fs-extra"));
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
var p_limit_1 = __importDefault(require("p-limit"));
require("./handleWarnings");
var utils_1 = require("./utils");
var models_1 = require("./models");
var types_1 = require("./types");
var constants_1 = require("./constants");
var zerox = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var extracted, extractedLogprobs, inputTokenCount, outputTokenCount, numSuccessfulOCRRequests, numFailedOCRRequests, ocrLogprobs, priorPage, pages, imagePaths, startTime, scheduler, workerCount, rand, tempDirectory, sourceDirectory_1, _c, extension, localPath, imagePath, pdfPath, isCFBFile, isPdf, totalPages_1, compressPromises, modelInstance_1, processOCR_1, i, page, limit_1, numSuccessfulExtractionRequests_1, numFailedExtractionRequests_1, extractionModelInstance_1, _d, fullDocSchema_1, perPageSchema_1, extractionTasks, processExtraction_1, inputs, input_1, results, endOfPath, rawFileName, fileName, resultFilePath, content, endTime, completionTime;
    var _e = _b.cleanup, cleanup = _e === void 0 ? true : _e, _f = _b.concurrency, concurrency = _f === void 0 ? 10 : _f, _g = _b.correctOrientation, correctOrientation = _g === void 0 ? true : _g, _h = _b.credentials, credentials = _h === void 0 ? { apiKey: "" } : _h, customModelFunction = _b.customModelFunction, _j = _b.directImageExtraction, directImageExtraction = _j === void 0 ? false : _j, _k = _b.enableHybridExtraction, enableHybridExtraction = _k === void 0 ? false : _k, _l = _b.errorMode, errorMode = _l === void 0 ? types_1.ErrorMode.IGNORE : _l, extractionCredentials = _b.extractionCredentials, extractionLlmParams = _b.extractionLlmParams, extractionModel = _b.extractionModel, extractionModelProvider = _b.extractionModelProvider, extractionPrompt = _b.extractionPrompt, _m = _b.extractOnly, extractOnly = _m === void 0 ? false : _m, extractPerPage = _b.extractPerPage, filePath = _b.filePath, imageDensity = _b.imageDensity, _o = _b.imageFormat, imageFormat = _o === void 0 ? "png" : _o, imageHeight = _b.imageHeight, _p = _b.llmParams, llmParams = _p === void 0 ? {} : _p, _q = _b.maintainFormat, maintainFormat = _q === void 0 ? false : _q, _r = _b.maxImageSize, maxImageSize = _r === void 0 ? 15 : _r, _s = _b.maxRetries, maxRetries = _s === void 0 ? 1 : _s, _t = _b.maxTesseractWorkers, maxTesseractWorkers = _t === void 0 ? -1 : _t, _u = _b.model, model = _u === void 0 ? types_1.ModelOptions.OPENAI_GPT_4O : _u, _v = _b.modelProvider, modelProvider = _v === void 0 ? types_1.ModelProvider.OPENAI : _v, _w = _b.openaiAPIKey, openaiAPIKey = _w === void 0 ? "" : _w, outputDir = _b.outputDir, _x = _b.pagesToConvertAsImages, pagesToConvertAsImages = _x === void 0 ? -1 : _x, prompt = _b.prompt, schema = _b.schema, _y = _b.tempDir, tempDir = _y === void 0 ? os_1.default.tmpdir() : _y, _z = _b.trimEdges, trimEdges = _z === void 0 ? true : _z;
    return __generator(this, function (_0) {
        switch (_0.label) {
            case 0:
                extracted = null;
                extractedLogprobs = [];
                inputTokenCount = 0;
                outputTokenCount = 0;
                numSuccessfulOCRRequests = 0;
                numFailedOCRRequests = 0;
                ocrLogprobs = [];
                priorPage = "";
                pages = [];
                imagePaths = [];
                startTime = new Date();
                if (openaiAPIKey && openaiAPIKey.length > 0) {
                    modelProvider = types_1.ModelProvider.OPENAI;
                    credentials = { apiKey: openaiAPIKey };
                }
                extractionCredentials = extractionCredentials !== null && extractionCredentials !== void 0 ? extractionCredentials : credentials;
                extractionLlmParams = extractionLlmParams !== null && extractionLlmParams !== void 0 ? extractionLlmParams : llmParams;
                extractionModel = extractionModel !== null && extractionModel !== void 0 ? extractionModel : model;
                extractionModelProvider = extractionModelProvider !== null && extractionModelProvider !== void 0 ? extractionModelProvider : modelProvider;
                // Validators
                if (Object.values(credentials).every(function (credential) { return !credential; })) {
                    throw new Error("Missing credentials");
                }
                if (!filePath || !filePath.length) {
                    throw new Error("Missing file path");
                }
                if (enableHybridExtraction && (directImageExtraction || extractOnly)) {
                    throw new Error("Hybrid extraction cannot be used in direct image extraction or extract-only mode");
                }
                if (enableHybridExtraction && !schema) {
                    throw new Error("Schema is required when hybrid extraction is enabled");
                }
                if (extractOnly && !schema) {
                    throw new Error("Schema is required for extraction mode");
                }
                if (extractOnly && maintainFormat) {
                    throw new Error("Maintain format is only supported in OCR mode");
                }
                if (extractOnly)
                    directImageExtraction = true;
                scheduler = null;
                if (!correctOrientation) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, utils_1.getTesseractScheduler)()];
            case 1:
                scheduler = _0.sent();
                workerCount = maxTesseractWorkers !== -1 && maxTesseractWorkers < constants_1.NUM_STARTING_WORKERS
                    ? maxTesseractWorkers
                    : constants_1.NUM_STARTING_WORKERS;
                return [4 /*yield*/, (0, utils_1.addWorkersToTesseractScheduler)({
                        numWorkers: workerCount,
                        scheduler: scheduler,
                    })];
            case 2:
                _0.sent();
                _0.label = 3;
            case 3:
                _0.trys.push([3, , 37, 38]);
                rand = Math.floor(1000 + Math.random() * 9000).toString();
                tempDirectory = path_1.default.join(tempDir || os_1.default.tmpdir(), "zerox-temp-".concat(rand));
                sourceDirectory_1 = path_1.default.join(tempDirectory, "source");
                return [4 /*yield*/, fs_extra_1.default.ensureDir(sourceDirectory_1)];
            case 4:
                _0.sent();
                return [4 /*yield*/, (0, utils_1.downloadFile)({
                        filePath: filePath,
                        tempDir: sourceDirectory_1,
                    })];
            case 5:
                _c = _0.sent(), extension = _c.extension, localPath = _c.localPath;
                if (!localPath)
                    throw "Failed to save file to local drive";
                // Sort the `pagesToConvertAsImages` array to make sure we use the right index
                // for `formattedPages` as `pdf2pic` always returns images in order
                if (Array.isArray(pagesToConvertAsImages)) {
                    pagesToConvertAsImages.sort(function (a, b) { return a - b; });
                }
                if (!(0, utils_1.isStructuredDataFile)(localPath)) return [3 /*break*/, 7];
                return [4 /*yield*/, (0, utils_1.extractPagesFromStructuredDataFile)(localPath)];
            case 6:
                pages = _0.sent();
                return [3 /*break*/, 30];
            case 7:
                if (!(extension === ".png" ||
                    extension === ".jpg" ||
                    extension === ".jpeg")) return [3 /*break*/, 8];
                imagePaths = [localPath];
                return [3 /*break*/, 19];
            case 8:
                if (!(extension === ".heic")) return [3 /*break*/, 10];
                return [4 /*yield*/, (0, utils_1.convertHeicToJpeg)({
                        localPath: localPath,
                        tempDir: sourceDirectory_1,
                    })];
            case 9:
                imagePath = _0.sent();
                imagePaths = [imagePath];
                return [3 /*break*/, 19];
            case 10:
                pdfPath = void 0;
                return [4 /*yield*/, (0, utils_1.checkIsCFBFile)(localPath)];
            case 11:
                isCFBFile = _0.sent();
                return [4 /*yield*/, (0, utils_1.checkIsPdfFile)(localPath)];
            case 12:
                isPdf = _0.sent();
                if (!((extension === ".pdf" || isPdf) && !isCFBFile)) return [3 /*break*/, 13];
                pdfPath = localPath;
                return [3 /*break*/, 15];
            case 13: return [4 /*yield*/, (0, utils_1.convertFileToPdf)({
                    extension: extension,
                    localPath: localPath,
                    tempDir: sourceDirectory_1,
                })];
            case 14:
                // Convert file to PDF if necessary
                pdfPath = _0.sent();
                _0.label = 15;
            case 15:
                if (!(pagesToConvertAsImages !== -1)) return [3 /*break*/, 17];
                return [4 /*yield*/, (0, utils_1.getNumberOfPagesFromPdf)({ pdfPath: pdfPath })];
            case 16:
                totalPages_1 = _0.sent();
                pagesToConvertAsImages = Array.isArray(pagesToConvertAsImages)
                    ? pagesToConvertAsImages
                    : [pagesToConvertAsImages];
                pagesToConvertAsImages = pagesToConvertAsImages.filter(function (page) { return page > 0 && page <= totalPages_1; });
                _0.label = 17;
            case 17: return [4 /*yield*/, (0, utils_1.convertPdfToImages)({
                    imageDensity: imageDensity,
                    imageFormat: imageFormat,
                    imageHeight: imageHeight,
                    pagesToConvertAsImages: pagesToConvertAsImages,
                    pdfPath: pdfPath,
                    tempDir: sourceDirectory_1,
                })];
            case 18:
                imagePaths = _0.sent();
                _0.label = 19;
            case 19:
                if (!(maxImageSize && maxImageSize > 0)) return [3 /*break*/, 21];
                compressPromises = imagePaths.map(function (imagePath) { return __awaiter(void 0, void 0, void 0, function () {
                    var imageBuffer, compressedBuffer, originalName, compressedPath;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fs_extra_1.default.readFile(imagePath)];
                            case 1:
                                imageBuffer = _a.sent();
                                return [4 /*yield*/, (0, utils_1.compressImage)(imageBuffer, maxImageSize)];
                            case 2:
                                compressedBuffer = _a.sent();
                                originalName = path_1.default.basename(imagePath, path_1.default.extname(imagePath));
                                compressedPath = path_1.default.join(sourceDirectory_1, "".concat(originalName, "_compressed.png"));
                                return [4 /*yield*/, fs_extra_1.default.writeFile(compressedPath, compressedBuffer)];
                            case 3:
                                _a.sent();
                                return [2 /*return*/, compressedPath];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(compressPromises)];
            case 20:
                imagePaths = _0.sent();
                _0.label = 21;
            case 21:
                if (!correctOrientation) return [3 /*break*/, 23];
                return [4 /*yield*/, (0, utils_1.prepareWorkersForImageProcessing)({
                        maxTesseractWorkers: maxTesseractWorkers,
                        numImages: imagePaths.length,
                        scheduler: scheduler,
                    })];
            case 22:
                _0.sent();
                _0.label = 23;
            case 23:
                modelInstance_1 = (0, models_1.createModel)({
                    credentials: credentials,
                    llmParams: llmParams,
                    model: model,
                    provider: modelProvider,
                });
                if (!!extractOnly) return [3 /*break*/, 30];
                processOCR_1 = function (imagePath, pageIndex, maintainFormat) { return __awaiter(void 0, void 0, void 0, function () {
                    var pageNumber, imageBuffer, buffers, page, rawResponse, response, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                // If we convert all pages, just use the array index
                                if (pagesToConvertAsImages === -1) {
                                    pageNumber = pageIndex + 1;
                                }
                                // Else if we convert specific pages, use the page number from the parameter
                                else if (Array.isArray(pagesToConvertAsImages)) {
                                    pageNumber = pagesToConvertAsImages[pageIndex];
                                }
                                // Else, the parameter is a number and use it for the page number
                                else {
                                    pageNumber = pagesToConvertAsImages;
                                }
                                return [4 /*yield*/, fs_extra_1.default.readFile(imagePath)];
                            case 1:
                                imageBuffer = _a.sent();
                                return [4 /*yield*/, (0, utils_1.cleanupImage)({
                                        correctOrientation: correctOrientation,
                                        imageBuffer: imageBuffer,
                                        scheduler: scheduler,
                                        trimEdges: trimEdges,
                                    })];
                            case 2:
                                buffers = _a.sent();
                                _a.label = 3;
                            case 3:
                                _a.trys.push([3, 8, , 9]);
                                rawResponse = void 0;
                                if (!customModelFunction) return [3 /*break*/, 5];
                                return [4 /*yield*/, (0, utils_1.runRetries)(function () {
                                        return customModelFunction({
                                            buffers: buffers,
                                            image: imagePath,
                                            maintainFormat: maintainFormat,
                                            pageNumber: pageNumber,
                                            priorPage: priorPage,
                                        });
                                    }, maxRetries, pageNumber)];
                            case 4:
                                rawResponse = _a.sent();
                                return [3 /*break*/, 7];
                            case 5: return [4 /*yield*/, (0, utils_1.runRetries)(function () {
                                    return modelInstance_1.getCompletion(types_1.OperationMode.OCR, {
                                        buffers: buffers,
                                        maintainFormat: maintainFormat,
                                        priorPage: priorPage,
                                        prompt: prompt,
                                    });
                                }, maxRetries, pageNumber)];
                            case 6:
                                rawResponse = _a.sent();
                                _a.label = 7;
                            case 7:
                                if (rawResponse.logprobs) {
                                    ocrLogprobs.push({
                                        page: pageNumber,
                                        value: rawResponse.logprobs,
                                    });
                                }
                                response = utils_1.CompletionProcessor.process(types_1.OperationMode.OCR, rawResponse);
                                inputTokenCount += response.inputTokens;
                                outputTokenCount += response.outputTokens;
                                if ((0, utils_1.isCompletionResponse)(types_1.OperationMode.OCR, response)) {
                                    priorPage = response.content;
                                }
                                page = __assign(__assign({}, response), { page: pageNumber, status: types_1.PageStatus.SUCCESS });
                                numSuccessfulOCRRequests++;
                                return [3 /*break*/, 9];
                            case 8:
                                error_1 = _a.sent();
                                console.error("Failed to process image ".concat(imagePath, ":"), error_1);
                                if (errorMode === types_1.ErrorMode.THROW) {
                                    throw error_1;
                                }
                                page = {
                                    content: "",
                                    contentLength: 0,
                                    error: "Failed to process page ".concat(pageNumber, ": ").concat(error_1),
                                    page: pageNumber,
                                    status: types_1.PageStatus.ERROR,
                                };
                                numFailedOCRRequests++;
                                return [3 /*break*/, 9];
                            case 9: return [2 /*return*/, page];
                        }
                    });
                }); };
                if (!maintainFormat) return [3 /*break*/, 28];
                i = 0;
                _0.label = 24;
            case 24:
                if (!(i < imagePaths.length)) return [3 /*break*/, 27];
                return [4 /*yield*/, processOCR_1(imagePaths[i], i, true)];
            case 25:
                page = _0.sent();
                pages.push(page);
                if (page.status === types_1.PageStatus.ERROR) {
                    return [3 /*break*/, 27];
                }
                _0.label = 26;
            case 26:
                i++;
                return [3 /*break*/, 24];
            case 27: return [3 /*break*/, 30];
            case 28:
                limit_1 = (0, p_limit_1.default)(concurrency);
                return [4 /*yield*/, Promise.all(imagePaths.map(function (imagePath, i) {
                        return limit_1(function () {
                            return processOCR_1(imagePath, i, false).then(function (page) {
                                pages[i] = page;
                            });
                        });
                    }))];
            case 29:
                _0.sent();
                _0.label = 30;
            case 30:
                numSuccessfulExtractionRequests_1 = 0;
                numFailedExtractionRequests_1 = 0;
                if (!schema) return [3 /*break*/, 32];
                extractionModelInstance_1 = (0, models_1.createModel)({
                    credentials: extractionCredentials,
                    llmParams: extractionLlmParams,
                    model: extractionModel,
                    provider: extractionModelProvider,
                });
                _d = (0, utils_1.splitSchema)(schema, extractPerPage), fullDocSchema_1 = _d.fullDocSchema, perPageSchema_1 = _d.perPageSchema;
                extractionTasks = [];
                processExtraction_1 = function (input, pageNumber, schema) { return __awaiter(void 0, void 0, void 0, function () {
                    var result, error_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                result = {};
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, (0, utils_1.runRetries)(function () { return __awaiter(void 0, void 0, void 0, function () {
                                        var rawResponse, response, _i, _a, key, value;
                                        var _b;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0: return [4 /*yield*/, extractionModelInstance_1.getCompletion(types_1.OperationMode.EXTRACTION, {
                                                        input: input,
                                                        options: { correctOrientation: correctOrientation, scheduler: scheduler, trimEdges: trimEdges },
                                                        prompt: extractionPrompt,
                                                        schema: schema,
                                                    })];
                                                case 1:
                                                    rawResponse = _c.sent();
                                                    if (rawResponse.logprobs) {
                                                        extractedLogprobs.push({
                                                            page: pageNumber,
                                                            value: rawResponse.logprobs,
                                                        });
                                                    }
                                                    response = utils_1.CompletionProcessor.process(types_1.OperationMode.EXTRACTION, rawResponse);
                                                    inputTokenCount += response.inputTokens;
                                                    outputTokenCount += response.outputTokens;
                                                    numSuccessfulExtractionRequests_1++;
                                                    for (_i = 0, _a = Object.keys((_b = schema === null || schema === void 0 ? void 0 : schema.properties) !== null && _b !== void 0 ? _b : {}); _i < _a.length; _i++) {
                                                        key = _a[_i];
                                                        value = response.extracted[key];
                                                        if (value !== null && value !== undefined) {
                                                            if (!Array.isArray(result[key])) {
                                                                result[key] = [];
                                                            }
                                                            result[key].push({ page: pageNumber, value: value });
                                                        }
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }, maxRetries, pageNumber)];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                error_2 = _a.sent();
                                numFailedExtractionRequests_1++;
                                throw error_2;
                            case 4: return [2 /*return*/, result];
                        }
                    });
                }); };
                if (perPageSchema_1) {
                    inputs = directImageExtraction && !(0, utils_1.isStructuredDataFile)(localPath)
                        ? imagePaths.map(function (imagePath) { return [imagePath]; })
                        : enableHybridExtraction
                            ? imagePaths.map(function (imagePath, index) { return ({
                                imagePaths: [imagePath],
                                text: pages[index].content || "",
                            }); })
                            : pages.map(function (page) { return page.content || ""; });
                    extractionTasks.push.apply(extractionTasks, inputs.map(function (input, i) {
                        return processExtraction_1(input, i + 1, perPageSchema_1);
                    }));
                }
                if (fullDocSchema_1) {
                    input_1 = directImageExtraction && !(0, utils_1.isStructuredDataFile)(localPath)
                        ? imagePaths
                        : enableHybridExtraction
                            ? {
                                imagePaths: imagePaths,
                                text: pages
                                    .map(function (page, i) {
                                    return i === 0 ? page.content : "\n<hr><hr>\n" + page.content;
                                })
                                    .join(""),
                            }
                            : pages
                                .map(function (page, i) {
                                return i === 0 ? page.content : "\n<hr><hr>\n" + page.content;
                            })
                                .join("");
                    extractionTasks.push((function () { return __awaiter(void 0, void 0, void 0, function () {
                        var result, error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    result = {};
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, (0, utils_1.runRetries)(function () { return __awaiter(void 0, void 0, void 0, function () {
                                            var rawResponse, response;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, extractionModelInstance_1.getCompletion(types_1.OperationMode.EXTRACTION, {
                                                            input: input_1,
                                                            options: { correctOrientation: correctOrientation, scheduler: scheduler, trimEdges: trimEdges },
                                                            prompt: extractionPrompt,
                                                            schema: fullDocSchema_1,
                                                        })];
                                                    case 1:
                                                        rawResponse = _a.sent();
                                                        if (rawResponse.logprobs) {
                                                            extractedLogprobs.push({
                                                                page: null,
                                                                value: rawResponse.logprobs,
                                                            });
                                                        }
                                                        response = utils_1.CompletionProcessor.process(types_1.OperationMode.EXTRACTION, rawResponse);
                                                        inputTokenCount += response.inputTokens;
                                                        outputTokenCount += response.outputTokens;
                                                        numSuccessfulExtractionRequests_1++;
                                                        result = response.extracted;
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); }, maxRetries, 0)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, result];
                                case 3:
                                    error_3 = _a.sent();
                                    numFailedExtractionRequests_1++;
                                    throw error_3;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })());
                }
                return [4 /*yield*/, Promise.all(extractionTasks)];
            case 31:
                results = _0.sent();
                extracted = results.reduce(function (acc, result) {
                    Object.entries(result || {}).forEach(function (_a) {
                        var _b;
                        var key = _a[0], value = _a[1];
                        if (!acc[key]) {
                            acc[key] = [];
                        }
                        if (Array.isArray(value)) {
                            (_b = acc[key]).push.apply(_b, value);
                        }
                        else {
                            acc[key] = value;
                        }
                    });
                    return acc;
                }, {});
                _0.label = 32;
            case 32:
                endOfPath = localPath.split("/")[localPath.split("/").length - 1];
                rawFileName = endOfPath.split(".")[0];
                fileName = rawFileName
                    .replace(/[^\w\s]/g, "")
                    .replace(/\s+/g, "_")
                    .toLowerCase()
                    .substring(0, 255);
                if (!outputDir) return [3 /*break*/, 34];
                resultFilePath = path_1.default.join(outputDir, "".concat(fileName, ".md"));
                content = pages.map(function (page) { return page.content; }).join("\n\n");
                return [4 /*yield*/, fs_extra_1.default.writeFile(resultFilePath, content)];
            case 33:
                _0.sent();
                _0.label = 34;
            case 34:
                if (!cleanup) return [3 /*break*/, 36];
                return [4 /*yield*/, fs_extra_1.default.remove(tempDirectory)];
            case 35:
                _0.sent();
                _0.label = 36;
            case 36:
                endTime = new Date();
                completionTime = endTime.getTime() - startTime.getTime();
                return [2 /*return*/, __assign(__assign({ completionTime: completionTime, extracted: extracted, fileName: fileName, inputTokens: inputTokenCount }, (ocrLogprobs.length || extractedLogprobs.length
                        ? {
                            logprobs: {
                                ocr: !extractOnly ? ocrLogprobs : null,
                                extracted: schema ? extractedLogprobs : null,
                            },
                        }
                        : {})), { outputTokens: outputTokenCount, pages: pages, summary: {
                            totalPages: pages.length,
                            ocr: !extractOnly
                                ? {
                                    successful: numSuccessfulOCRRequests,
                                    failed: numFailedOCRRequests,
                                }
                                : null,
                            extracted: schema
                                ? {
                                    successful: numSuccessfulExtractionRequests_1,
                                    failed: numFailedExtractionRequests_1,
                                }
                                : null,
                        } })];
            case 37:
                if (correctOrientation && scheduler) {
                    (0, utils_1.terminateScheduler)(scheduler);
                }
                return [7 /*endfinally*/];
            case 38: return [2 /*return*/];
        }
    });
}); };
exports.zerox = zerox;
