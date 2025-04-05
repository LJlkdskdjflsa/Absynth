export const CHARITIES = {
  CLEAN_WATER: {
    id: "1",
    title: "Clean Water Initiative",
    description: "Providing clean water to communities in need around the world.",
    raised: 12500,
    goal: 25000,
    organizationAddress: "0x9a3f63F053512597d486cA679Ce5A0D13b98C8db"
  },
  EDUCATION: {
    id: "2",
    title: "Education for All",
    description: "Supporting education programs for underprivileged children.",
    raised: 18750,
    goal: 30000,
    organizationAddress: "0xec838E7f89CE1CF0dB482c963946b5D827964ddE"
  },
  HUNGER_RELIEF: {
    id: "3",
    title: "Hunger Relief Program",
    description: "Distributing food to families facing food insecurity.",
    raised: 8200,
    goal: 15000,
    organizationAddress: "0x046734b1888358760cFE4C45601eb0EdD0aa174D"
  },
  WILDLIFE: {
    id: "4",
    title: "Wildlife Conservation",
    description: "Protecting endangered species and their natural habitats.",
    raised: 21300,
    goal: 40000,
    organizationAddress: "0x03dF76C8c30A88f424CF3CBBC36A1Ca02763103b"
  }
} as const

export type CharityKey = keyof typeof CHARITIES 