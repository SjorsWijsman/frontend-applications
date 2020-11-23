// const rawData = ["LAND ROVER", 108, 32821, 304, 47, "43,5%", "LEXUS", 53, 21852, 412, 26, "49,1%", "AUDI", 674, 287176, 426, 218, "32,3%", "VOLKSWAGEN", 1514, 1045121, 690, 503, "33,2%", "BMW", 488, 357967, 734, 184, "37,7%", "FIAT", 403, 336249, 834, 139, "34,5%", "MERCEDES-BENZ", 404, 356857, 883, 153, "37,9%", "PORSCHE", 39, 39326, 1008, 14, "35,9%", "TOYOTA", 517, 603216, 1167, 164, "31,7%", "MINI", 78, 104384, 1338, 22, "28,2%", "RENAULT", 492, 660774, 1343, 215, "43,7%", "SEAT", 147, 215960, 1469, 67, "45,6%", "PEUGEOT", 387, 697193, 1802, 194, "50,1%", "ALFA ROMEO", 29, 57151, 1971, 18, "62,1%", "MAZDA", 75, 159327, 2124, 27, "36,0%", "FORD", 266, 613509, 2306, 130, "48,9%", "OPEL", 306, 732866, 2395, 202, "66,0%", "CITROEN", 168, 406261, 2418, 92, "54,8%", "VOLVO", 145, 370225, 2553, 80, "55,2%", "DAIHATSU", 21, 61491, 2928, 16, "76,2%", "HONDA", 27, 81895, 3033, 18, "66,7%", "NISSAN", 76, 235505, 3099, 43, "56,6%", "CHEVROLET", 24, 75099, 3129, 13, "54,2%", "MITSUBISHI", 43, 139115, 3235, 34, "79,1%", "SKODA", 59, 194952, 3304, 31, "52,5%", "KIA", 79, 284905, 3606, 66, "83,5%", "SUZUKI", 61, 270794, 4439, 38, "62,3%", "HYUNDAI", 59, 266909, 4524, 43, "72,9%", "OVERIGE", 179, 453590, 2534, 78, "43,6%"]
//
// const dataList = ["merk", "gestolen", "wagenpark", "diefstalrisico", "terug", "percentageTerug"];
// const dataPerGroup = dataList.length;
//
// const data = []
//
// for (var i = 0; i < rawData.length / dataPerGroup; i++) {
//   let dataObject = {}
//   for (var x = 0; x < dataPerGroup; x++) {
//     dataObject[dataList[x]] = rawData[i * dataPerGroup + x]
//   }
//   data.push(dataObject);
// }

