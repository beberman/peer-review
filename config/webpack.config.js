module.exports = {
  // Other configurations...
  cache: {
    type: 'filesystem', // Enables file system caching
    buildDependencies: {
      config: [__filename], // Tracks dependencies for rebuilds
    },
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[contenthash].js',
  },
  devServer: {
    watchFiles: {
      paths: ['src/**/*'],
    },
    hot: true,
    liveReload: true,
  },
};
