"use strict";
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
exports.splitTallImage = exports.compressImage = exports.cleanupImage = exports.encodeImageToBase64 = void 0;
var sharp_1 = __importDefault(require("sharp"));
var constants_1 = require("../constants");
var encodeImageToBase64 = function (imageBuffer) {
    return imageBuffer.toString("base64");
};
exports.encodeImageToBase64 = encodeImageToBase64;
var cleanupImage = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var image, optimalRotation, correctedBuffer;
    var correctOrientation = _b.correctOrientation, imageBuffer = _b.imageBuffer, scheduler = _b.scheduler, trimEdges = _b.trimEdges;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                image = (0, sharp_1.default)(imageBuffer);
                // Trim extra space around the content in the image
                if (trimEdges) {
                    image.trim();
                }
                if (!(correctOrientation && scheduler)) return [3 /*break*/, 2];
                return [4 /*yield*/, determineOptimalRotation({
                        image: image,
                        scheduler: scheduler,
                    })];
            case 1:
                optimalRotation = _c.sent();
                if (optimalRotation) {
                    image.rotate(optimalRotation);
                }
                _c.label = 2;
            case 2: return [4 /*yield*/, image.toBuffer()];
            case 3:
                correctedBuffer = _c.sent();
                return [4 /*yield*/, (0, exports.splitTallImage)(correctedBuffer)];
            case 4: return [2 /*return*/, _c.sent()];
        }
    });
}); };
exports.cleanupImage = cleanupImage;
// Determine the optimal image orientation based on OCR confidence
// Run Tesseract on 4 image orientations and compare the outputs
var determineOptimalRotation = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var imageBuffer, _c, orientation_confidence, orientation_degrees;
    var image = _b.image, scheduler = _b.scheduler;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, image.toBuffer()];
            case 1:
                imageBuffer = _d.sent();
                return [4 /*yield*/, scheduler.addJob("detect", imageBuffer)];
            case 2:
                _c = (_d.sent()).data, orientation_confidence = _c.orientation_confidence, orientation_degrees = _c.orientation_degrees;
                if (orientation_degrees) {
                    console.log("Reorienting image ".concat(orientation_degrees, " degrees (confidence: ").concat(orientation_confidence, "%)"));
                    return [2 /*return*/, orientation_degrees];
                }
                return [2 /*return*/, 0];
        }
    });
}); };
/**
 * Compress an image to a maximum size
 * @param image - The image to compress as a buffer
 * @param maxSize - The maximum size in MB
 * @returns The compressed image as a buffer
 */
