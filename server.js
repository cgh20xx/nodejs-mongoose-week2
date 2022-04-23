const http = require('http');
const mongoose = require('mongoose');
// const RoomModel = require('./model/room-model');
const dotenv = require('dotenv');
const headers = require('./headers');
dotenv.config({ path: './config.env' });
// DB_CONN 字串若要連到 Mongo Cloud 需登入該網站選擇 Database => Connect => Connect your application 取得
const dbConn = process.env.DB_CONN.replace(
  '<password>',
  process.env.DB_PASSWORD
);

// 1. 連接資料庫
mongoose
  .connect(dbConn)
  .then(() => {
    console.log('mongodb 連接成功');
  })
  .catch((error) => console.log(error));

const requestListener = async (req, res) => {
  console.log(req.url);
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT);
