/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@repo/database", "pg"],
  async rewrites() {
    return [
      {
        source: "/api/trpc/:path*",
        destination: "http://localhost:8000/trpc/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
