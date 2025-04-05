const path = require('path');

module.exports = {
    // ... other configurations ...

    resolve: {
        fallback: {
            "url": require.resolve("url/"),
            "path": require.resolve("path-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "https": require.resolve("https-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "zlib": require.resolve("browserify-zlib"),
            "util": require.resolve("util/"),
            "buffer": require.resolve("buffer/"),
            "assert": require.resolve("assert/"),
            "process": require.resolve("process/browser"),
            "net": false, // or require.resolve('net-browserify') if you find a suitable polyfill
            "tls": false, // or require.resolve('tls-browserify') if you find a suitable polyfill
            "fs": false,   // most likely you don't need a polyfill for 'fs' in the browser
            "child_process": false, //likely not needed in browser
            "perf_hooks": false
        }
    },
    module: {
        rules: [
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: "javascript/auto"
            },
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"]
            }
        ]
    },
    node: {  // Add this section
        global: true,
    }
};
