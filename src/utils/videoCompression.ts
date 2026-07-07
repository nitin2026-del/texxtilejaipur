import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const compressVideo = async (
  videoFile: File,
  onProgress?: (progress: number) => void
): Promise<File> => {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    ffmpeg.on('progress', ({ progress }) => {
      if (onProgress) onProgress(progress);
    });

    // Use unpkg CDN to load the core files. 
    // We use the standard (single-threaded) core to avoid COOP/COEP SharedArrayBuffer requirements.
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  }

  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

  // Run FFmpeg compression:
  // -vf "scale='min(720,iw)':-2" : scale down to 720p width if it's larger, maintaining aspect ratio. (The -2 ensures height is divisible by 2 for x264)
  // -c:v libx264 : use x264 encoder
  // -crf 28 : Constant Rate Factor (28 is good for web compression without losing too much quality)
  // -preset veryfast : Trade a tiny bit of size for faster encoding speed on the client CPU
  // -c:a aac -b:a 128k : Compress audio
  await ffmpeg.exec([
    '-i', inputName,
    '-vf', "scale='min(720,iw)':-2",
    '-c:v', 'libx264',
    '-crf', '28',
    '-preset', 'veryfast',
    '-c:a', 'aac',
    '-b:a', '128k',
    outputName
  ]);

  const data = await ffmpeg.readFile(outputName);
  
  // The output is a Uint8Array. Create a Blob and then a File object.
  const uint8Data = data as Uint8Array;
  const blob = new Blob([uint8Data as unknown as BlobPart], { type: 'video/mp4' });
  
  // Clean up the virtual file system
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  const originalNameBase = videoFile.name.replace(/\.[^/.]+$/, "");
  return new File([blob], `${originalNameBase}_compressed.mp4`, {
    type: 'video/mp4'
  });
};
