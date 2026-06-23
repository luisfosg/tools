export const COUNTRIES = {
  AR: {
    name: "Argentina",
    code: "+54",
    flag: "🇦🇷",
    trunk: "0",
    prefixGroups: [
      {
        label: "Nacional",
        dialCodes: [
          "11", "22", "23", "24", "26", "27", "28", "29",
          "33", "34", "35", "37", "38", "46", "47",
          "52", "53", "54", "55", "56", "57", "58", "59",
          "61", "62", "63", "64", "65", "66", "67", "68", "69",
          "71", "72", "73", "74", "75", "76", "77", "78", "79",
          "81", "82", "83", "84", "85", "86", "87", "88", "89",
          "91", "92", "93", "94", "95", "96", "97", "98", "99",
        ],
        dialLen: 2,
        subLen: 8,
        subGroups: [4, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+54{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+54 {prefix} {sub}" },
      national: { label: "Nacional", template: "0{prefix} {sub}" },
      pretty: { label: "Con formato", template: "+54 ({prefix}) {sub}" },
    },
    example: "11 5555 1234",
  },

  US: {
    name: "United States",
    code: "+1",
    flag: "🇺🇸",
    trunk: "1",
    prefixGroups: [
      {
        label: "Área",
        dialCodes: [
          "201", "202", "212", "213", "305", "310", "312", "315",
          "347", "408", "412", "415", "424", "510", "512", "516",
          "617", "626", "646", "702", "713", "714", "718", "747",
          "773", "786", "805", "815", "818", "832", "847", "858",
          "862", "863", "908", "909", "914", "917", "919", "929",
          "949", "954", "956", "972", "978", "985",
        ],
        dialLen: 3,
        subLen: 7,
        subGroups: [3, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+1{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+1 {prefix} {sub}" },
      national: { label: "Nacional", template: "1 {prefix} {sub}" },
      pretty: { label: "Con formato", template: "+1 ({prefix}) {sub}" },
    },
    example: "212 555 1234",
  },

  MX: {
    name: "Mexico",
    code: "+52",
    flag: "🇲🇽",
    trunk: "01",
    prefixGroups: [
      {
        label: "Área",
        dialCodes: [
          "55", "33", "81", "22", "44", "47", "42", "61",
          "66", "77", "83", "84", "86", "87", "99", "62",
          "46", "67", "41", "63",
        ],
        dialLen: 2,
        subLen: 8,
        subGroups: [4, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+52{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+52 {prefix} {sub}" },
      national: { label: "Nacional", template: "01 {prefix} {sub}" },
      pretty: { label: "Con formato", template: "+52 ({prefix}) {sub}" },
    },
    example: "55 1234 5678",
  },

  ES: {
    name: "Spain",
    code: "+34",
    flag: "🇪🇸",
    trunk: "",
    prefixGroups: [
      {
        label: "Fijo",
        dialCodes: [
          "91", "93", "95", "96", "97", "98", "94", "92",
          "81", "82", "83", "84", "85", "86", "88",
        ],
        dialLen: 2,
        subLen: 7,
        subGroups: [3, 4],
      },
      {
        label: "Móvil",
        dialCodes: ["6", "7"],
        dialLen: 1,
        subLen: 8,
        subGroups: [4, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+34{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+34 {prefix} {sub}" },
      national: { label: "Nacional", template: "{prefix} {sub}" },
      pretty: { label: "Con formato", template: "+34 ({prefix}) {sub}" },
    },
    example: "91 555 1234",
  },

  CO: {
    name: "Colombia",
    code: "+57",
    flag: "🇨🇴",
    trunk: "0",
    prefixGroups: [
      {
        label: "Móvil",
        dialCodes: [
          "300", "301", "302", "303", "304", "305",
          "310", "311", "312", "313", "314", "315", "316", "317", "318", "319",
          "320", "321", "322", "323", "324",
          "350", "351",
        ],
        dialLen: 3,
        subLen: 7,
        subGroups: [3, 4],
      },
      {
        label: "Fijo (Bogotá)",
        dialCodes: ["1"],
        dialLen: 1,
        subLen: 7,
        subGroups: [3, 4],
      },
      {
        label: "Fijo (Medellín)",
        dialCodes: ["4"],
        dialLen: 1,
        subLen: 7,
        subGroups: [3, 4],
      },
      {
        label: "Fijo (Otras)",
        dialCodes: ["2", "5", "6", "7", "8"],
        dialLen: 1,
        subLen: 7,
        subGroups: [3, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+57{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+57 {prefix} {sub}" },
      national: { label: "Nacional", template: "0{prefix} {sub}" },
      pretty: { label: "Con formato", template: "+57 ({prefix}) {sub}" },
    },
    example: "300 555 1234",
  },

  CL: {
    name: "Chile",
    code: "+56",
    flag: "🇨🇱",
    trunk: "0",
    prefixGroups: [
      {
        label: "Móvil",
        dialCodes: ["9"],
        dialLen: 1,
        subLen: 8,
        subGroups: [4, 4],
      },
      {
        label: "Fijo (Santiago)",
        dialCodes: ["2"],
        dialLen: 1,
        subLen: 8,
        subGroups: [4, 4],
      },
      {
        label: "Fijo (Otras)",
        dialCodes: [
          "32", "33", "34", "35",
          "41", "42", "43", "44", "45",
          "51", "52", "53", "55", "57",
          "61", "63", "64", "65", "66", "67",
          "71", "72", "73", "75", "77",
        ],
        dialLen: 2,
        subLen: 7,
        subGroups: [3, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+56{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+56 {prefix} {sub}" },
      national: { label: "Nacional", template: "0{prefix} {sub}" },
      pretty: { label: "Con formato", template: "+56 ({prefix}) {sub}" },
    },
    example: "9 5555 1234",
  },

  PE: {
    name: "Peru",
    code: "+51",
    flag: "🇵🇪",
    trunk: "0",
    prefixGroups: [
      {
        label: "Móvil",
        dialCodes: ["9"],
        dialLen: 1,
        subLen: 8,
        subGroups: [4, 4],
      },
      {
        label: "Lima",
        dialCodes: ["1"],
        dialLen: 1,
        subLen: 8,
        subGroups: [4, 4],
      },
      {
        label: "Provincias",
        dialCodes: ["4", "5", "6", "7", "8"],
        dialLen: 1,
        subLen: 8,
        subGroups: [4, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+51{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+51 {prefix} {sub}" },
      national: { label: "Nacional", template: "0{prefix} {sub}" },
      pretty: { label: "Con formato", template: "+51 ({prefix}) {sub}" },
    },
    example: "9 5555 1234",
  },

  UY: {
    name: "Uruguay",
    code: "+598",
    flag: "🇺🇾",
    trunk: "0",
    prefixGroups: [
      {
        label: "Montevideo",
        dialCodes: ["2"],
        dialLen: 1,
        subLen: 7,
        subGroups: [3, 4],
      },
      {
        label: "Móvil",
        dialCodes: ["9"],
        dialLen: 1,
        subLen: 7,
        subGroups: [3, 4],
      },
      {
        label: "Interior",
        dialCodes: ["4"],
        dialLen: 1,
        subLen: 7,
        subGroups: [3, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+598{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+598 {prefix} {sub}" },
      national: { label: "Nacional", template: "0{prefix} {sub}" },
      pretty: { label: "Con formato", template: "+598 ({prefix}) {sub}" },
    },
    example: "2 555 1234",
  },

  BR: {
    name: "Brazil",
    code: "+55",
    flag: "🇧🇷",
    trunk: "0",
    prefixGroups: [
      {
        label: "Móvel",
        dialCodes: [
          "11", "21", "31", "41", "51", "61", "71", "81", "91",
          "12", "13", "14", "15", "16", "17", "18", "19",
          "22", "24", "27", "28",
          "32", "33", "34", "35", "37", "38",
          "42", "43", "44", "45", "46", "47", "48", "49",
          "53", "54", "55",
          "62", "63", "64", "65", "66", "67", "68", "69",
          "73", "74", "75", "77", "79",
          "82", "83", "84", "85", "86", "87", "88", "89",
          "92", "93", "94", "95", "96", "97", "98", "99",
        ],
        dialLen: 2,
        subLen: 9,
        subGroups: [1, 4, 4],
      },
      {
        label: "Fixo",
        dialCodes: [
          "11", "21", "31", "41", "51", "61", "71", "81", "91",
          "12", "13", "14", "15", "16", "17", "18", "19",
          "22", "24", "27", "28",
          "32", "33", "34", "35", "37", "38",
          "42", "43", "44", "45", "46", "47", "48", "49",
          "53", "54", "55",
          "62", "63", "64", "65", "66", "67", "68", "69",
          "73", "74", "75", "77", "79",
          "82", "83", "84", "85", "86", "87", "88", "89",
          "92", "93", "94", "95", "96", "97", "98", "99",
        ],
        dialLen: 2,
        subLen: 8,
        subGroups: [4, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+55{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+55 {prefix} {sub}" },
      national: { label: "Nacional", template: "0{prefix} {sub}" },
      pretty: { label: "Con formato", template: "+55 ({prefix}) {sub}" },
    },
    example: "11 9 5555 1234",
  },

  GB: {
    name: "United Kingdom",
    code: "+44",
    flag: "🇬🇧",
    trunk: "0",
    prefixGroups: [
      {
        label: "Londres",
        dialCodes: ["20"],
        dialLen: 2,
        subLen: 8,
        subGroups: [4, 4],
      },
      {
        label: "Ciudades grandes",
        dialCodes: ["28", "29", "31", "33", "41", "44", "48", "49", "51", "61"],
        dialLen: 2,
        subLen: 8,
        subGroups: [4, 4],
      },
      {
        label: "Móvil",
        dialCodes: ["77", "78", "79"],
        dialLen: 2,
        subLen: 8,
        subGroups: [4, 4],
      },
      {
        label: "Otros",
        dialCodes: ["80", "82", "84", "85", "87", "90", "91", "92", "93", "94", "95"],
        dialLen: 2,
        subLen: 8,
        subGroups: [4, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+44{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+44 {prefix} {sub}" },
      national: { label: "Nacional", template: "0{prefix} {sub}" },
      pretty: { label: "Con formato", template: "+44 ({prefix}) {sub}" },
    },
    example: "20 7946 0123",
  },

  CA: {
    name: "Canada",
    code: "+1",
    flag: "🇨🇦",
    trunk: "1",
    prefixGroups: [
      {
        label: "Área",
        dialCodes: [
          "204", "226", "236", "249", "250", "289",
          "306", "343", "365", "367",
          "403", "416", "418", "431", "437", "438",
          "450", "506", "514", "519", "548", "579",
          "581", "587", "604", "613", "639", "647",
          "705", "709", "778", "780", "782",
          "807", "819", "825", "867", "873", "902", "905",
        ],
        dialLen: 3,
        subLen: 7,
        subGroups: [3, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+1{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+1 {prefix} {sub}" },
      national: { label: "Nacional", template: "1 {prefix} {sub}" },
      pretty: { label: "Con formato", template: "+1 ({prefix}) {sub}" },
    },
    example: "416 555 1234",
  },

  FR: {
    name: "France",
    code: "+33",
    flag: "🇫🇷",
    trunk: "0",
    prefixGroups: [
      {
        label: "Nacional",
        dialCodes: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        dialLen: 1,
        subLen: 8,
        subGroups: [2, 2, 2, 2],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+33{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+33 {prefix} {sub}" },
      national: { label: "Nacional", template: "0{prefix} {sub}" },
      pretty: { label: "Con formato", template: "+33 ({prefix}) {sub}" },
    },
    example: "6 12 34 56 78",
  },

  DE: {
    name: "Germany",
    code: "+49",
    flag: "🇩🇪",
    trunk: "0",
    prefixGroups: [
      {
        label: "Grandes ciudades",
        dialCodes: ["30", "40", "69", "89"],
        dialLen: 2,
        subLen: 9,
        subGroups: [4, 5],
      },
      {
        label: "Ciudades",
        dialCodes: [
          "201", "211", "221", "231", "241", "251", "261",
          "271", "281", "291",
          "351", "361", "371", "381", "391",
        ],
        dialLen: 3,
        subLen: 8,
        subGroups: [4, 4],
      },
      {
        label: "Móvil",
        dialCodes: ["151", "152", "160", "162", "163", "170", "171", "172", "173", "174", "175", "176", "177", "178", "179"],
        dialLen: 3,
        subLen: 8,
        subGroups: [4, 4],
      },
      {
        label: "Otras",
        dialCodes: [
          "511", "521", "531", "541", "551", "561",
          "711", "721", "731", "741", "751", "761",
          "811", "821", "831", "841", "851", "861", "871", "881", "891",
        ],
        dialLen: 3,
        subLen: 8,
        subGroups: [4, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+49{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+49 {prefix} {sub}" },
      national: { label: "Nacional", template: "0{prefix} {sub}" },
      pretty: { label: "Con formato", template: "+49 ({prefix}) {sub}" },
    },
    example: "30 1234 5678",
  },

  IT: {
    name: "Italy",
    code: "+39",
    flag: "🇮🇹",
    trunk: "",
    prefixGroups: [
      {
        label: "Roma / Milano",
        dialCodes: ["06", "02"],
        dialLen: 2,
        subLen: 8,
        subGroups: [4, 4],
      },
      {
        label: "Grandes ciudades",
        dialCodes: ["010", "011", "015", "016", "017", "019"],
        dialLen: 3,
        subLen: 7,
        subGroups: [3, 4],
      },
      {
        label: "Móvil",
        dialCodes: ["31", "32", "33", "34", "35", "36", "37", "38", "39"],
        dialLen: 2,
        subLen: 8,
        subGroups: [4, 4],
      },
      {
        label: "Otras",
        dialCodes: ["41", "42", "43", "44", "45", "50", "51", "52", "53", "54", "55", "71", "81", "85"],
        dialLen: 2,
        subLen: 8,
        subGroups: [4, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+39{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+39 {prefix} {sub}" },
      national: { label: "Nacional", template: "{prefix} {sub}" },
      pretty: { label: "Con formato", template: "+39 ({prefix}) {sub}" },
    },
    example: "06 1234 5678",
  },

  PT: {
    name: "Portugal",
    code: "+351",
    flag: "🇵🇹",
    trunk: "",
    prefixGroups: [
      {
        label: "Fijo",
        dialCodes: ["21", "22", "23", "24", "25", "26", "27", "28", "29"],
        dialLen: 2,
        subLen: 7,
        subGroups: [3, 4],
      },
      {
        label: "Móvil",
        dialCodes: ["91", "92", "93", "96"],
        dialLen: 2,
        subLen: 7,
        subGroups: [3, 4],
      },
    ],
    formats: {
      e164: { label: "E.164", template: "+351{prefix}{sub}", subGroups: [] },
      international: { label: "Internacional", template: "+351 {prefix} {sub}" },
      national: { label: "Nacional", template: "{prefix} {sub}" },
      pretty: { label: "Con formato", template: "+351 ({prefix}) {sub}" },
    },
    example: "21 555 1234",
  },
};

export function getCountryList() {
  return Object.entries(COUNTRIES)
    .map(([code, data]) => ({
      code,
      name: data.name,
      flag: data.flag,
      dialCode: data.code,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}
