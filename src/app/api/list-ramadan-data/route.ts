import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const dirPath = path.join(process.cwd(), "data", "ramadan_exports");

        if (!fs.existsSync(dirPath)) {
            return NextResponse.json({ success: true, files: [] });
        }

        const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));

        const fileList = files.map((fileName) => {
            const stats = fs.statSync(path.join(dirPath, fileName));
            return {
                fileName,
                updatedAt: stats.mtime,
            };
        });

        // Sort latest modified first
        fileList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        return NextResponse.json({ success: true, files: fileList });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}