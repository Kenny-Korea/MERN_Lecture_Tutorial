require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}P@tutorial.tdmxlo8.mongodb.net/products_test?retryWrites=true&w=majority`;

const createProduct = async (req, res, next) => {
  const newProduct = {
    name: req.body.name,
    price: req.body.price,
  };
  // MongoClient 인스턴스를 생성하는 것만으로는 MongoDB와 연결된 것은 아님
  const client = new MongoClient(url);
  try {
    // 아래의 connect 메소드로 MongoDB와 연결
    await client.connect();
    const db = client.db();
    const result = await db.collection("products").insertOne(newProduct);
  } catch (err) {
    return res.json({ message: "Could not store data" });
  }
  // 리소스 낭비를 줄이기 위해 작업이 완료되면 서버와의 연결을 종료해줘야 함
  client.close();

  res.json(newProduct);
};
const getProducts = async (req, res, next) => {
  const client = new MongoClient(url);
  let products;
  try {
    await client.connect();
    const db = client.db();
    products = await db.collection("products").find().toArray(); // toArray() : 데이터를 배열에 담아 반환
  } catch (err) {
    return res.json({ message: "Could not retrieve products" });
  }
  client.close();

  res.json(products);
};

exports.createProduct = createProduct;
exports.getProducts = getProducts;
