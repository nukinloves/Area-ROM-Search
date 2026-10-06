const https = require("https");

const GOOGLE_API =
  "https://script.google.com/macros/s/AKfycbwcIXuDV3l0b-cHt968m3wVVnYXu6Q2BJgCKA9wHi6EXoj4WRiJRalV6kdn2o45Gy8/exec?action=getData";


exports.handler = async function () {

  try {

    const result = await requestGoogle(GOOGLE_API);

    return {
      statusCode: 200,

      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },

      body: JSON.stringify(result)

    };

  } catch (error) {

    return {
      statusCode: 500,

      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },

      body: JSON.stringify({
        success: false,
        error: error.message,
        detail: error.detail || null
      })

    };

  }

};


/* =====================================================
   Google Request
===================================================== */

function requestGoogle(url, count = 0) {

  return new Promise((resolve, reject) => {

    if (count > 10) {

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
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36",

          "Accept":
            "application/json,text/plain,*/*",

          "Accept-Language":
            "th-TH,th;q=0.9,en;q=0.8"

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

            const status =
              response.statusCode || 0;

            const location =
              response.headers.location || null;

            const contentType =
              response.headers["content-type"] || null;


            /* ==========================
               Redirect
            ========================== */

            if (
              status >= 300 &&
              status < 400 &&
              location
            ) {

              let nextUrl = location;


              if (
                nextUrl.startsWith("/")
              ) {

                const base =
                  new URL(url);

                nextUrl =
                  base.origin +
                  nextUrl;

              }


              requestGoogle(
                nextUrl,
                count + 1
              )
                .then(resolve)
                .catch(reject);

              return;

            }


            /* ==========================
               ตรวจ JSON
            ========================== */

            try {

              const json =
                JSON.parse(body);

              resolve({

                success: true,

                httpStatus: status,

                contentType: contentType,

                data: json

              });

            }

            catch (e) {

              reject({

                message:
                  "Google Apps Script ส่งข้อมูลไม่ใช่ JSON",

                detail: {

                  httpStatus: status,

                  contentType: contentType,

                  location: location,

                  responsePreview:
                    body.substring(0, 1000)

                }

              });

            }

          }
        );

      }

    ).on(
      "error",
      error => {

        reject({

          message:
            "เชื่อมต่อ Google Apps Script ไม่สำเร็จ",

          detail: error.message

        });

      }
    );

  });

}
