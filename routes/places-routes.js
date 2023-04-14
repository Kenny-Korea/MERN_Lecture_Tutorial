// TODO. routes는 어떤 route(url path)로 어떤 요청(GET, POST...)이 오면 어떤 함수(Controller)를 실행한다는 로직 담당

const express = require("express");
const { check } = require("express-validator");

const placesControllers = require("../controllers/places-controllers");

const router = express.Router();

// TODO. placesRoute의 기본 param은 /api/places 라고 app.js에 설정함
// 아래 두 route의 순서를 바꾸면 안됨 (더 구체적인 route를 뒤에 선언해야 함)
// /api/places/:pid
router.get("/:pid", placesControllers.getPlaceById);
// /api/places/user/:uid
router.get("/user/:uid", placesControllers.getPlacesByUserId);

// TODO. Express-validator(third-party library)를 통한 유효성 검사
// 자바스크립트로도 가능하지만, 편의를 위해 라이브러리 사용하는 것이 좋음
// 첫 번째 인자는 url
// 두 번째 인자부터는 미들웨어가 들어가는데, 개수는 상관 없고, 순서대로 미들웨어가 실행됨
// 해당 유효성 검사 자체만으로는 에러를 반환할 수 없음
// -> Controller에서 직접 에러를 반환할 수 있도록 작성해주어야 함 (validationResult)
router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.updatePlace
);

router.delete("/:pid", placesControllers.deletePlace);

// TODO. Node.js에서의 export 구문
module.exports = router;
