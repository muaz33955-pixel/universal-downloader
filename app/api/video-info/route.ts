import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return NextResponse.json({ error: "Please provide a valid YouTube URL" }, { status: 400 });
  }

  try {
    // Ab hum system ka apna yt-dlp chalayenge
    const command = `yt-dlp --dump-single-json --no-warnings "${videoUrl}"`;
    const { stdout } = await execPromise(command, { maxBuffer: 1024 * 1024 * 10 });
    
    const info = JSON.parse(stdout);

    // Frontend ke liye data filter karna (Max 1080p)
    const responseData = {
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      formats: info.formats
        .filter((f: any) => f.vcodec !== 'none' && f.ext === 'mp4' && f.height != null && f.height <= 1080) // 1080p ki limit lagayi
        .sort((a: any, b: any) => b.height - a.height) // Sab se bari quality ko top par rakhne ke liye sort kiya
        .map((f: any) => ({
          format_id: f.format_id,
          resolution: f.resolution || `${f.width}x${f.height}`,
          fps: f.fps,
        }))
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error: any) {
    console.error("Backend Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch video details." }, { status: 500 });
  }
}