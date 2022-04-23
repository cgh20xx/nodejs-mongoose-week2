const mongoose = require('mongoose');
// mongoose schema 筆記：https://hackmd.io/@TFOivyvXT-qpG6SieUTfgw/ry2Lp9iV9

// 2. 建立 post schema
const postSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '貼文姓名未填寫'],
    },
    tags: [
      {
        type: String,
        required: [true, '貼文標籤 tags 未填寫'],
      },
    ],
    type: {
      type: String,
      enum: ['group', 'person'],
      required: [true, '貼文類型 type 未填寫'],
    },
    image: {
      type: String,
      default: '',
    },
    // 若不使用內建 timestamps: true，也可自定 createAt 規則。
    createAt: {
      type: Date,
      default: Date.now,
      select: false, // false 表不顯示此欄位。Model.find() 查不出來
    },
    content: {
      type: String,
      required: [true, 'Content 未填寫'],
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
  },
  {
    // versionKey: false, // 預設都會在 document 中加上 __v: 0，若不需要，可以設定 false
    // collection: 'posts', // 亦可直接寫死 collection 名字，不受預設小寫及結尾s影響。
    // timestamps: true, // mongoose 會自動新增 createdAt 和 updatedAt 欄位。
  }
);

// 3. 建立 post model
const PostModel = mongoose.model('Post', postSchema);
/* 
  注意：
  mongoose 會將 'Post' 轉換為 mongodb collection 的 'posts'。
  所有字母強制小寫。
  結尾強制加 s ，若結尾已有 s 則不會加。
*/
module.exports = PostModel;
