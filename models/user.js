const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  // unique option 자체만으로는 중복 체크를 실행해주지 않음
  // -> mongoose-unique-validator 라이브러리 사용해야 함
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, required: true },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }], // MongoDB가 id처럼 creator도 고유 id로 자동 생성해줌
});

// 기존에 동일한 이메일이 있는지 체크하는 쿼리를 실행함
userSchema.plugin(uniqueValidator);

// Place -> places 으로 변경되어 컬렉션명으로 저장됨
module.exports = mongoose.model("User", userSchema); // model 메소드는 생성자 함수를 리턴함
