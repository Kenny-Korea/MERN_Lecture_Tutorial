// mongoose를 사용하지 않았을 때(mongo.js)는 아래와 같은 불편한 점들이 있음
// 1. 매번 mongoClient를 생성해줘야 함
// 2. 매번 connection을 시켜줘야 함
// 3. 매번 connection을 종료해줘야 함

require("dotenv").config();

const mongoose = require("mongoose");

const Product = require("./models/product");
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}P@tutorial.tdmxlo8.mongodb.net/products_test?retryWrites=true&w=majority`;

mongoose
  .connect(url)
  .then(() => {
    console.log("connected to database!");
  })
  .catch(() => {
    console.log("connection failed!");
  });

const createProduct = async (req, res, next) => {
  // mongoose 사용 전에는 collection을 지정하고 insertOne 메소드를 사용하여 저장하였으나
  // mongoose 사용 시에는 model 객체를 생성하고 save 메소드를 사용하면 model에서 정의한 내용대로 컬렉션에 저장됨
  const createdProduct = new Product({
    name: req.body.name,
    price: req.body.price,
  });
  const result = await createdProduct.save(); // 비동기 작업
  res.json(result);
};

const getProducts = async (req, res, next) => {
  // mongoose의 find 메서드는 기본적으로 배열 형태로 반환되므로, toArray와 같은 메소드를 사용하지 않아도 됨
  // Promise로 변환을 위해 exec 메소드 사용이 필요함
  const fetchedProducts = await Product.find().exec();
  res.json(fetchedProducts);
};

exports.createProduct = createProduct;
exports.getProducts = getProducts;
