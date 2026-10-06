const https = require("https");

const API_URL =
  "https://script.google.com/macros/s/AKfycbwcIXuDV3l0b-cHt968m3wVVnYXu6Q2BJgCKA9wHi6EXoj4WRiJRalV6kdn2o45Gy8/exec?action=getData";


function request(url, redirectCount = 0) {

  return new Promise((resolve, reject) => {

    if (redirectCount > 10) {

      reject(
        new Error("Redirect มากเกินไป")
      );

      return;
    }


    https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0"
        }
      },
      response => {

        let body = "";


        response.on(
          "data",
          chunk => {

            body += chunk;

          }
        );


        response.on(
          "end",
          () => {

            /*
             * Google Apps Script มักส่ง
             * 301 / 302 / 303 / 307 / 308
             * แล้วค่อยไปยัง URL จริง
             */

            if (
              [301, 302, 303, 307, 308]
                .includes(response.statusCode)
            ) {

              const location =
                response.headers.location;


              if (!location) {

                reject(
                  new Error(
                    "พบ Redirect แต่ไม่มี Location"
                  )
                );

                return;

              }


              request(
                location,
                redirectCount + 1
              )
              .then(resolve)
              .catch(reject);


              return;

            }


            if (
              response.statusCode < 200 ||
              response.statusCode >= 300
            ) {

              reject(
                new Error(
                  "Google Apps Script HTTP " +
                  response.statusCode +
                  ": " +
                  body.substring(0, 500)
                )
              );

              return;

            }


            resolve(body);

          }
        );


      }
    ).on(
      "error",
      error => {

        reject(error);

      }
    );

  });

}


exports.handler = async function () {

  try {

    const body =
      await request(API_URL);


    /*
     * ตรวจสอบว่าเป็น JSON
     */

    let data;

    try {

      data =
        JSON.parse(body);

    } catch (error) {

      return {

        statusCode: 500,

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({

            error:
              "Google Apps Script ส่งข้อมูลไม่ใช่ JSON",

            response:
              body.substring(0, 1000)

          })

      };

    }


    /*
     * ส่ง JSON กลับไปให้เว็บไซต์
     */

    return {

      statusCode: 200,

      headers: {

        "Content-Type":
          "application/json",

        "Cache-Control":
          "no-cache, no-store, must-revalidate"

      },

      body:
        JSON.stringify(data)

    };


  } catch (error) {

    console.error(
      "Google Apps Script Error:",
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
            error.message || String(error)

        })

    };

  }

};
