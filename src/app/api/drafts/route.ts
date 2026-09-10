import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const draftsDir = path.join(process.cwd(), "data", "drafts");

export async function GET(req: Request) {
  try {
    if (!fs.existsSync(draftsDir)) {
      fs.mkdirSync(draftsDir, { recursive: true });
    }

    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("file");

    if (fileName) {
      const filePath = path.join(draftsDir, fileName);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return NextResponse.json(JSON.parse(fileContent));
      }
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const files = fs.readdirSync(draftsDir).filter((file) => file.endsWith(".json"));
    return NextResponse.json(files);
  } catch (error) {
    console.error("Failed to process drafts GET request:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let filename = body.filename;
    if (!filename || filename === "session_draft.json") {
      const termName = body.data?.term || body.term || "";
      const cleanTerm = termName.trim().replace(/[/\\?%*:|"<>]/g, "-");
      filename = cleanTerm ? `${cleanTerm}.json` : `session_${Date.now()}.json`;
    }

    if (!filename.endsWith(".json")) {
      filename += ".json";
    }

    const data = body.data || body;

    if (!fs.existsSync(draftsDir)) {
      fs.mkdirSync(draftsDir, { recursive: true });
    }

    const filePath = path.join(draftsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error("Failed to save draft:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    const filePath = path.join(draftsDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "File not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to delete draft:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}