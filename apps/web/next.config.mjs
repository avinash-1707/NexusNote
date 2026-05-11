const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
const isProductionBuild = process.env.NODE_ENV === 'production'
const productionApiUrl = 'https://nexusnote.onrender.com'

if (isProductionBuild) {
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL must be set for production builds.')
  }

  let parsedApiUrl
  try {
    parsedApiUrl = new URL(apiUrl)
  } catch {
    throw new Error('NEXT_PUBLIC_API_URL must be a valid absolute URL.')
  }

  if (parsedApiUrl.hostname === 'localhost' || parsedApiUrl.hostname === '127.0.0.1') {
    throw new Error('NEXT_PUBLIC_API_URL must not point to localhost for production builds.')
  }

  if (parsedApiUrl.origin !== productionApiUrl) {
    throw new Error(`NEXT_PUBLIC_API_URL must be ${productionApiUrl} for production builds.`)
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default nextConfig
