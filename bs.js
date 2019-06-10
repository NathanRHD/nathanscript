var historyApiFallback = require('connect-history-api-fallback')
/*
|--------------------------------------------------------------------------
| Browser-sync config file
|--------------------------------------------------------------------------
|
| For up-to-date information about the options:
|   http://www.browsersync.io/docs/options/
|
| There are more options than you see here, these are just the ones that are
| set internally. See the website for more info.
|
|
*/
module.exports = {
    "notify": false,
    "open": false,
    "ui": {
        "port": 3112,
        "weinre": {
            "port": 8080
        }
    },
    "files": "static",
    "watchEvents": [
        "change"
    ],
    "watchOptions": {
        "ignoreInitial": true
    },
    "server": "static",
    "port": 3111,
    "middleware": [
        historyApiFallback()
    ]
};