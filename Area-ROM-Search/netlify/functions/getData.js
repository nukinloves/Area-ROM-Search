exports.handler = async function () {

  const API_URL =
    "https://script.google.com/macros/s/AKfycbwcIXuDV3l0b-cHt968m3wVVnYXu6Q2BJgCKA9wHi6EXoj4WRiJRalV6kdn2o45Gy8/exec?action=getData";

  try {

    const response =
      await fetch(API_URL);

    if (!response.ok) {

      throw new Error(
        "Google Apps Script HTTP " +
        response.status
      );

    }

    const text =
      await response.text();


    /*
     * ตรวจสอบว่า Google Apps Script
     * ส่ง JSON กลับมาจริงหรือไม่
     */

    let data;

    try {

      data =
        JSON.parse(text);

    } catch (error) {

      console.error(
        "Google Apps Script response:",
        text
      );

      throw new Error(
        "Google Apps Script ไม่ได้ส่ง JSON"
      );

    }


    return {

      statusCode: 200,

      headers: {

        "Content-Type":
          "application/json",

        "Cache-Control":
          "no-cache"

      },

      body:
        JSON.stringify(data)

    };


  } catch (error) {

    console.error(
      "getData error:",
      error
    );


    return {

      statusCode: 500,

      headers: {

        "Content-Type":
          "application/json"

      },

      body:
        JSON.stringify({

          error:
            error.message

        })

    };

  }

};
