const http = require('http');
const mongoose = require('mongoose');
const PostModel = require('./model/PostModel');
const dotenv = require('dotenv');
const handleError = require('./service/handleError');
const handleSuccess = require('./service/handleSuccess');
const headers = require('./service/headers');
const errorHandler = require('./service/handleError');
const successHandler = require('./service/handleSuccess');
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
    // 查詢所有資料 doc:https://mongoosejs.com/docs/api/model.html#model_Model.find
    const allPost = await PostModel.find();
    handleSuccess(res, allPost);
  } else if (req.url === '/posts' && req.method === 'POST') {
    // 新增單筆資料 doc:https://mongoosejs.com/docs/api/model.html#model_Model.create
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        data.content = data.content?.trim();
        if (!data.content) throw new Error('[新增失敗] content 未填寫');
        // 只開放新增 name tags type image conent
        const newPost = await PostModel.create({
          name: data.name,
          tags: data.tags,
          type: data.type,
          image: data.image,
          content: data.content,
        });
        handleSuccess(res, newPost);
      } catch (err) {
        handleError(res, err);
      }
    });
  } else if (req.url === '/posts' && req.method === 'DELETE') {
    // 刪除所有資料 doc:https://mongoosejs.com/docs/api/model.html#model_Model.deleteMany
    await PostModel.deleteMany({});
    handleSuccess(res, []);
  } else if (req.url.startsWith('/posts/') && req.method === 'DELETE') {
    try {
      // 刪除單筆資料 doc:https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndDelete
      const id = req.url.split('/').pop();
      const deletePostById = await PostModel.findByIdAndDelete(id);
      if (!deletePostById) throw new Error('[刪除失敗] 沒有此 id');
      handleSuccess(res, deletePostById);
    } catch (err) {
      errorHandler(res, err);
    }
  } else if (req.url.startsWith('/posts/') && req.method === 'PATCH') {
    // 修改單筆資料 doc:https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
    req.on('end', async () => {
      try {
        const id = req.url.split('/').pop();
        const data = JSON.parse(body);
        if (data.name) throw new Error('[修改失敗] 不可修改 name');
        if (!data.content) throw new Error('[修改失敗] content 未填寫');
        // 只開放修改 tags type image conent (name 不可改)
        const updatePostById = await PostModel.findByIdAndUpdate(
          id,
          {
            tags: data.tags,
            type: data.type,
            image: data.image,
            content: data.content,
          },
          {
            returnDocument: 'after', // 加這行才會返回更新後的資料，否則為更新前的資料。
          }
        );
        successHandler(res, updatePostById);
      } catch (err) {
        errorHandler(res, err);
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
