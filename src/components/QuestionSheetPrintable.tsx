import React from "react";
import { AppConfig, ExamQuestionSheet, QuestionItem } from "@/lib/types";

interface QuestionSheetPrintableProps {
    sheet: ExamQuestionSheet;
    config: AppConfig;
}

// Improved space-filling chunking logic to fit tightly and avoid wasted pages
const chunkQuestionsForPages = (questions: QuestionItem[]): QuestionItem[][] => {
    const pages: QuestionItem[][] = [];
    let currentPage: QuestionItem[] = [];
    let currentWeight = 0;

    questions.forEach((q) => {
        const isMatrix = q.questionEvaluationType === "matrix";
        const hasImage = !!q.imageUrl;

        const qWeight = isMatrix ? 1.8 : hasImage ? 1.5 : 1.0;
        const maxPageWeight = pages.length === 0 ? 5.2 : 6.0;

        if (currentWeight + qWeight > maxPageWeight && currentPage.length > 0) {
            pages.push(currentPage);
            currentPage = [q];
            currentWeight = qWeight;
        } else {
            currentPage.push(q);
            currentWeight += qWeight;
        }
    });

    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    return pages;
};

export const QuestionSheetPrintable = ({ sheet, config }: QuestionSheetPrintableProps) => {
    const currentLevel = config.levels.find((l) => l.id === sheet.levelId);
    const currentSubLevel = currentLevel?.subLevels?.find(
        (sl) => sl.id === sheet.subLevelId
    );

    return (
        <>
            {sheet.subjectGroups.map((group, groupIdx) => {
                const subjectPages = chunkQuestionsForPages(group.questions);
                const totalSubjectPages = subjectPages.length;

                return subjectPages.map((pageQuestions, pageIdx) => {
                    const isFirstPageOfSubject = pageIdx === 0;
                    const isLastPageOfSubject = pageIdx === totalSubjectPages - 1;
                    const isLastSubjectOverall = groupIdx === sheet.subjectGroups.length - 1;
                    const shouldBreakPage = !(isLastPageOfSubject && isLastSubjectOverall);

                    return (
                        <div
                            key={`${group.subjectId}_p${pageIdx + 1}`}
                            className="report-card-printable relative bg-white text-black p-8 pb-12 box-border flex flex-col justify-between"
                            style={{
                                width: "210mm",
                                minHeight: "297mm",
                                margin: "0 auto",
                                pageBreakAfter: shouldBreakPage ? "always" : "auto",
                                breakAfter: shouldBreakPage ? "page" : "auto",
                                pageBreakInside: "avoid",
                                breakInside: "avoid",
                            }}
                        >
                            {/* Watermark Logo */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
                                <img
                                    src="/assets/dib-logo.png"
                                    alt="Watermark Logo"
                                    className="w-96 h-96 object-contain"
                                />
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    {/* Page Header */}
                                    {isFirstPageOfSubject ? (
                                        /* Full Header for Page 1 */
                                        <div className="text-center border-b pb-2 mb-2">
                                            <img
                                                src="/assets/dib-logo.png"
                                                alt="Academy Logo"
                                                className="h-12 mx-auto mb-1 object-contain"
                                            />
                                            <p className="text-[9px] font-semibold text-gray-600 mb-2">
                                                Darul Ihsan Berlin e.V.
                                            </p>
                                            <h1 className="text-lg font-bold uppercase tracking-wider">
                                                {config.academyName}
                                            </h1>
                                            <p className="text-xs font-semibold text-gray-600">
                                                {sheet.term}
                                            </p>
                                        </div>
                                    ) : (
                                        /* Compact Header for Page 2+ */
                                        <div className="grid grid-cols-3 items-center border-b pb-2 mb-2">
                                            {/* Left (1/3): Logo with 'Darul Ihsan Berlin e.V.' directly UNDERNEATH */}
                                            <div className="flex justify-start">
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src="/assets/dib-logo.png"
                                                        alt="Academy Logo"
                                                        className="h-7 w-7 object-contain mb-0.5"
                                                    />
                                                    <span className="text-[9px] text-gray-500 leading-none whitespace-nowrap">
                                                        Darul Ihsan Berlin e.V.
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Middle (1/3): Academy Name Centered */}
                                            <span className="text-xs font-bold uppercase tracking-wider text-center">
                                                {config.academyName}
                                            </span>

                                            {/* Right (1/3): Term Title Aligned Right */}
                                            <span className="text-xs font-semibold text-gray-500 text-right">
                                                {sheet.term}
                                            </span>
                                        </div>
                                    )}

                                    {/* Subject Title & Max Points */}
                                    <div className="flex justify-between items-center border-b-2 border-black pb-1">
                                        <h2 className="text-md font-bold">{group.subjectName}</h2>
                                        <span className="text-xs font-semibold">
                                            Max Points: {group.totalMaxPoints}
                                        </span>
                                    </div>

                                    {/* Meta Bar: Student/Examiner details rendered ONLY on Page 1 */}
                                    {isFirstPageOfSubject && (
                                        <div className="grid grid-cols-2 gap-3 border p-2 rounded mb-3 text-xs bg-white/90">
                                            <div>
                                                <p>
                                                    <strong>Level:</strong> Noorani
                                                    {currentSubLevel && ` (${currentSubLevel.name})`}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="pb-0.5">
                                                    <strong>Student Name:</strong> ____________________________
                                                </p>
                                            </div>
                                            <div>
                                                <p className="pb-0.5">
                                                    <strong>Examiner Name:</strong> ____________________________
                                                </p>
                                            </div>
                                            <div>
                                                <p>
                                                    <strong>Date:</strong> ____________________
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Questions List */}
                                    <div className="space-y-3">
                                        {pageQuestions.map((q, localQIdx) => {
                                            const globalQNum =
                                                subjectPages
                                                    .slice(0, pageIdx)
                                                    .reduce((acc, p) => acc + p.length, 0) +
                                                localQIdx +
                                                1;

                                            return (
                                                <div
                                                    key={q.id}
                                                    className="space-y-1.5"
                                                    style={{
                                                        pageBreakInside: "avoid",
                                                        breakInside: "avoid",
                                                    }}
                                                >
                                                    <div className="flex justify-between font-semibold text-xl">
                                                        <span>
                                                            Q{globalQNum}. {q.questionText}
                                                        </span>
                                                        <span>[{q.maxPoints} Marks]</span>
                                                    </div>

                                                    {q.imageUrl && (
                                                        <div className="my-1">
                                                            <img
                                                                src={q.imageUrl}
                                                                alt={`Question ${globalQNum}`}
                                                                className="max-h-32 rounded border object-contain bg-white"
                                                            />
                                                        </div>
                                                    )}

                                                    {q.questionEvaluationType === "simple" ? (
                                                        <table
                                                            className="w-full border-collapse border border-black text-xs my-1"
                                                            style={{
                                                                pageBreakInside: "avoid",
                                                                breakInside: "avoid",
                                                            }}
                                                        >
                                                            <thead>
                                                                <tr className="border-b border-black bg-gray-50/50">
                                                                    <th className="border-r border-black p-1 text-left w-1/4">
                                                                        Marks
                                                                    </th>
                                                                    <th className="p-1 text-left w-3/4">
                                                                        Comments/Feedback
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td className="border-r border-black p-2.5"></td>
                                                                    <td className="p-2.5"></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <table
                                                            className="w-full border-collapse border border-black text-xs my-1"
                                                            style={{
                                                                pageBreakInside: "avoid",
                                                                breakInside: "avoid",
                                                            }}
                                                        >
                                                            <tbody>
                                                                <tr className="border-b border-black">
                                                                    <td className="border-r border-black p-1 font-medium w-1/5">
                                                                        Correctness
                                                                    </td>
                                                                    <td className="border-r border-black p-1 w-1/5"></td>
                                                                    <td className="border-r border-black p-1 font-medium w-1/5">
                                                                        Partial Mistakes
                                                                    </td>
                                                                    <td className="border-r border-black p-1 w-1/5"></td>
                                                                    <td
                                                                        rowSpan={3}
                                                                        className="p-1 border-l border-black align-top w-2/5"
                                                                    >
                                                                        <span className="font-medium">
                                                                            Comments
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                                <tr className="border-b border-black">
                                                                    <td className="border-r border-black p-1 font-medium">
                                                                        Gunnah
                                                                    </td>
                                                                    <td className="border-r border-black p-1"></td>
                                                                    <td className="border-r border-black p-1 font-medium">
                                                                        Melody
                                                                    </td>
                                                                    <td className="border-r border-black p-1"></td>
                                                                </tr>
                                                                <tr className="border-b border-black">
                                                                    <td className="border-r border-black p-1 font-medium">
                                                                        Madd
                                                                    </td>
                                                                    <td className="border-r border-black p-1"></td>
                                                                    <td className="border-r border-black p-1 font-medium">
                                                                        Makhraj
                                                                    </td>
                                                                    <td className="border-r border-black p-1"></td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border-r border-black p-1 font-bold">
                                                                        Total
                                                                    </td>
                                                                    <td
                                                                        colSpan={3}
                                                                        className="border-r border-black p-1"
                                                                    ></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* True Bottom Page Numbering Footer */}
                            <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-400">
                                {group.subjectName} — Page {pageIdx + 1} of {totalSubjectPages}
                            </div>
                        </div>
                    );
                });
            })}
        </>
    );
};