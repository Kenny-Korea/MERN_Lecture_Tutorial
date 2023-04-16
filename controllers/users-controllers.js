const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Max Schwarz",
    email: "test@test.com",
    password: "testers",
  },
];

// TODO. 회원가입
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  //! 비동기 작업에 throw 사용하면 안됨
  // if (!errors.isEmpty()) {
  //   throw new HttpError("Invalid inputs passed, please check your data.", 422);
  // }

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, email, password } = req.body;

  // TODO. 해당 email로 가입된 기록이 있는지 확인
  // uniqueValidator로 유효성 검사(중복 이메일)를 하지만, 기술적인 내용을 리턴 함
  // -> 유저 친화적인 인터페이스 구현을 위해 수동 유효성 검사 로직을 추가해야 함

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead",
      422
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image:
      "https://images.pexels.com/photos/15860716/pexels-photo-15860716.jpeg",
    password,
    places: [], // 새 장소가 추가되면 자동으로 배열에 추가됨
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again", 500);
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

// TODO. 로그인
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      401
    );
    return next(error);
  }

  res.json({ message: "Logged in!" });
};

// TODO. 모든 유저 정보 가져오기
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password"); // 비밀번호는 안가져오기 ("-")
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later",
      500
    );
    return next(error);
  }
  // res.json({ users: DUMMY_USERS });
  // find는 배열을 반환하므로, 바로 toObject 메소드 사용할 수 없음
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
