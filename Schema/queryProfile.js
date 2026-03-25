export const baselineMarketsProfile = {
  id: "baseline-markets",
  label: "Baseline Markets Discovery",
  purpose: "Broad default sampling of /markets for baseline structural discovery.",
  endpoint: "/markets",
  mode: "baseline",

  baseParams: {},

  pagination: {
    strategy: "offset",
    pageSize: 50,
    initialPages: 3
  },

  enabled: true,

  jobPolicy: {
    expansion: "deterministic",
    allowOverrides: true
  },

  provenanceTags: ["baseline", "broad-discovery"],

  notes: [
    "This is the first acquisition profile.",
    "It should remain broad and shallow in the first implementation.",
    "Later profiles will be compared against this one."
  ]
};