export const diefstalrisico = [
  {
    "merk": "LAND ROVER",
    "gestolen": 108,
    "wagenpark": 32821,
    "diefstalrisico": 304,
    "terug": 47,
    "percentageTerug": "43,5%"
  },
  {
    "merk": "LEXUS",
    "gestolen": 53,
    "wagenpark": 21852,
    "diefstalrisico": 412,
    "terug": 26,
    "percentageTerug": "49,1%"
  },
  {
    "merk": "AUDI",
    "gestolen": 674,
    "wagenpark": 287176,
    "diefstalrisico": 426,
    "terug": 218,
    "percentageTerug": "32,3%"
  },
  {
    "merk": "VOLKSWAGEN",
    "gestolen": 1514,
    "wagenpark": 1045121,
    "diefstalrisico": 690,
    "terug": 503,
    "percentageTerug": "33,2%"
  },
  {
    "merk": "BMW",
    "gestolen": 488,
    "wagenpark": 357967,
    "diefstalrisico": 734,
    "terug": 184,
    "percentageTerug": "37,7%"
  },
  {
    "merk": "FIAT",
    "gestolen": 403,
    "wagenpark": 336249,
    "diefstalrisico": 834,
    "terug": 139,
    "percentageTerug": "34,5%"
  },
  {
    "merk": "MERCEDES-BENZ",
    "gestolen": 404,
    "wagenpark": 356857,
    "diefstalrisico": 883,
    "terug": 153,
    "percentageTerug": "37,9%"
  },
  {
    "merk": "PORSCHE",
    "gestolen": 39,
    "wagenpark": 39326,
    "diefstalrisico": 1008,
    "terug": 14,
    "percentageTerug": "35,9%"
  },
  {
    "merk": "TOYOTA",
    "gestolen": 517,
    "wagenpark": 603216,
    "diefstalrisico": 1167,
    "terug": 164,
    "percentageTerug": "31,7%"
  },
  {
    "merk": "MINI",
    "gestolen": 78,
    "wagenpark": 104384,
    "diefstalrisico": 1338,
    "terug": 22,
    "percentageTerug": "28,2%"
  },
  {
    "merk": "RENAULT",
    "gestolen": 492,
    "wagenpark": 660774,
    "diefstalrisico": 1343,
    "terug": 215,
    "percentageTerug": "43,7%"
  },
  {
    "merk": "SEAT",
    "gestolen": 147,
    "wagenpark": 215960,
    "diefstalrisico": 1469,
    "terug": 67,
    "percentageTerug": "45,6%"
  },
  {
    "merk": "PEUGEOT",
    "gestolen": 387,
    "wagenpark": 697193,
    "diefstalrisico": 1802,
    "terug": 194,
    "percentageTerug": "50,1%"
  },
  {
    "merk": "ALFA ROMEO",
    "gestolen": 29,
    "wagenpark": 57151,
    "diefstalrisico": 1971,
    "terug": 18,
    "percentageTerug": "62,1%"
  },
  {
    "merk": "MAZDA",
    "gestolen": 75,
    "wagenpark": 159327,
    "diefstalrisico": 2124,
    "terug": 27,
    "percentageTerug": "36,0%"
  },
  {
    "merk": "FORD",
    "gestolen": 266,
    "wagenpark": 613509,
    "diefstalrisico": 2306,
    "terug": 130,
    "percentageTerug": "48,9%"
  },
  {
    "merk": "OPEL",
    "gestolen": 306,
    "wagenpark": 732866,
    "diefstalrisico": 2395,
    "terug": 202,
    "percentageTerug": "66,0%"
  },
  {
    "merk": "CITROEN",
    "gestolen": 168,
    "wagenpark": 406261,
    "diefstalrisico": 2418,
    "terug": 92,
    "percentageTerug": "54,8%"
  },
  {
    "merk": "VOLVO",
    "gestolen": 145,
    "wagenpark": 370225,
    "diefstalrisico": 2553,
    "terug": 80,
    "percentageTerug": "55,2%"
  },
  {
    "merk": "DAIHATSU",
    "gestolen": 21,
    "wagenpark": 61491,
    "diefstalrisico": 2928,
    "terug": 16,
    "percentageTerug": "76,2%"
  },
  {
    "merk": "HONDA",
    "gestolen": 27,
    "wagenpark": 81895,
    "diefstalrisico": 3033,
    "terug": 18,
    "percentageTerug": "66,7%"
  },
  {
    "merk": "NISSAN",
    "gestolen": 76,
    "wagenpark": 235505,
    "diefstalrisico": 3099,
    "terug": 43,
    "percentageTerug": "56,6%"
  },
  {
    "merk": "CHEVROLET",
    "gestolen": 24,
    "wagenpark": 75099,
    "diefstalrisico": 3129,
    "terug": 13,
    "percentageTerug": "54,2%"
  },
  {
    "merk": "MITSUBISHI",
    "gestolen": 43,
    "wagenpark": 139115,
    "diefstalrisico": 3235,
    "terug": 34,
    "percentageTerug": "79,1%"
  },
  {
    "merk": "SKODA",
    "gestolen": 59,
    "wagenpark": 194952,
    "diefstalrisico": 3304,
    "terug": 31,
    "percentageTerug": "52,5%"
  },
  {
    "merk": "KIA",
    "gestolen": 79,
    "wagenpark": 284905,
    "diefstalrisico": 3606,
    "terug": 66,
    "percentageTerug": "83,5%"
  },
  {
    "merk": "SUZUKI",
    "gestolen": 61,
    "wagenpark": 270794,
    "diefstalrisico": 4439,
    "terug": 38,
    "percentageTerug": "62,3%"
  },
  {
    "merk": "HYUNDAI",
    "gestolen": 59,
    "wagenpark": 266909,
    "diefstalrisico": 4524,
    "terug": 43,
    "percentageTerug": "72,9%"
  },
  {
    "merk": "OVERIGE",
    "gestolen": 179,
    "wagenpark": 453590,
    "diefstalrisico": 2534,
    "terug": 78,
    "percentageTerug": "43,6%"
  }
]

