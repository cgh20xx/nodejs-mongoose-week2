const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HttpControllers = require('./controllers/http');
const PostsControllers = require('./controllers/posts');
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
    PostsControllers.getPosts({ req, res });
  } else if (req.url === '/posts' && req.method === 'POST') {
    req.on('end', () => PostsControllers.createPost({ req, res, body }));
  } else if (req.url === '/posts' && req.method === 'DELETE') {
    PostsControllers.deletePosts({ req, res });
  } else if (req.url.startsWith('/posts/') && req.method === 'DELETE') {
    PostsControllers.deletePostById({ req, res });
  } else if (req.url.startsWith('/posts/') && req.method === 'PATCH') {
    req.on('end', async () =>
      PostsControllers.updatePostById({ req, res, body })
    );
  } else if (req.method == 'OPTIONS') {
    HttpControllers.cors(req, res);
  } else {
    HttpControllers.notFound(req, res);
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT);
