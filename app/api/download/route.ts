import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import util from "util";

const execPromise = util.promisify(exec);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");
  const formatId = searchParams.get("format");
  const isAudioOnly = searchParams.get("audio") === "true";

  if (!videoUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const downloadsFolder = path.join(process.cwd(), "public", "downloads");
  if (!fs.existsSync(downloadsFolder)) {
    fs.mkdirSync(downloadsFolder, { recursive: true });
  }

  const ext = isAudioOnly ? "mp3" : "mp4";
  const fileName = `Universal_${Date.now()}.${ext}`;
  const filePath = path.join(downloadsFolder, fileName);

  // --- SMART PATH DETECTION ---
  // Agar production (server) hai toh 'ffmpeg' direct chalega
  // Agar development (aapka PC) hai toh D: drive wala path use hoga
  const ffmpegPath = process.env.NODE_ENV === "production" 
    ? "ffmpeg" 
    : "D:\\ffmpeg-8.1.1-essentials_build\\bin";

  try {
    let command = "";
    
    if (isAudioOnly) {
      command = `yt-dlp --ffmpeg-location "${ffmpegPath}" -x --audio-format mp3 --audio-quality 0 -f "bestaudio" -o "${filePath}" "${videoUrl}"`;
    } else {
      if (!formatId) return NextResponse.json({ error: "Format ID is required for video" }, { status: 400 });
      
      command = `yt-dlp --ffmpeg-location "${ffmpegPath}" -f "${formatId}+bestaudio/best" --merge-output-format mp4 --postprocessor-args "ffmpeg:-c:a aac" -o "${filePath}" "${videoUrl}"`;
    }
    
    console.log(`Executing Universal Task: ${fileName}`);
    
    await execPromise(command, { maxBuffer: 1024 * 1024 * 100 }); 

    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (!err) console.log(`Cleanup Done: ${fileName}`);
        });
      }
    }, 1000 * 60 * 10);

    return NextResponse.json({ 
      success: true, 
      downloadUrl: `/downloads/${fileName}`,
      fileName: fileName
    }, { status: 200 });

  } catch (error: any) {
    console.error("Task Error:", error.message);
    return NextResponse.json({ 
      error: "Process failed. Make sure FFmpeg is correctly placed and the link is public." 
    }, { status: 500 });
  }
}