"use strict";
// src/types/analysis.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisStatus = void 0;
/**
 * Analysis status enum
 */
var AnalysisStatus;
(function (AnalysisStatus) {
    AnalysisStatus["PENDING"] = "PENDING";
    AnalysisStatus["COMPLETED"] = "COMPLETED";
    AnalysisStatus["FAILED"] = "FAILED";
})(AnalysisStatus || (exports.AnalysisStatus = AnalysisStatus = {}));
