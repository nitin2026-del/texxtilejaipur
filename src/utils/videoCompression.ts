import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const compressVideo = async (
  videoFile: File,
  onProgress?: (progress: number) => void
): Promise<File> => {
  try {
    if (!ffmpeg) {
      ffmpeg = new FFmpeg();
      ffmpeg.on('progress', ({ progress }) => {
        if (onProgress) onProgress(progress);
      });
      
      ffmpeg.on('log', ({ message }) => {
        console.log('FFmpeg log:', message);
      });

      // Use unpkg CDN to load the core files. 
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      console.log('Loading FFmpeg core...');
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      console.log('FFmpeg core loaded successfully.');
    }

    const inputName = 'input.mp4';
    const outputName = 'output.mp4';

    console.log('Writing file to FFmpeg FS...');
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

    console.log('Running FFmpeg compression...');
    const code = await ffmpeg.exec([
      '-i', inputName,
      '-vf', "scale='min(720,iw)':-2",
      '-c:v', 'libx264',
      '-crf', '28',
      '-preset', 'veryfast',
      '-c:a', 'aac',
      '-b:a', '128k',
      outputName
    ]);

    if (code !== 0) {
      console.warn(`FFmpeg exited with code ${code}, falling back to original file`);
      return videoFile;
    }

    console.log('Reading compressed file from FS...');
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
  } catch (error) {
    console.error('Video compression failed, falling back to original file:', error);
    return videoFile; // Fallback to the original uncompressed file
  }
};
