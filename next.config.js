/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["raw.githubusercontent.com"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Configure for large file uploads
  experimental: {
    serverComponentsExternalPackages: ['multer'],
  },
  // Increase API body size limit for large uploads
  api: {
    bodyParser: {
      sizeLimit: '10gb',
    },
    responseLimit: false,
  },
  // Configure webpack for large files
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    // Increase chunk size limit
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      maxSize: 10 * 1024 * 1024, // 10MB chunks
    };
    
    return config;
  },
};

module.exports = nextConfig;
