exports.handler = async function () {

  const API_URL =
    "https://script.google.com/macros/s/AKfycbwcIXuDV3l0b-cHt968m3wVVnYXu6Q2BJgCKA9wHi6EXoj4WRiJRalV6kdn2o45Gy8/exec?action=getData";

  try {

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Google Apps Script API Error");
    }

    const data = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: data
    };

  } catch (error) {

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: error.message
      })
    };

  }

};