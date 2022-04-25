// 1. 連接資料庫
require('./connections');

// 2. 建立路由
const routes = require('./routes');

// 為了模擬 express，app 為 http.createServer(requestListener) 的 requestListener。
const app = (req, res) => routes(req, res);
module.exports = app;
