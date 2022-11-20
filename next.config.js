const securityHeaders = [
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'require-corp',
  },
  {
    key: 'Access-Control-Allow-Origin',
    value: '*',
  },
]

module.exports = {
  reactStrictMode: process.env.NODE_ENV !== 'development',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  webpack(config) {
    config.experiments = { asyncWebAssembly: true }
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })
    return config
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
}