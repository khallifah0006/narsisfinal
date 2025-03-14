const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "/index.js",  
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"  
    },
    mode: "development",
    devServer: {
        static: {
            directory: path.join(__dirname, "dist"),
        },
        port: 8080,
        historyApiFallback: true
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "index.html",
            filename: "index.html"
        }),
        new CopyWebpackPlugin({
            patterns: [
               
                
                { from: "service-worker.js", to: "service-worker.js" },
                { from: "manifest.json", to: "manifest.json" },
                { from: "styles.css", to: "styles.css" },
                { from: "db.js", to: "db.js" },
                { from: "icon512x512.png", to: "icon512x512.png" },
                { from: "icon192x192.png", to: "icon192x192.png" },
                { from: "desktop.png", to: "desktop.png" },
                { from: "mobile.png", to: "mobile.png" },
                { from: "add-icon.png", to: "add-icon.png" },
                { from: "404.html", to: "404.html" },
                { from: "favicon1.ico", to: "favicon1.ico" }

            ]
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            }
        ]
    }
};
