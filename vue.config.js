const path = require("path");
const pkg = require("./package.json");
// const CompressionWebpackPlugin = require("compression-webpack-plugin");
// const {applyMock} = require("./build/mock")

// const isProduction = process.env.NODE_ENV === "production";
module.exports = {
  outputDir: `dist_${process.env.VUE_APP_TITLE}-${process.env.NODE_ENV}`,
  // publicPath: process.env.VUE_APP_BASEURL,
  chainWebpack: chain => {
    if (pkg && pkg.version) {
      chain.plugin("define").tap(([options]) => {
        options["process.env"].VUE_APP_NAME = `"${pkg.name}"`;
        options["process.env"].VUE_APP_VERSION = `"${pkg.version}"`;
        return [options];
      });
    }
    chain.module
      .rule("svg")
      .include.add(path.resolve(__dirname, "./src/icons"));
    chain.module.rule("svg").uses.delete("file-loader");
    chain.module
      .rule("svg")
      .test(/\.(svg)(\?.*)?$/)
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]"
      });
    chain.module
      .rule("images")
      .use("url-loader")
      .loader("url-loader")
      .tap(options => {
        options.limit = 1;
        return options;
      });
  },
  configureWebpack: (config) => {
    const plugins = [];
    // if (isProduction) {
    //   plugins.push(
    //     // GZIP
    //     new CompressionWebpackPlugin({
    //       filename: "[path].gz[query]",
    //       algorithm: "gzip",
    //       test: /\.css$|\.ttf$|\.html$|\.svg$|\.json$|\.js$/,
    //       threshold: 0, // 只有大小大于该值的资源会被处理
    //       minRatio: 0.8, // 只有压缩率小于这个值的资源才会被处理
    //       deleteOriginalAssets: false // 删除原文件
    //     })
    //   );
    // }
    return {
      plugins,
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src")
        }
      },
      optimization: {
        splitChunks: {
          chunks: "all",
          /*     minSize: 0, //要生成的块的最小大小（以字节为单位）
              maxSize: 30000,
              minChunks: 1, //分割前必须共享模块的最小块数
              maxAsyncRequests: 5, //按需加载时的最大并行请求数
              maxInitialRequests: 3, //入口点处的最大并行请求数 */
          automaticNameDelimiter: "~",
          cacheGroups: {
            vendor: {
              name: "vendor",
              test: /[\\/]node_modules[\\/]/,
              minSize: 0,
              minChunks: 1,
              maxInitialRequests: 5,
              priority: 100,
              reuseExistingChunk: true
            },
            common: {
              name: "common",
              test: /[\\/]src[\\/]js[\\/]/,
              minSize: 0,
              minChunks: 2,
              maxInitialRequests: 5,
              priority: 60
            },
            styles: {
              name: "styles",
              test: /\.(sa|sc|c)ss$/,
              enforce: true
            }
          }
        }
      }
    };
  },
  css: {
    loaderOptions: {
      scss: {
        prependData: `@import "@/style/index.scss";`
      }
    }
  },
  // devServer 选项单独配置
  devServer: {
    https: false,
    proxy: {
      "/command-main": {
        target: "http://10.12.107.123:8081",
        changeOrigin: true
        // onProxyReq: function(proxyReq) {
        //   proxyReq.removeHeader("origin");
        // }
      },
      "/position-web": {
        target: "http://10.12.107.125:9098",
        changeOrigin: true
        // onProxyReq: function(proxyReq) {
        //   proxyReq.removeHeader("origin");
        // }
      },
      "/gis-plugins-web": {
        target: "http://10.12.107.125:9096",
        changeOrigin: true
      },
      "/ad-web": {
        target: "http://10.12.107.125:9097",
        changeOrigin: true,
        onProxyReq: function(proxyReq) {
          proxyReq.removeHeader("origin");
        }
      }
    // "/v2": {
    //   target: process.env.VUE_APP_API_URL,
    //   pathRewrite: {
    //     "^/v2": ""
    //   },
    //   secure: false,
    //   changeOrigin: true,
    //   logLevel: "debug"
    // } 
    }
    // before: app => {
    //   applyMock(app)
    // }
  }
};
