const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTqZ-wlrqIB2aB4GoLiiUNk946EGiHCo0JZxPnDw08KMofmBs9g8z1L6JD2OYTEFaipCKR_AngY6Qv_/pub?output=csv";


exports.handler = async function () {

  try {

    // ดึงข้อมูลจาก Google Sheets CSV
    const response = await fetch(CSV_URL);

    if (!response.ok) {

      throw new Error(
        "Google Sheets HTTP " +
        response.status
      );

    }

    const csvText = await response.text();

    if (!csvText.trim()) {

      throw new Error(
        "Google Sheets ไม่มีข้อมูล"
      );

    }

    // แปลง CSV เป็น Array
    const data = parseCSV(csvText);

    return {

      statusCode: 200,

      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache"
      },

      body: JSON.stringify(data)

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
   CSV Parser
===================================================== */

function parseCSV(text) {

  const rows = [];

  let row = [];

  let cell = "";

  let insideQuotes = false;


  for (let i = 0; i < text.length; i++) {

    const char = text[i];

    const next = text[i + 1];


    // เครื่องหมาย "
    if (char === '"') {

      // ถ้าเป็น "" ภายในข้อความ = "
      if (
        insideQuotes &&
        next === '"'
      ) {

        cell += '"';

        i++;

      } else {

        insideQuotes =
          !insideQuotes;

      }

      continue;

    }


    // จุลภาค
    if (
      char === "," &&
      !insideQuotes
    ) {

      row.push(cell);

      cell = "";

      continue;

    }


    // ขึ้นบรรทัดใหม่
    if (
      (char === "\n" || char === "\r") &&
      !insideQuotes
    ) {

      // รองรับ \r\n
      if (
        char === "\r" &&
        next === "\n"
      ) {
        i++;
      }

      row.push(cell);

      rows.push(row);

      row = [];

      cell = "";

      continue;

    }


    cell += char;

  }


  // ข้อมูลตัวสุดท้าย
  if (
    cell !== "" ||
    row.length > 0
  ) {

    row.push(cell);

    rows.push(row);

  }


  if (rows.length === 0) {
    return [];
  }


  // แถวแรก = Header
  const headers = rows[0].map(
    header =>
      header
        .replace(/^\uFEFF/, "")
        .trim()
  );


  // แปลงเป็น Object
  return rows
    .slice(1)
    .filter(row =>
      row.some(
        value =>
          value.trim() !== ""
      )
    )
    .map(row => {

      const obj = {};

      headers.forEach(
        (header, index) => {

          obj[header] =
            row[index] !== undefined
              ? row[index].trim()
              : "";

        }
      );

      return obj;

    });

}
