const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface ExtractionJob {
  job_id: string;
  status: string;
}

export interface FrameInfo {
  index: number;
  timestamp: number;
  url: string;
  width: number;
  height: number;
}

export interface VideoInfo {
  title: string;
  duration: number;
  channel: string;
  video_id: string;
}

export interface JobStatus {
  job_id: string;
  status: "queued" | "downloading" | "detecting_scenes" | "extracting_frames" | "uploading" | "completed" | "failed";
  video_info?: VideoInfo | null;
  frames?: FrameInfo[];
  total_frames?: number;
  error?: string;
}

/** Start frame extraction for a YouTube URL */
export async function startExtraction(youtubeUrl: string): Promise<ExtractionJob> {
  const res = await fetch(`${API_BASE}/api/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ youtube_url: youtubeUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Failed to start extraction");
  }
  return res.json();
}

/** Get current status of an extraction job */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch job status");
  return res.json();
}

/** Poll job status until completed or failed */
export function pollJobStatus(
  jobId: string,
  onUpdate: (status: JobStatus) => void,
  intervalMs = 2000
): () => void {
  let stopped = false;

  const poll = async () => {
    while (!stopped) {
      try {
        const status = await getJobStatus(jobId);
        onUpdate(status);
        if (status.status === "completed" || status.status === "failed") break;
      } catch {
        // silently retry on transient errors
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  };

  poll();

  return () => { stopped = true; };
}
