module.exports = {
  reactStrictMode: true,
  webpack(config) {
    config.experiments = { asyncWebAssembly: true }
    return config
  },
}
