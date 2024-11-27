/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = {
  devIndicators: {
    autoPrerender: false,
  },
  env: {
    PORT: process.env.PORT || 3003
  },
}
