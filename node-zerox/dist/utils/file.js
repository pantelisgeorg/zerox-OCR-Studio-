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
exports.isStructuredDataFile = exports.isExcelFile = exports.getNumberOfPagesFromPdf = exports.extractPagesFromStructuredDataFile = exports.convertExcelToHtml = exports.convertPdfToImages = exports.convertFileToPdf = exports.convertHeicToJpeg = exports.checkIsPdfFile = exports.checkIsCFBFile = exports.downloadFile = void 0;
var libreoffice_convert_1 = require("libreoffice-convert");
var child_process_1 = require("child_process");
var pdf2pic_1 = require("pdf2pic");
var promises_1 = require("stream/promises");
var util_1 = require("util");
var uuid_1 = require("uuid");
var axios_1 = __importDefault(require("axios"));
var file_type_1 = __importDefault(require("file-type"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var heic_convert_1 = __importDefault(require("heic-convert"));
var mime_types_1 = __importDefault(require("mime-types"));
var path_1 = __importDefault(require("path"));
var pdf_parse_1 = __importDefault(require("pdf-parse"));
var util_2 = __importDefault(require("util"));
var xlsx_1 = __importDefault(require("xlsx"));
var constants_1 = require("../constants");
var types_1 = require("../types");
var common_1 = require("./common");
var convertAsync = (0, util_1.promisify)(libreoffice_convert_1.convert);
var execAsync = util_2.default.promisify(child_process_1.exec);
// Save file to local tmp directory
var downloadFile = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var fileNameExt, localPath, mimetype, writer, response, extension;
    var _c;
    var filePath = _b.filePath, tempDir = _b.tempDir;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                fileNameExt = path_1.default.extname(filePath.split("?")[0]);
                localPath = path_1.default.join(tempDir, (0, uuid_1.v4)() + fileNameExt);
                if (!(0, common_1.isValidUrl)(filePath)) return [3 /*break*/, 3];
                writer = fs_extra_1.default.createWriteStream(localPath);
                return [4 /*yield*/, (0, axios_1.default)({
                        url: filePath,
                        method: "GET",
                        responseType: "stream",
                    })];
            case 1:
                response = _d.sent();
                if (response.status !== 200) {
                    throw new Error("HTTP error! Status: ".concat(response.status));
                }
                mimetype = (_c = response.headers) === null || _c === void 0 ? void 0 : _c["content-type"];
                return [4 /*yield*/, (0, promises_1.pipeline)(response.data, writer)];
            case 2:
                _d.sent();
                return [3 /*break*/, 5];
            case 3: 
            // If filePath is a local file, copy it to the temp directory
            return [4 /*yield*/, fs_extra_1.default.copyFile(filePath, localPath)];
            case 4:
                // If filePath is a local file, copy it to the temp directory
                _d.sent();
                _d.label = 5;
            case 5:
                if (!mimetype) {
                    mimetype = mime_types_1.default.lookup(localPath);
                }
                extension = mime_types_1.default.extension(mimetype);
                if (!extension) {
                    extension = fileNameExt || "";
                }
                if (!extension) {
                    if (mimetype === "binary/octet-stream") {
                        extension = ".bin";
                    }
                    else {
                        throw new Error("File extension missing");
                    }
                }
                if (!extension.startsWith(".")) {
                    extension = ".".concat(extension);
                }
                return [2 /*return*/, { extension: extension, localPath: localPath }];
        }
    });
}); };
exports.downloadFile = downloadFile;
// Check if file is a Compound File Binary (legacy Office format)
var checkIsCFBFile = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var type;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, file_type_1.default.fromFile(filePath)];
            case 1:
                type = _a.sent();
                return [2 /*return*/, (type === null || type === void 0 ? void 0 : type.mime) === "application/x-cfb"];
        }
    });
}); };
exports.checkIsCFBFile = checkIsCFBFile;
// Check if file is a PDF by inspecting its magic number ("%PDF" at the beginning)
var checkIsPdfFile = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var buffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fs_extra_1.default.readFile(filePath)];
            case 1:
                buffer = _a.sent();
                return [2 /*return*/, buffer.subarray(0, 4).toString() === "%PDF"];
        }
    });
}); };
exports.checkIsPdfFile = checkIsPdfFile;
// Convert HEIC file to JPEG
var convertHeicToJpeg = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var inputBuffer, outputBuffer, jpegPath, err_1;
    var localPath = _b.localPath, tempDir = _b.tempDir;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                return [4 /*yield*/, fs_extra_1.default.readFile(localPath)];
            case 1:
                inputBuffer = _c.sent();
                return [4 /*yield*/, (0, heic_convert_1.default)({
                        buffer: inputBuffer,
                        format: "JPEG",
                        quality: 1,
                    })];
            case 2:
                outputBuffer = _c.sent();
                jpegPath = path_1.default.join(tempDir, "".concat(path_1.default.basename(localPath, ".heic"), ".jpg"));
                return [4 /*yield*/, fs_extra_1.default.writeFile(jpegPath, Buffer.from(outputBuffer))];
            case 3:
                _c.sent();
                return [2 /*return*/, jpegPath];
            case 4:
                err_1 = _c.sent();
                console.error("Error converting .heic to .jpeg:", err_1);
                throw err_1;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.convertHeicToJpeg = convertHeicToJpeg;