var compressImage = function (image, maxSize) { return __awaiter(void 0, void 0, void 0, function () {
    var maxBytes, quality, compressedImage, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (maxSize <= 0) {
                    throw new Error("maxSize must be greater than 0");
                }
                maxBytes = maxSize * 1024 * 1024;
                if (image.length <= maxBytes) {
                    return [2 /*return*/, image];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                quality = 90;
                compressedImage = void 0;
                _a.label = 2;
            case 2: return [4 /*yield*/, (0, sharp_1.default)(image).jpeg({ quality: quality }).toBuffer()];
            case 3:
                compressedImage = _a.sent();
                quality -= 10;
                if (quality < 20) {
                    throw new Error("Unable to compress image to ".concat(maxSize, "MB while maintaining acceptable quality."));
                }
                _a.label = 4;
            case 4:
                if (compressedImage.length > maxBytes) return [3 /*break*/, 2];
                _a.label = 5;
            case 5: return [2 /*return*/, compressedImage];
            case 6:
                error_1 = _a.sent();
                return [2 /*return*/, image];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.compressImage = compressImage;
var splitTallImage = function (imageBuffer) { return __awaiter(void 0, void 0, void 0, function () {
    var image, metadata, height, width, aspectRatio, imageData, emptySpaces, y, emptyPixels, x, pixelIndex, emptyRatio, significantEmptySpaces, currentEmptyStart, y, emptyHeight, emptyHeight, numSections, approxSectionHeight, splitPoints, _loop_1, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                image = (0, sharp_1.default)(imageBuffer);
                return [4 /*yield*/, image.metadata()];
            case 1:
                metadata = _a.sent();
                height = metadata.height || 0;
                width = metadata.width || 0;
                aspectRatio = height / width;
                if (!(aspectRatio <= constants_1.ASPECT_RATIO_THRESHOLD)) return [3 /*break*/, 3];
                return [4 /*yield*/, image.toBuffer()];
            case 2: return [2 /*return*/, [_a.sent()]];
            case 3: return [4 /*yield*/, image
                    .grayscale()
                    .raw()
                    .toBuffer({ resolveWithObject: true })];
            case 4:
                imageData = (_a.sent()).data;
                emptySpaces = new Array(height).fill(0);
                // Analyze each row to find empty spaces
                for (y = 0; y < height; y++) {
                    emptyPixels = 0;
                    for (x = 0; x < width; x++) {
                        pixelIndex = y * width + x;
                        if (imageData[pixelIndex] > 230) {
                            emptyPixels++;
                        }
                    }
                    emptyRatio = emptyPixels / width;
                    // Mark rows that are mostly empty (whitespace)
                    emptySpaces[y] = emptyRatio > 0.95 ? 1 : 0;
                }
                significantEmptySpaces = [];
                currentEmptyStart = -1;
                for (y = 0; y < height; y++) {
                    if (emptySpaces[y] === 1) {
                        if (currentEmptyStart === -1) {
                            currentEmptyStart = y;
                        }
                    }
                    else {
                        if (currentEmptyStart !== -1) {
                            emptyHeight = y - currentEmptyStart;
                            if (emptyHeight >= 5) {
                                // Minimum height for a significant empty space
                                significantEmptySpaces.push({
                                    center: Math.floor(currentEmptyStart + emptyHeight / 2),
                                    end: y - 1,
                                    height: emptyHeight,
                                    start: currentEmptyStart,
                                });
                            }
                            currentEmptyStart = -1;
                        }
                    }
                }
                // Handle if there's an empty space at the end
                if (currentEmptyStart !== -1) {
                    emptyHeight = height - currentEmptyStart;
                    if (emptyHeight >= 5) {
                        significantEmptySpaces.push({
                            center: Math.floor(currentEmptyStart + emptyHeight / 2),
                            end: height - 1,
                            height: emptyHeight,
                            start: currentEmptyStart,
                        });
                    }
                }
                numSections = Math.ceil(aspectRatio);
                approxSectionHeight = Math.floor(height / numSections);
                splitPoints = [0];
                _loop_1 = function (i) {
                    var targetY = i * approxSectionHeight;
                    // Find empty spaces near the target position
                    var searchRadius = Math.min(150, approxSectionHeight / 3);
                    var nearbyEmptySpaces = significantEmptySpaces.filter(function (space) {
                        return Math.abs(space.center - targetY) < searchRadius &&
                            space.start > splitPoints[splitPoints.length - 1] + 50;
                    });
                    if (nearbyEmptySpaces.length > 0) {
                        // Sort by proximity to target
                        nearbyEmptySpaces.sort(function (a, b) { return Math.abs(a.center - targetY) - Math.abs(b.center - targetY); });
                        // Choose center of the best empty space
                        splitPoints.push(nearbyEmptySpaces[0].center);
                    }
                    else {
                        // Fallback if no good empty spaces found
                        var minY = splitPoints[splitPoints.length - 1] + 50;
                        var maxY = Math.min(height - 50, targetY + searchRadius);
                        splitPoints.push(Math.max(minY, Math.min(maxY, targetY)));
                    }
                };
                for (i = 1; i < numSections; i++) {
                    _loop_1(i);
                }
                splitPoints.push(height);
                return [2 /*return*/, Promise.all(splitPoints.slice(0, -1).map(function (top, i) {
                        var sectionHeight = splitPoints[i + 1] - top;
                        return (0, sharp_1.default)(imageBuffer)
                            .extract({ left: 0, top: top, width: width, height: sectionHeight })
                            .toBuffer();
                    }))];
        }
    });
}); };
exports.splitTallImage = splitTallImage;
