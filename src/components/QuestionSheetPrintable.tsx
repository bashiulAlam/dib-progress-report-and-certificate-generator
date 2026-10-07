import React from "react";
import { AppConfig, ExamQuestionSheet } from "@/lib/types";

interface QuestionSheetPrintableProps {
    sheet: ExamQuestionSheet;
    config: AppConfig;
}

export const QuestionSheetPrintable = ({ sheet, config }: QuestionSheetPrintableProps) => {
    const currentLevel = config.levels.find((l) => l.id === sheet.levelId);
    const currentSubLevel = currentLevel?.subLevels?.find(
        (sl) => sl.id === sheet.subLevelId
    );

    return (
        <div className="report-card-printable p-8 max-w-4xl mx-auto bg-white text-black print:p-0">
            {/* 1. Logo & 2. Academy Name Header */}
            <div className="text-center border-b pb-4 mb-4">
                <img
                    src="/assets/dib-logo.png"
                    alt="Academy Logo"
                    className="h-16 mx-auto mb-2 object-contain"
                />
                <h1 className="text-2xl font-bold uppercase tracking-wider">
                    {config.academyName}
                </h1>
                {/* 3. Semester */}
                <p className="text-sm font-semibold text-gray-600 mt-1">{sheet.term}</p>
            </div>

            {/* Meta Bar: Level, SubLevel, Student Name, Examiner Name */}
            <div className="grid grid-cols-2 gap-4 border p-3 rounded mb-6 text-sm">
                <div>
                    {/* 4. Level & SubLevel */}
                    <p>
                        <strong>Level:</strong> Noorani
                        {currentSubLevel && ` (${currentSubLevel.name})`}
                    </p>
                </div>
                <div>
                    {/* 5. Student Name */}
                    <p className="border-b border-dotted pb-1">
                        <strong>Student Name:</strong> ____________________________
                    </p>
                </div>
                <div>
                    {/* 6. Examiner Name */}
                    <p className="border-b border-dotted pb-1">
                        <strong>Examiner Name:</strong> ____________________________
                    </p>
                </div>
                <div>
                    <p>
                        <strong>Date:</strong> ____________________
                    </p>
                </div>
            </div>

            {/* 7 & 8. Subject Groups & Questions */}
            {sheet.subjectGroups.map((group) => (
                <div key={group.subjectId} className="mb-8 space-y-6">
                    <div className="flex justify-between items-center border-b-2 border-black pb-1">
                        <h2 className="text-lg font-bold">{group.subjectName}</h2>
                        <span className="text-sm font-semibold">
                            Max Points: {group.totalMaxPoints}
                        </span>
                    </div>

                    {group.questions.map((q, qIndex) => (
                        <div key={q.id} className="space-y-3 break-inside-avoid">
                            <div className="flex justify-between font-semibold text-sm">
                                <span>
                                    Q{qIndex + 1}. {q.questionText}
                                </span>
                                <span>[{q.maxPoints} Marks]</span>
                            </div>

                            {q.imageUrl && (
                                <div className="my-2">
                                    <img
                                        src={q.imageUrl}
                                        alt={`Question ${qIndex + 1}`}
                                        className="max-h-48 rounded border object-contain"
                                    />
                                </div>
                            )}

                            {q.questionEvaluationType === "simple" ? (
                                /* Simple Evaluation */
                                <table className="w-full border-collapse border border-black text-xs my-2">
                                    <thead>
                                        <tr className="border-b border-black">
                                            <th className="border-r border-black p-2 text-left w-1/4">
                                                Marks
                                            </th>
                                            <th className="p-2 text-left w-3/4">Comments/Feedback</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border-r border-black p-4"></td>
                                            <td className="p-4"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                /* Matrix Evaluation */
                                <table className="w-full border-collapse border border-black text-xs my-2">
                                    <tbody>
                                        <tr className="border-b border-black">
                                            <td className="border-r border-black p-2 font-medium w-1/5">
                                                Correctness
                                            </td>
                                            <td className="border-r border-black p-2 w-1/5"></td>
                                            <td className="border-r border-black p-2 font-medium w-1/5">
                                                Partial Mistakes
                                            </td>
                                            <td className="border-r border-black p-2 w-1/5"></td>
                                            <td
                                                rowSpan={3}
                                                className="p-2 border-l border-black align-top w-2/5"
                                            >
                                                <span className="font-medium">Comments</span>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-black">
                                            <td className="border-r border-black p-2 font-medium">
                                                Gunnah
                                            </td>
                                            <td className="border-r border-black p-2"></td>
                                            <td className="border-r border-black p-2 font-medium">
                                                Melody
                                            </td>
                                            <td className="border-r border-black p-2"></td>
                                        </tr>
                                        <tr className="border-b border-black">
                                            <td className="border-r border-black p-2 font-medium">
                                                Madd
                                            </td>
                                            <td className="border-r border-black p-2"></td>
                                            <td className="border-r border-black p-2 font-medium">
                                                Makhraj
                                            </td>
                                            <td className="border-r border-black p-2"></td>
                                        </tr>
                                        <tr>
                                            <td className="border-r border-black p-2 font-bold">
                                                Total
                                            </td>
                                            <td
                                                colSpan={3}
                                                className="border-r border-black p-2"
                                            ></td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};