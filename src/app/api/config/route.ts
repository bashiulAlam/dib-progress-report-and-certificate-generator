import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "data", "config.json");

const defaultConfig = {
  academyName: "Progress Report System",
  coCurricular: { activities: [] },
  levels: [
    {
      id: "lvl1",
      name: "Default Level",
      subjects: [
        { id: "sub1", name: "General Knowledge", maxPoints: 100, isOptional: false }
      ]
    }
  ]
};

export async function GET() {
  try {
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, "utf-8");
      return NextResponse.json(JSON.parse(fileContent));
    }
    // Return default config if file doesn't exist yet
    return NextResponse.json(defaultConfig);
  } catch (error) {
    console.error("Failed to read config:", error);
    return NextResponse.json(defaultConfig);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dataDir = path.dirname(configPath);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true, config: body });
  } catch (error) {
    console.error("Failed to write config:", error);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}