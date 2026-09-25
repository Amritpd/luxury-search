/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Same-origin /api/* -> API server. The browser never talks to the API
    // directly, so there's no CORS and no port-visibility fiddling
    // (e.g. in GitHub Codespaces). Set API_URL if the API isn't local.
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL ?? "http://localhost:3001"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
