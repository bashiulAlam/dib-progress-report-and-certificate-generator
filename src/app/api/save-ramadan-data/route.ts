import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { year, data } = body;

        // Path where files will be stored on the server disk
        const dirPath = path.join(process.cwd(), "data", "ramadan_exports");

        // Ensure directory exists
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const fileName = `Productive_Ramadan_${year}_ResultData.json`;
        const filePath = path.join(dirPath, fileName);

        // Write file directly to server local path
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

        return NextResponse.json({
            success: true,
            message: `Saved successfully to server at ${filePath}`,
            filePath
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}