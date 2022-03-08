// webpack.config.js
module.exports = [
  {
    mode: "development",
    entry: {
      main: "./src/main.ts",
      renderer: "./src/renderer.ts",
      preload: "./src/preload.ts",
    },
    target: "electron-main",
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: "ts-loader" }],
        },
      ],
    },
    output: {
      path: __dirname + "/dist",
      filename: "[name].js",
    },
    // watch: true,
    watchOptions: {
      aggregateTimeout: 200,
      poll: 1000,
    },
  },
];
