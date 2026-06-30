/**
 * Dynamically resolves the API backend base URL.
 * 
 * Server-side (Vercel Serverless/Edge): Resolves process.env.API_URL,
 * process.env.NEXT_PUBLIC_API_URL, or defaults to localhost in dev.
 * Client-side: Uses empty string to allow relative pathing.
 */
export function getBackendUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000"
    );
  }
  return "";
}
