/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side webpack configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        assert: false,
        constants: false,
        domain: false,
        http: false,
        https: false,
        querystring: false,
        url: false,
        zlib: false,
        punycode: false,
        string_decoder: false,
        tty: false,
        vm: false,
        child_process: false,
        cluster: false,
        dgram: false,
        dns: false,
        net: false,
        readline: false,
        repl: false,
        string_decoder: false,
        sys: false,
        timers: false,
        tls: false,
        tty: false,
        udp: false,
        v8: false,
        worker_threads: false,
      };

      // Handle node: protocol imports
      config.resolve.alias = {
        ...config.resolve.alias,
        "node:fs": false,
        "node:fs/promises": false,
        "node:path": false,
        "node:os": false,
        "node:crypto": false,
        "node:stream": false,
        "node:util": false,
        "node:buffer": false,
        "node:events": false,
        "node:assert": false,
        "node:constants": false,
        "node:domain": false,
        "node:http": false,
        "node:https": false,
        "node:querystring": false,
        "node:url": false,
        "node:zlib": false,
        "node:punycode": false,
        "node:string_decoder": false,
        "node:tty": false,
        "node:vm": false,
        "node:child_process": false,
        "node:cluster": false,
        "node:dgram": false,
        "node:dns": false,
        "node:net": false,
        "node:readline": false,
        "node:repl": false,
        "node:sys": false,
        "node:timers": false,
        "node:tls": false,
        "node:udp": false,
        "node:v8": false,
        "node:worker_threads": false,
      };
    }
    return config;
  },
};

export default nextConfig;
