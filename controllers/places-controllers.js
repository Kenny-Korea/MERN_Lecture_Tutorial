// TODO. Controller는 미들웨어 함수의 정의를 담당(실질적인 백엔드 로직)

// const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1",
  },
];

// TODO. Read API - GET
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }

  // const place = DUMMY_PLACES.find((p) => {
  //   return p.id === placeId;
  // });
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place",
      500
    );
    return next(error);
  }

  // if (!place) {
  //   return res
  //     .status(404)
  //     .json({ message: "Could not find a place for the provided id." });
  // }

  // 동기적으로 작동하는 코드의 경우, throw new Error를 사용해도 되지만
  // 실제 DB에 접근하는 작업의 경우, 비동기로 작동하기 때문에 next()를 사용해야 함!!!
  // 아래 getPlacesByUserId 함수에서는 next()로 에러 반환
  if (!place) {
    // throw new HttpError("Could not find a place for the provided id.", 404);
    const error = new HttpError(
      "Could not find a place for the provided id",
      404
    );
    return next(error);
  }

  // TODO. MongoDB 객체를 사용자가 이용하기 쉬운 자바스크립트 객체로 변환하여 리턴
  res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let places;
  let userWithPlaces;
  try {
    // places = await Place.find({ creator: userId });
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later",
      500
    );
    return next(error);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }

  // res.json({ places });
  // 여기서는 toObject 메소드를 바로 사용할 수 없음 - find는 배열을 return 하기 때문
  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  }); // => { place } => { place: place }
};

// TODO. Create API - POST
const createPlace = async (req, res, next) => {
  // 유효하지 않으면 validationResult Array에 element가 추가됨
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // throw Error가 아닌 next(Error)인 이유
    // 비동기 작업에서는 Express가 throw를 제대로 실행하지 못함
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://images.pexels.com/photos/15860716/pexels-photo-15860716.jpeg",
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id", 404);
    return next(error);
  }

  console.log(user);

  try {
    // TODO. 둘 이상의 작업이 완료되어야 하는 경우, session과 transaction을 사용해야 함
    // 세션과 트랜잭션에 속하는 작업에 문제가 생기면, MongoDB가 모든 수정사항을 자동으로 롤백하게 됨!!!
    // 모든 작업이 완료되어야 성공적으로 업데이트 됨
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });

    // 아래의 push는 JS 내장 push 메소드가 아닌 Mongoose 메소드임
    // Mongoose가 createdPlace의 id만 저장해줌 (createdPlace.id 이런식으로 id 값에 접근하지 않아도 됨)
    await user.places.push(createdPlace);
    await user.save({ session: sess });
    sess.commitTransaction();

    // await createdPlace.save();
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error); // throw 구문은 해당 블록을 종료하나, throw 문이 없으므로 return문 사용
  }

  // 새로운 데이터가 추가됐음을 알리는 statusCode: 201
  res.status(201).json({ place: createdPlace });
};

// TODO. Update API - PATCH
const updatePlace = async (req, res, next) => {
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

  const { title, description } = req.body;
  const placeId = req.params.pid;

  // const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  // const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Updating place failed, please try again", 500);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError("Updating place failed, please try again", 500);
    return next(error);
  }

  // DUMMY_PLACES[placeIndex] = updatedPlace;

  // res.status(200).json({ place: updatedPlace });
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

// TODO. Delete API - DELETE
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  // if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
  //   throw new HttpError("Could not find a place for that id.", 404);
  // }
  // DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  let place;
  try {
    //! populate 함수
    // 다른 컬렉션에 저장된 문서를 참조하고, 그 컬렉션에 있는 다른 기존 문서의 데이터를 가지고 작업할 수 있음
    // 둘 이상의 컬렉션의 참조 관계(ref)가 설정되어야만 사용 가능
    // place와 user는 creator로 참조 관계(ref)를 정의했기 때문에 사용 가능
    // 콘솔에 찍어보면 place 정보 뿐만 아니라, user의 정보도 함께 출력되는 것을 볼 수 있음
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError("Deleting place failed, please try again", 500);
    return next(error);
  }

  // 장소의 존재 여부를 체크
  if (!place) {
    const error = new HttpError("Could not find place for this id", 404);
    return next(error);
  }

  try {
    // TODO 1. place 제거
    const sess = await mongoose.startSession();
    sess.startTransaction();
    console.log(place);
    // 강의에서는 remove 메소드를 사용했으나, 확인 결과 remove 메소드는 depricated 됨
    // deleteOne, deleteMany, findOneAndDelete 메소드 사용해야 함
    await place.deleteOne({ session: sess });
    // TODO 2. user의 places에서 해당 place 제거
    // Mongoose 메소드 pull
    await place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete the place",
      500
    );
    return next(error);
  }
  // Delete는 반환에 신경 쓸 필요 없으므로
  res.status(200).json({ message: "Deleted place." });
};

// TODO. module.export 구문은 단일 개체만 export 할 수 있으므로 아래와 같은 방법으로 복수 개체 export
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
