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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
import { APP_AUTH_BASE_URL, requiredMetaData } from "./constants.js";
import axios from "axios";
export function fetchData(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var apiUrl, res, error_1;
        var path = _b.path, body = _b.body, queryParams = _b.queryParams, _c = _b.baseUrl, baseUrl = _c === void 0 ? APP_AUTH_BASE_URL : _c, _d = _b.apiKey, apiKey = _d === void 0 ? "" : _d, _e = _b.headers, headers = _e === void 0 ? { "X-Api-Key": apiKey, "Content-Type": "application/json" } : _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    apiUrl = "".concat(baseUrl).concat(path).concat(queryParams ? "?".concat(new URLSearchParams(queryParams)) : "");
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios.post(apiUrl, body, { headers: headers })];
                case 2:
                    res = _f.sent();
                    if (res.status >= 200 && res.status < 300) {
                        return [2 /*return*/, res === null || res === void 0 ? void 0 : res.data];
                    }
                    console.error("Error: Unexpected response status ".concat(res === null || res === void 0 ? void 0 : res.status));
                    return [2 /*return*/, {}];
                case 3:
                    error_1 = _f.sent();
                    console.error(error_1, "while uploading");
                    return [2 /*return*/, {}];
                case 4: return [2 /*return*/];
            }
        });
    });
}
export var checkParameters = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
        var element = args_1[_a];
        if (!element) {
            return false;
        }
    }
    return true;
};
export var checkMetaDataValue = function (arr) {
    for (var _i = 0, requiredMetaData_1 = requiredMetaData; _i < requiredMetaData_1.length; _i++) {
        var key = requiredMetaData_1[_i];
        var hasRequiredKey = false;
        inner: for (var _a = 0, arr_1 = arr; _a < arr_1.length; _a++) {
            var obj = arr_1[_a];
            if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null && obj[key] !== "" && typeof obj[key] !== "number") {
                hasRequiredKey = true;
                break inner;
            }
        }
        if (!hasRequiredKey) {
            return false;
        }
    }
    var correctFormat = false;
    for (var _b = 0, arr_2 = arr; _b < arr_2.length; _b++) {
        var obj = arr_2[_b];
        if (obj.callback_url && obj.callback_url.startsWith("https")) {
            correctFormat = true;
        }
    }
    if (!correctFormat) {
        return false;
    }
    return true;
};
