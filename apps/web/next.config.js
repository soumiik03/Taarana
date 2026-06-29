/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@repo/database", "pg"],
  allowedDevOrigins: ["vagabond-pretty-rift.ngrok-free.dev"],
  async rewrites() {
    const apiUrl = process.env.API_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/trpc/:path*",
        destination: `${apiUrl}/trpc/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
