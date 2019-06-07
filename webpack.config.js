const path = require("path")

module.exports = {
    context: __dirname,
    entry: path.resolve("./distribution/app_IMPLEMENTATION.js"),
    output: {
        path: path.resolve("./static/"),
        filename: "bundle.js"
    }
}