/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@repo/database", "pg"],
  allowedDevOrigins: ["vagabond-pretty-rift.ngrok-free.dev"],
  async rewrites() {
    return [
      {
        source: "/api/trpc/:path*",
        destination: "http://127.0.0.1:8000/trpc/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