export const diefstalrisicoTypes = [
  {
    "merk": "AUDI A1",
    "gestolen": 214,
    "wagenpark": 27449,
    "diefstalrisico": 128,
    "terug": 33,
    "percentageTerug": "15,4%",
  },
  {
    "merk": "TOYOTA C-HR",
    "gestolen": 120,
    "wagenpark": 15797,
    "diefstalrisico": 132,
    "terug": 22,
    "percentageTerug": "18,3%"
  },
  {
    "merk": "MERCEDES-BENZ E-KLASSE",
    "gestolen": 112,
    "wagenpark": 38947,
    "diefstalrisico": 348,
    "terug": 46,
    "percentageTerug": "41,1%",
  },
  {
    "merk": "FIAT 500",
    "gestolen": 222,
    "wagenpark": 94296,
    "diefstalrisico": 425,
    "terug": 44,
    "percentageTerug": "19,8%",
  },
  {
    "merk": "VOLKSWAGEN POLO",
    "gestolen": 584,
    "wagenpark": 277768,
    "diefstalrisico": 476,
    "terug": 168,
    "percentageTerug": "28,8%",
  },
  {
    "merk": "BMW 5ER REIHE",
    "gestolen": 121,
    "wagenpark": 59495,
    "diefstalrisico": 492,
    "terug": 48,
    "percentageTerug": "39,7%",
  },
  {
    "merk": "VOLKSWAGEN GOLF",
    "gestolen": 582,
    "wagenpark": 333040,
    "diefstalrisico": 572,
    "terug": 187,
    "percentageTerug": "32,1%",
  },
  {
    "merk": "AUDI A4",
    "gestolen": 107,
    "wagenpark": 66357,
    "diefstalrisico": 620,
    "terug": 42,
    "percentageTerug": "39,3%",
  },
  {
    "merk": "AUDI A3",
    "gestolen": 113,
    "wagenpark": 79094,
    "diefstalrisico": 700,
    "terug": 51,
    "percentageTerug": "45,1%",
  },
  {
    "merk": "BMW 3ER REIHE",
    "gestolen": 165,
    "wagenpark": 124034,
    "diefstalrisico": 752,
    "terug": 66,
    "percentageTerug": "40,0%",
  },
  {
    "merk": "TOTOTA AYGO",
    "gestolen": 148,
    "wagenpark": 147340,
    "diefstalrisico": 996,
    "terug": 42,
    "percentageTerug": "28,4%",
  },
  {
    "merk": "RENAULT MEGANE",
    "gestolen": 101,
    "wagenpark": 100866,
    "diefstalrisico": 999,
    "terug": 65,
    "percentageTerug": "64,4%",
  },
  {
    "merk": "RENAULT CLIO",
    "gestolen": 163,
    "wagenpark": 176225,
    "diefstalrisico": 1081,
    "terug": 62,
    "percentageTerug": "38,0%",
  },
  {
    "merk": "OPEL CORSA",
    "gestolen": 131,
    "wagenpark": 207961,
    "diefstalrisico": 1587,
    "terug": 89,
    "percentageTerug": "67,9%",
  },
]

export const diefstalrisicoHeaders = {
  "merk": {
    "title": "Merk/Type",
    "order": "descending",
    "inverted": false
  },
  "gestolen": {
    "title": "Aantal Gestolen",
    "order": "descending",
    "inverted": false
  },
  "wagenpark": {
    "title": "Totaal Wagenpark",
    "order": "descending",
    "inverted": false
  },
  "diefstalrisico": {
    "title": "Diefstalrisico 1 op ",
    "order": "ascending",
    "inverted": true
  },
  "terug": {
    "title": "Aantal Teruggevonden",
    "order": "ascending",
    "inverted": true
  },
  "percentageTerug": {
    "title": "Percentage Teruggevonden",
    "order": "ascending",
    "inverted": true
  }
}
