import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const fileNameParam = searchParams.get("file");
        const yearParam = searchParams.get("year");

        const dirPath = path.join(process.cwd(), "data", "ramadan_exports");
        const fileName = fileNameParam || `Productive_Ramadan_${yearParam || new Date().getFullYear()}_ResultData.json`;
        const filePath = path.join(dirPath, fileName);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { success: false, error: `File '${fileName}' not found on server.` },
                { status: 404 }
            );
        }

        const fileData = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(fileData);

        return NextResponse.json({
            success: true,
            data: parsed,
            filePath,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}