// Convert each page (from other formats like docx) to a png and save that image to tmp
var convertFileToPdf = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var inputBuffer, outputFilename, outputPath, pdfBuffer, err_2;
    var extension = _b.extension, localPath = _b.localPath, tempDir = _b.tempDir;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, fs_extra_1.default.readFile(localPath)];
            case 1:
                inputBuffer = _c.sent();
                outputFilename = path_1.default.basename(localPath, extension) + ".pdf";
                outputPath = path_1.default.join(tempDir, outputFilename);
                _c.label = 2;
            case 2:
                _c.trys.push([2, 5, , 6]);
                return [4 /*yield*/, convertAsync(inputBuffer, ".pdf", undefined)];
            case 3:
                pdfBuffer = _c.sent();
                return [4 /*yield*/, fs_extra_1.default.writeFile(outputPath, pdfBuffer)];
            case 4:
                _c.sent();
                return [2 /*return*/, outputPath];
            case 5:
                err_2 = _c.sent();
                console.error("Error converting ".concat(extension, " to .pdf:"), err_2);
                throw err_2;
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.convertFileToPdf = convertFileToPdf;
// Convert each page to a png and save that image to tempDir
var convertPdfToImages = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var aspectRatio, shouldAdjustHeight, adjustedHeight, options, storeAsImage, convertResults, err_3, err_4;
    var _c = _b.imageDensity, imageDensity = _c === void 0 ? 300 : _c, _d = _b.imageFormat, imageFormat = _d === void 0 ? "png" : _d, _e = _b.imageHeight, imageHeight = _e === void 0 ? 2048 : _e, pagesToConvertAsImages = _b.pagesToConvertAsImages, pdfPath = _b.pdfPath, tempDir = _b.tempDir;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0: return [4 /*yield*/, getPdfAspectRatio(pdfPath)];
            case 1:
                aspectRatio = (_f.sent()) || 1;
                shouldAdjustHeight = aspectRatio > constants_1.ASPECT_RATIO_THRESHOLD;
                adjustedHeight = shouldAdjustHeight
                    ? Math.max(imageHeight, Math.round(aspectRatio * imageHeight))
                    : imageHeight;
                options = {
                    density: imageDensity,
                    format: imageFormat,
                    height: adjustedHeight,
                    preserveAspectRatio: true,
                    saveFilename: path_1.default.basename(pdfPath, path_1.default.extname(pdfPath)),
                    savePath: tempDir,
                };
                _f.label = 2;
            case 2:
                _f.trys.push([2, 8, , 9]);
                _f.label = 3;
            case 3:
                _f.trys.push([3, 5, , 7]);
                storeAsImage = (0, pdf2pic_1.fromPath)(pdfPath, options);
                return [4 /*yield*/, storeAsImage.bulk(pagesToConvertAsImages)];
            case 4:
                convertResults = _f.sent();
                // Validate that all pages were converted
                return [2 /*return*/, convertResults.map(function (result) {
                        if (!result.page || !result.path) {
                            throw new Error("Could not identify page data");
                        }
                        return result.path;
                    })];
            case 5:
                err_3 = _f.sent();
                return [4 /*yield*/, convertPdfWithPoppler(pagesToConvertAsImages, pdfPath, options)];
            case 6: return [2 /*return*/, _f.sent()];
            case 7: return [3 /*break*/, 9];
            case 8:
                err_4 = _f.sent();
                console.error("Error during PDF conversion:", err_4);
                throw err_4;
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.convertPdfToImages = convertPdfToImages;
// Converts an Excel file to HTML format
var convertExcelToHtml = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var tableClass, workbook, sheets, _loop_1, _i, _a, sheetName, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                tableClass = "zerox-excel-table";
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, fs_extra_1.default.pathExists(filePath)];
            case 2:
                if (!(_b.sent())) {
                    throw new Error("Excel file not found: ".concat(filePath));
                }
                workbook = xlsx_1.default.readFile(filePath, {
                    type: "file",
                    cellStyles: true,
                    cellHTML: true,
                });
                if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                    throw new Error("Invalid Excel file or no sheets found");
                }
                sheets = [];
                _loop_1 = function (sheetName) {
                    var worksheet = workbook.Sheets[sheetName];
                    var jsonData = xlsx_1.default.utils.sheet_to_json(worksheet, {
                        header: 1,
                    });
                    var sheetContent = "";
                    sheetContent += "<h2>Sheet: ".concat(sheetName, "</h2>");
                    sheetContent += "<table class=\"".concat(tableClass, "\">");
                    if (jsonData.length > 0) {
                        jsonData.forEach(function (row, rowIndex) {
                            sheetContent += "<tr>";
                            var cellTag = rowIndex === 0 ? "th" : "td";
                            if (row && row.length > 0) {
                                row.forEach(function (cell) {
                                    var cellContent = cell !== null && cell !== undefined ? cell.toString() : "";
                                    sheetContent += "<".concat(cellTag, ">").concat(cellContent, "</").concat(cellTag, ">");
                                });
                            }
                            sheetContent += "</tr>";
                        });
                    }
                    sheetContent += "</table>";
                    sheets.push({
                        sheetName: sheetName,
                        content: sheetContent,
                        contentLength: sheetContent.length,
                    });
                };
                for (_i = 0, _a = workbook.SheetNames; _i < _a.length; _i++) {
                    sheetName = _a[_i];
                    _loop_1(sheetName);
                }
                return [2 /*return*/, sheets];
            case 3:
                error_1 = _b.sent();
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.convertExcelToHtml = convertExcelToHtml;
// Alternative PDF to PNG conversion using Poppler
var convertPdfWithPoppler = function (pagesToConvertAsImages, pdfPath, options) { return __awaiter(void 0, void 0, void 0, function () {
    var density, format, height, saveFilename, savePath, outputPrefix, run, convertResults;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                density = options.density, format = options.format, height = options.height, saveFilename = options.saveFilename, savePath = options.savePath;
                outputPrefix = path_1.default.join(savePath, saveFilename);
                run = function (from, to) { return __awaiter(void 0, void 0, void 0, function () {
                    var pageArgs, cmd;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                pageArgs = from && to ? "-f ".concat(from, " -l ").concat(to) : "";
                                cmd = "pdftoppm -".concat(format, " -r ").concat(density, " -scale-to-y ").concat(height, " -scale-to-x -1 ").concat(pageArgs, " \"").concat(pdfPath, "\" \"").concat(outputPrefix, "\"");
                                return [4 /*yield*/, execAsync(cmd)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                if (!(pagesToConvertAsImages === -1)) return [3 /*break*/, 2];
                return [4 /*yield*/, run()];
            case 1:
                _a.sent();
                return [3 /*break*/, 6];
            case 2:
                if (!(typeof pagesToConvertAsImages === "number")) return [3 /*break*/, 4];
                return [4 /*yield*/, run(pagesToConvertAsImages, pagesToConvertAsImages)];
            case 3:
                _a.sent();
                return [3 /*break*/, 6];
            case 4:
                if (!Array.isArray(pagesToConvertAsImages)) return [3 /*break*/, 6];
                return [4 /*yield*/, Promise.all(pagesToConvertAsImages.map(function (page) { return run(page, page); }))];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [4 /*yield*/, fs_extra_1.default.readdir(savePath)];
            case 7:
                convertResults = _a.sent();
                return [2 /*return*/, convertResults
                        .filter(function (result) {
                        return result.startsWith(saveFilename) && result.endsWith(".".concat(format));
                    })
                        .map(function (result) { return path_1.default.join(savePath, result); })];
        }
    });
}); };
// Extracts pages from a structured data file (like Excel)
var extractPagesFromStructuredDataFile = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var sheets, pages_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(0, exports.isExcelFile)(filePath)) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.convertExcelToHtml)(filePath)];
            case 1:
                sheets = _a.sent();
                pages_1 = [];
                sheets.forEach(function (sheet, index) {
                    pages_1.push({
                        content: sheet.content,
                        contentLength: sheet.contentLength,
                        page: index + 1,
                        status: types_1.PageStatus.SUCCESS,
                    });
                });
                return [2 /*return*/, pages_1];
            case 2: return [2 /*return*/, []];
        }
    });
}); };
exports.extractPagesFromStructuredDataFile = extractPagesFromStructuredDataFile;
// Gets the number of pages from a PDF
var getNumberOfPagesFromPdf = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var dataBuffer, data;
    var pdfPath = _b.pdfPath;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, fs_extra_1.default.readFile(pdfPath)];
            case 1:
                dataBuffer = _c.sent();
                return [4 /*yield*/, (0, pdf_parse_1.default)(dataBuffer)];
            case 2:
                data = _c.sent();
                return [2 /*return*/, data.numpages];
        }
    });
}); };
exports.getNumberOfPagesFromPdf = getNumberOfPagesFromPdf;
// Gets the aspect ratio (height/width) of a PDF
var getPdfAspectRatio = function (pdfPath) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve) {
                (0, child_process_1.exec)("pdfinfo \"".concat(pdfPath, "\""), function (error, stdout) {
                    if (error)
                        return resolve(undefined);
                    var sizeMatch = stdout.match(/Page size:\s+([\d.]+)\s+x\s+([\d.]+)/);
                    if (sizeMatch) {
                        var height = parseFloat(sizeMatch[2]);
                        var width = parseFloat(sizeMatch[1]);
                        return resolve(height / width);
                    }
                    resolve(undefined);
                });
            })];
    });
}); };
// Checks if a file is an Excel file
var isExcelFile = function (filePath) {
    var extension = path_1.default.extname(filePath).toLowerCase();
    return (extension === ".xlsx" ||
        extension === ".xls" ||
        extension === ".xlsm" ||
        extension === ".xlsb");
};
exports.isExcelFile = isExcelFile;
// Checks if a file is a structured data file (like Excel)
var isStructuredDataFile = function (filePath) {
    return (0, exports.isExcelFile)(filePath);
};
exports.isStructuredDataFile = isStructuredDataFile;
