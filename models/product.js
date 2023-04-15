// https://mongoosejs.com/docs/guide.html

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

// 첫번째 인자 Product가 collection 이름이 됨
module.exports = mongoose.model("Product", productSchema);
