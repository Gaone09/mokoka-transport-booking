export const routes = [
  {npm
    id: "GB-MA",
    name: "Gaborone → Maun",
    stops: [
      "Gaborone",
      "Dibete",
      "Mahalapye",
      "Palapye",
      "Serowe",
      "Orapa",
      "Maun",
    ],
    trips: [
      { time: "04:30", capacity: 62 },

      { time: "18:00", capacity: 72 },
    ],
  },
  {
    id: "MA-GB",
    name: "Maun → Gaborone",
    stops: [
      "Maun",
      "Orapa",
      "Letlhakane",
      "Serowe",
      "Palapye",
      "Mahalapye",
      "Dibete",
      "Gaborone",
    ],
    trips: [
      { time: "09;30", capacity: 62 },
      { time: "18:00", capacity: 62 },
    ],
  },
  {
    id: "FT-GB",
    name: "Francistown → Gaborone",
    stops: ["Francistown", "Serule", "Palapye", "Mahalapye", "Gaborone"],
    trips: [{ time: "05:30", capacity: 62 }],
  },
  {
    id: "SW-GB",
    name: "Serowe → Gaborone",
    stops: ["Serowe", "Palapye", "Mahalapye", "Gaborone"],
    trips: [
      {
        time: "06:00",
        capacity: 62,
      },
    ],
  },
  {
    id: "GB-SW",
    name: "Gaborone → Serowe",
    stops: ["Gaborone", "Mahalapye", "Palapye", "Serowe"],
    trips: [
      { time: "13:00", capacity: 62 },
      { time: "14:00", capacity: 62 },
      { time: "16:00", capacity: 62 },
    ],
    //["13:00", "14:00", "1600"],
  },
  {
    id: "GB-FT",
    name: "Gaborone → Francistown",
    stops: ["Gaborone", "Mahalapye", "Palapye", "Tonota", "Francistown"],
    trips: [{ time: "13:00", capacity: 62 }],
  },
];
