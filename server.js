const http = require('http');
const mongoose = require('mongoose');
const PostModel = require('./model/PostModel');
const dotenv = require('dotenv');
const headers = require('./service/headers');
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
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  if (req.url === '/posts' && req.method === 'GET') {
    // 查詢所有資料
    // Model.find() 文件：https://mongoosejs.com/docs/api/model.html#model_Model.find
    const posts = await PostModel.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        posts,
      })
    );
    res.end();
  } else if (req.url === '/posts' && req.method === 'POST') {
    // 新增單筆資料
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        console.log(data);
        if (data.content) {
          // 4. 新增資料方法2：使用 create()
          const newRoom = await PostModel.create({
            name: data.name,
            tags: data.tags,
            type: data.type,
            content: data.content,
          });
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: 'success',
              data: data,
            })
          );
          res.end();
        } else {
        }
      } catch (err) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: 'error',
            message: '欄位沒有正確，或沒有此 ID',
            error: err,
          })
        );
        res.end();
      }
    });
  } else if (req.url === '/posts' && req.method === 'DELETE') {
    // 刪除所有資料
    await PostModel.deleteMany({});
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        posts: [],
      })
    );
    res.end();
  } else if (req.url.startsWith('/posts/') && req.method === 'DELETE') {
    try {
      // 刪除單筆資料
      const id = req.url.split('/').pop();
      await PostModel.findByIdAndDelete(id);
      // 重新取得所有資料
      const posts = await PostModel.find();
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: 'success',
          posts: posts,
        })
      );
      res.end();
    } catch (err) {
      res.writeHead(400, headers);
      res.write(
        JSON.stringify({
          status: 'error',
          message: '欄位沒有正確，或沒有此 ID',
          error: err,
        })
      );
      res.end();
    }
  } else if (req.url.startsWith('/posts/') && req.method === 'PATCH') {
    // 修改單筆資料
    req.on('end', async () => {
      try {
        const id = req.url.split('/').pop();
        const data = JSON.parse(body);
        await PostModel.findByIdAndUpdate(id, {
          name: data.name,
        });
        // 重新取得所有資料
        const posts = await PostModel.find();
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: 'success',
            posts: posts,
          })
        );
        res.end();
      } catch (err) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: 'error',
            message: '欄位沒有正確，或沒有此 ID',
            error: err,
          })
        );
        res.end();
      }
    });
  } else if (req.method == 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: 'false',
        message: '無此網站路由',
      })
    );
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT);
