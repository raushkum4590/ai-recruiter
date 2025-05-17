/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains:['lh3.googleusercontent.com']
    },
    // Ensure correct link handling in production
    trailingSlash: false,
    // Add the production URL as an environment variable
    env: {
        NEXT_PUBLIC_VERCEL_URL: 'https://ai-recruiter-nu.vercel.app',
    }
};

export default nextConfig;
