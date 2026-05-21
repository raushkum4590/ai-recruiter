/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns: [
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        ],
    },
    trailingSlash: false,
    env: {
        NEXT_PUBLIC_VERCEL_URL: 'https://ai-recruiter-nu.vercel.app',
    },
    async redirects() {
        return [
            { source: '/dashboard/scheduled-interviews', destination: '/scheduled-interviews', permanent: true },
            { source: '/dashboard/all-interview', destination: '/all-interview', permanent: true },
            { source: '/dashboard/analytics', destination: '/dashboard', permanent: true },
        ];
    },
};

export default nextConfig;
