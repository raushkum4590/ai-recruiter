/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains:['lh3.googleusercontent.com']
    },
    // Ensure correct link handling in production
    trailingSlash: false,
    // No rewrite or basePath needed as that might be causing issues
};

export default nextConfig;
