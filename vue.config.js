const path = require('path')
module.exports = {
    css: {
        extract: true
    },
    productionSourceMap: process.env.NODE_ENV === 'production' ? false : true,
    outputDir: process.env.VUE_APP_OUTPU_PATH,
    publicPath: process.env.VUE_APP_CDN_PATH,
    assetsDir: "res",
    indexPath: "index.html",
    // 打包优化
    configureWebpack: (config) => {
        if (process.env.NODE_ENV === 'development') {
            // 为开发环境修改配置...
            config.devtool = 'source-map';
        }

        config.externals = {
            // 排除一些包，不会打包进 vendor 中
            // 左侧为我们在业务中引入的包名， 右侧为对应库提供给外部引用的名字
            "vue": "Vue",
            "vue-router": "VueRouter",
            "vuex": "Vuex",
            "axios": "axios",
            "bootstrap-vue": "ToastPlugin",
        }
    },
    devServer: {
        overlay: {                                  // 让浏览器 overlay 同时显示警告和错误
            warnings: true,
            errors: true
        },
        host: "localhost",
        port: 8080,                                 // 端口号
        open: false,                                // 配置后自动启动浏览器
        hotOnly: true,                              // 热更新
        contentBase:path.join(__dirname, 'public'),
        proxy: {
            "/client": {
                target: "http://test.openatom.cn",
                changeOrigin: true,
                ws: true,
                secure: false,
                // pathRewrite: {
                //     "^/client": "/atom_services/openatom_client"
                // }
            },
            "/uploads": {
                target: "http://test.openatom.cn",
                changeOrigin: true,
                ws: true,
                secure: false,
                // pathRewrite: {
                //     "^/client": "/atom_services/openatom_client"
                // }
            },
        }
    },
}
