const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  // creator: { type: String, required: true }, // MongoDB가 id처럼 creator도 고유 id로 자동 생성해줌
  //! ref: 다른 스키마와 연결을 시켜주기 위해 사용
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" }, // MongoDB가 id처럼 creator도 고유 id로 자동 생성해줌
});

// Place -> places 으로 변경되어 컬렉션명으로 저장됨
module.exports = mongoose.model("Place", placeSchema); // model 메소드는 생성자 함수를 리턴함
