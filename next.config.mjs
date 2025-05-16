/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains:['lh3.googleusercontent.com']
    },
    // Ensure correct link handling in production
    trailingSlash: false,
    async rewrites() {
        return [
            {
                source: '/interview/:path*',
                destination: '/interview/:path*',
            },
        ];
    }
};

export default nextConfig;
