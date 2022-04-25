const PostModel = require('../model/PostModel');
const handleError = require('../service/handleError');
const handleSuccess = require('../service/handleSuccess');
const post = {
  /**
   * 查詢所有資料
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.find
   * @param {Object} param
   */
  async getPosts({ req, res }) {
    const allPost = await PostModel.find();
    handleSuccess(res, allPost);
  },
  /**
   * 新增單筆資料
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.create
   * @param {Object} param
   */
  async createPost({ req, res, body }) {
    try {
      const data = JSON.parse(body);
      data.content = data.content?.trim(); // 頭尾去空白
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
  },
  /**
   * 刪除所有資料
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.deleteMany
   * @param {Object} param
   */
  async deletePosts({ req, res }) {
    await PostModel.deleteMany({});
    handleSuccess(res, []);
  },
  /**
   * 刪除單筆資料
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndDelete
   * @param {Object} param
   */
  async deletePostById({ req, res }) {
    try {
      const id = req.url.split('/').pop();
      const deletePostById = await PostModel.findByIdAndDelete(id);
      if (!deletePostById) throw new Error('[刪除失敗] 沒有此 id');
      handleSuccess(res, deletePostById);
    } catch (err) {
      handleError(res, err);
    }
  },
  /**
   * 修改單筆資料
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
   * @param {Object} param
   */
  async updatePostById({ req, res, body }) {
    try {
      const id = req.url.split('/').pop();
      const data = JSON.parse(body);
      data.content = data.content?.trim(); // 頭尾去空白
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
          // 加這行才會返回更新後的資料，否則為更新前的資料。
          returnDocument: 'after',
          // update 相關語法預設 runValidators: false，需手動設寪 true。Doc:https://mongoosejs.com/docs/validation.html#update-validators
          runValidators: true,
        }
      );
      if (!updatePostById) throw new Error('[修改失敗] 沒有此 id');
      handleSuccess(res, updatePostById);
    } catch (err) {
      handleError(res, err);
    }
  },
};
module.exports = post;
