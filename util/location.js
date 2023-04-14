const axios = require("axios");

const HttpError = require("../models/http-error");

// https://developers.google.com/maps/documentation/geocoding/start?hl=ko#geocoding-request-and-response-latitudelongitude-lookup

async function getCoordsForAddress(address) {
  // return {
  //   lat: 40.7484474,
  //   lng: -73.9871516
  // };
  const response = await axios.get(
    // encodeURIComponent : 특수문자나 공백을 없애기 위해 사용하는 내장 메소드
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=apiKey`
  );

  const data = response.data;
  console.log(data);

  // 데이터가 없을 때 Google은 ZERO_RESULTS 라는 status 반환
  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Could not find location for the specified address.",
      422
    );
    throw error;
  }

  const coordinates = data.results[0].geometry.location;
  console.log(data.results[0]);
  return coordinates;
}

// getCoordsForAddress()가 아니라 getCoordsForAddress인 이유
// 함수를 실행하는 것이 아닌, 다른 파일에서 실행될 수 있도록 포인터로 함수를 가리키는 것임
module.exports = getCoordsForAddress;
