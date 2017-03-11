var lib = "commonjs2"; // commonjs amd root commonjs2
module.exports = {
  entry: './index.es6',
  target: 'node',
  externals: {
    async: {
      commonjs2: "async",
      amd: "async",
      commonjs: "async",
      root: "async",
      global: "async"
    },
    redis: {
      commonjs2: "redis",
      amd: "redis",
      commonjs: "redis",
      root: "redis",
      global: "redis"
    },
    uuid: {
      commonjs2: "uuid",
      amd: "uuid",
      commonjs: "uuid",
      root: "uuid",
      global: "uuid"
    }
  },
  output: {
    filename: 'index.js',
    libraryTarget: "commonjs" // commonjs-module umd
  }
}