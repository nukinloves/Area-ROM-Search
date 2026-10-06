const https = require("https");

const GOOGLE_API =
  "https://script.google.com/macros/s/AKfycbwcIXuDV3l0b-cHt968m3wVVnYXu6Q2BJgCKA9wHi6EXoj4WRiJRalV6kdn2o45Gy8/exec?action=getData";


exports.handler = async function () {

  try {

    const result = await fetchGoogleAPI(GOOGLE_API);

    if (!result) {
      throw new Error("ไม่ได้รับข้อมูลจาก Google Apps Script");
    }

    // Google Apps Script ส่งกลับมาเป็น
    // { success: true, data: [...] }

    if (result.success !== true) {

      throw new Error(
        result.error || "Google Apps Script แจ้งข้อผิดพลาด"
      );

    }

    return {

      statusCode: 200,

      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache"
      },

      body: JSON.stringify(
        result.data || []
      )

    };

  }

  catch (error) {

    console.error(error);

    return {

      statusCode: 500,

      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },

      body: JSON.stringify({

        success: false,

        error: error.message

      })

    };

  }

};


/* =====================================================
   เรียก Google Apps Script
   รองรับ Redirect ของ Google
===================================================== */

function fetchGoogleAPI(url, redirectCount = 0) {

  return new Promise((resolve, reject) => {

    if (redirectCount > 5) {
      reject(
        new Error("Google API Redirect มากเกินไป")
      );
      return;
    }

    https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      },
      (response) => {

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


            /* =========================
               ถ้า Google Redirect
            ========================= */

            if (
              status >= 300 &&
              status < 400 &&
              response.headers.location
            ) {

              let redirectUrl =
                response.headers.location;


              // รองรับ relative URL
              if (
                redirectUrl.startsWith("/")
              ) {

                const base =
                  new URL(url);

                redirectUrl =
                  base.origin +
                  redirectUrl;

              }


              fetchGoogleAPI(
                redirectUrl,
                redirectCount + 1
              )
                .then(resolve)
                .catch(reject);

              return;

            }


            /* =========================
               HTTP Error
            ========================= */

            if (
              status < 200 ||
              status >= 300
            ) {

              reject(
                new Error(
                  "Google API HTTP " +
                  status
                )
              );

              return;

            }


            /* =========================
               แปลง JSON
            ========================= */

            try {

              const json =
                JSON.parse(body);

              resolve(json);

            }

            catch (error) {

              reject(

                new Error(
                  "Google Apps Script ส่งข้อมูลไม่ใช่ JSON"
                )

              );

            }

          }
        );

      }
    )

    .on(
      "error",
      error => {
        reject(error);
      }
    );

  });

}
