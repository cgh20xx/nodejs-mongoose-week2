const http = require('http');
// 1. 連接資料庫
require('./connections');
// 2. PostsControllers 裡已含建立 post schema 和 model
const PostsControllers = require('./controllers/posts');
const HttpControllers = require('./controllers/http');

const requestListener = async (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  if (req.url === '/posts' && req.method === 'GET') {
    // 查詢所有資料
    PostsControllers.getPosts({ req, res });
  } else if (req.url === '/posts' && req.method === 'POST') {
    // 新增單筆資料
    req.on('end', () => PostsControllers.createPost({ req, res, body }));
  } else if (req.url === '/posts' && req.method === 'DELETE') {
    // 刪除所有資料
    PostsControllers.deletePosts({ req, res });
  } else if (req.url.startsWith('/posts/') && req.method === 'DELETE') {
    // 刪除單筆資料
    PostsControllers.deletePostById({ req, res });
  } else if (req.url.startsWith('/posts/') && req.method === 'PATCH') {
    // 修改單筆資料
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
