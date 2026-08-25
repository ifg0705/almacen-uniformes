export type Family =
  | "blusa-oxford"
  | "camisa-oxford-cab"
  | "camisa-mezclilla-cab"
  | "camisa-mezclilla-dama"
  | "pantalon-mezclilla-dama"
  | "pantalon-caqui-cab"
  | "pantalon-mezclilla-cab"
  | "polo-cielo"
  | "polo-marino"
  | "zapato";

export type Gender = "hombre" | "mujer";
export type Role = "operador" | "supervisor" | "mantenimiento" | "caseta";

export type Item = {
  id: string;
  description: string;
  family: Family;
  size: string;
  stock: number;
  minStock: number;
  unitCost: number;
};

type Seed = [string, Family, string, number, number, number];

const SEED: Seed[] = [
  ["BLUSA P/DAMA M. LARGA OXFORD CELESTE #32", "blusa-oxford", "32", 2, 3, 250],
  ["BLUSA P/DAMA M. LARGA OXFORD CELESTE #34", "blusa-oxford", "34", 4, 3, 250],
  ["BLUSA P/DAMA M. LARGA OXFORD CELESTE #36", "blusa-oxford", "36", 4, 3, 202.5],
  ["BLUSA P/DAMA M. LARGA OXFORD CELESTE #38", "blusa-oxford", "38", 3, 3, 202.5],
  ["BLUSA DAMA M. LARGA OXFORD CELESTE #40", "blusa-oxford", "40", 1, 3, 202.5],
  ["BLUSA P/DAMA M. LARGA OXFORD CELESTE #42", "blusa-oxford", "42", 1, 3, 202.5],
  ["BLUSA DAMA M. LARGA OXFORD CELESTE #44", "blusa-oxford", "44", 2, 3, 202.5],
  ["BLUSA P/DAMA M. LARGA OXFORD CELESTE #46", "blusa-oxford", "46", 1, 3, 202.5],
  ["BLUSA DAMA M. LARGA OXFORD CELESTE #48", "blusa-oxford", "48", 1, 3, 202.5],
  ["CAMISA CABALLERO M. LARGA OXFORD CELESTE #32", "camisa-oxford-cab", "32", 11, 3, 202.5],
  ["CAMISA CABALLERO M. LARGA OXFORD CELESTE #34", "camisa-oxford-cab", "34", 7, 3, 202.5],
  ["CAMISA CABALLERO M. LARGA OXFORD CELESTE #36", "camisa-oxford-cab", "36", 0, 3, 202.5],
  ["CAMISA CABALLERO M. LARGA OXFORD CELESTE #38", "camisa-oxford-cab", "38", 3, 3, 202.5],
  ["CAMISA CABALLERO M. LARGA OXFORD CELESTE #40", "camisa-oxford-cab", "40", 3, 3, 202.5],
  ["CAMISA CABALLERO M. LARGA OXFORD CELESTE #42", "camisa-oxford-cab", "42", 2, 3, 202.5],
  ["CAMISA CABALLERO M. LARGA OXFORD CELESTE #44", "camisa-oxford-cab", "44", 3, 3, 202.5],
  ["CAMISA CABALLERO M. LARGA OXFORD CELESTE #46", "camisa-oxford-cab", "46", 3, 3, 202.5],
  ["CAMISA CABALLERO M. LARGA OXFORD CELESTE #48", "camisa-oxford-cab", "48", 3, 3, 202.5],
  ["CAMISA CABALLERO M. LARGA OXFORD CELESTE #50", "camisa-oxford-cab", "50", 3, 3, 202.5],
  ["CAMISA CABALLERO M. LARGA OXFORD CELESTE #52", "camisa-oxford-cab", "52", 3, 3, 202.5],
  ["CAMISA P/CABALLERO DE MEZCLILLA # 30", "camisa-mezclilla-cab", "30", 2, 3, 201.5],
  ["CAMISA P/CABALLERO DE MEZCLILLA # 32", "camisa-mezclilla-cab", "32", 19, 3, 201.5],
  ["CAMISA P/CABALLERO DE MEZCLILLA # 34", "camisa-mezclilla-cab", "34", 15, 3, 201.5],
  ["CAMISA P/CABALLERO DE MEZCLILLA # 36", "camisa-mezclilla-cab", "36", 14, 3, 201.5],
  ["CAMISA P/CABALLERO DE MEZCLILLA # 38", "camisa-mezclilla-cab", "38", 12, 3, 201.5],
  ["CAMISA P/CABALLERO DE MEZCLILLA # 40", "camisa-mezclilla-cab", "40", 3, 3, 201.5],
  ["CAMISA P/CABALLERO DE MEZCLILLA # 42", "camisa-mezclilla-cab", "42", 0, 3, 201.5],
  ["CAMISA P/CABALLERO DE MEZCLILLA # 44", "camisa-mezclilla-cab", "44", 5, 3, 201.5],
  ["CAMISA P/CABALLERO DE MEZCLILLA # 46", "camisa-mezclilla-cab", "46", 5, 3, 201.5],
  ["CAMISA P/CABALLERO DE MEZCLILLA # 48", "camisa-mezclilla-cab", "48", 6, 3, 201.5],
  ["CAMISA P/CABALLERO DE MEZCLILLA # 50", "camisa-mezclilla-cab", "50", 6, 3, 201.5],
  ["CAMISA P/CABALLERO DE MEZCLILLA # 52", "camisa-mezclilla-cab", "52", 7, 3, 201.5],
  ["CAMISA P/DAMA DE MEZCLILLA #32", "camisa-mezclilla-dama", "32", 17, 3, 201.5],
  ["CAMISA P/DAMA DE MEZCLILLA #34", "camisa-mezclilla-dama", "34", 10, 3, 201.5],
  ["CAMISA P/DAMA DE MEZCLILLA #36", "camisa-mezclilla-dama", "36", 6, 3, 201.5],
  ["CAMISA P/DAMA DE MEZCLILLA #38", "camisa-mezclilla-dama", "38", 8, 3, 201.5],
  ["CAMISA P/DAMA DE MEZCLILLA #40", "camisa-mezclilla-dama", "40", 8, 3, 201.5],
  ["CAMISA P/DAMA DE MEZCLILLA #42", "camisa-mezclilla-dama", "42", 8, 3, 201.5],
  ["CAMISA P/DAMA DE MEZCLILLA #44", "camisa-mezclilla-dama", "44", 7, 3, 201.5],
  ["CAMISA P/DAMA DE MEZCLILLA #46", "camisa-mezclilla-dama", "46", 6, 3, 201.5],
  ["CAMISA P/DAMA DE MEZCLILLA #48", "camisa-mezclilla-dama", "48", 5, 3, 201.5],
  ["PANTALÓN P/ DAMA MEZCLILLA #28", "pantalon-mezclilla-dama", "28", 13, 3, 183],
  ["PANTALÓN P/ DAMA MEZCLILLA #30", "pantalon-mezclilla-dama", "30", 9, 3, 183],
  ["PANTALÓN P/ DAMA MEZCLILLA #32", "pantalon-mezclilla-dama", "32", 9, 3, 183],
  ["PANTALÓN P/ DAMA MEZCLILLA #34", "pantalon-mezclilla-dama", "34", 5, 3, 183],
  ["PANTALÓN P/ DAMA MEZCLILLA #36", "pantalon-mezclilla-dama", "36", 6, 3, 183],
  ["PANTALÓN P/ DAMA MEZCLILLA #38", "pantalon-mezclilla-dama", "38", 9, 3, 183],
  ["PANTALÓN P/ DAMA MEZCLILLA #40", "pantalon-mezclilla-dama", "40", 5, 3, 183],
  ["PANTALÓN P/ DAMA MEZCLILLA #42", "pantalon-mezclilla-dama", "42", 7, 3, 183],
  ["PANTALÓN P/ DAMA MEZCLILLA #44", "pantalon-mezclilla-dama", "44", 5, 3, 183],
  ["PANTALÓN P/ DAMA MEZCLILLA #46", "pantalon-mezclilla-dama", "46", 5, 3, 183],
  ["PANTALÓN P/ DAMA MEZCLILLA #48", "pantalon-mezclilla-dama", "48", 5, 3, 183],
  ["PANTALON P/CABALLERO COLOR CAQUI #28", "pantalon-caqui-cab", "28", 2, 3, 193],
  ["PANTALON P/CABALLERO COLOR CAQUI #30", "pantalon-caqui-cab", "30", 1, 3, 193],
  ["PANTALON P/CABALLERO COLOR CAQUI #32", "pantalon-caqui-cab", "32", 11, 3, 193],
  ["PANTALON P/CABALLERO COLOR CAQUI #34", "pantalon-caqui-cab", "34", 5, 3, 193],
  ["PANTALON P/CABALLERO COLOR CAQUI #36", "pantalon-caqui-cab", "36", 10, 3, 193],
  ["PANTALON P/CABALLERO COLOR CAQUI #38", "pantalon-caqui-cab", "38", 5, 3, 193],
  ["PANTALON P/CABALLERO COLOR CAQUI #40", "pantalon-caqui-cab", "40", 4, 3, 193],
  ["PANTALON P/CABALLERO COLOR CAQUI #42", "pantalon-caqui-cab", "42", 4, 3, 193],
  ["PANTALON P/CABALLERO COLOR CAQUI #44", "pantalon-caqui-cab", "44", 2, 3, 193],
  ["PANTALON P/CABALLERO COLOR CAQUI #46", "pantalon-caqui-cab", "46", 8, 3, 193],
  ["PANTALON P/CABALLERO COLOR CAQUI #48", "pantalon-caqui-cab", "48", 2, 3, 193],
  ["PANTALON P/CABALLERO MEZCLILLA # 28", "pantalon-mezclilla-cab", "28", 13, 3, 190.5],
  ["PANTALON P/CABALLERO MEZCLILLA # 30", "pantalon-mezclilla-cab", "30", 14, 3, 190.5],
  ["PANTALON P/CABALLERO MEZCLILLA # 32", "pantalon-mezclilla-cab", "32", 16, 3, 190.5],
  ["PANTALON P/CABALLERO MEZCLILLA # 34", "pantalon-mezclilla-cab", "34", 3, 3, 190.5],
  ["PANTALON P/CABALLERO MEZCLILLA # 36", "pantalon-mezclilla-cab", "36", 3, 3, 190.5],
  ["PANTALON P/CABALLERO MEZCLILLA # 38", "pantalon-mezclilla-cab", "38", 17, 3, 190.5],
  ["PANTALON P/CABALLERO MEZCLILLA # 40", "pantalon-mezclilla-cab", "40", 12, 3, 190.5],
  ["PANTALON P/CABALLERO MEZCLILLA # 42", "pantalon-mezclilla-cab", "42", 9, 3, 190.5],
  ["PANTALON P/CABALLERO MEZCLILLA # 44", "pantalon-mezclilla-cab", "44", 8, 3, 190.5],
  ["PANTALON P/CABALLERO MEZCLILLA # 46", "pantalon-mezclilla-cab", "46", 4, 3, 190.5],
  ["PANTALON P/CABALLERO MEZCLILLA # 48", "pantalon-mezclilla-cab", "48", 4, 3, 190.5],
  ["PLAYERA TIPO POLO P/CABALLERO AZUL REY CH", "polo-cielo", "CH", 11, 3, 140],
  ["PLAYERA TIPO POLO P/CABALLERO AZUL REY M", "polo-cielo", "M", 12, 3, 140],
  ["PLAYERA TIPO POLO P/CABALLERO AZUL REY G", "polo-cielo", "G", 5, 3, 140],
  ["PLAYERA TIPO POLO P/CABALLERO AZUL REY XL", "polo-cielo", "XL", 2, 3, 140],
  ["PLAYERA TIPO POLO P/CABALLERO AZUL MARINO CH", "polo-marino", "CH", 11, 3, 140],
  ["PLAYERA TIPO POLO P/CABALLERO AZUL MARINO M", "polo-marino", "M", 12, 3, 140],
  ["PLAYERA TIPO POLO P/CABALLERO AZUL MARINO G", "polo-marino", "G", 5, 3, 140],
  ["PLAYERA TIPO POLO P/CABALLERO AZUL MARINO XL", "polo-marino", "XL", 2, 3, 140],
  ["ZAPATO DE SEGURIDAD # 22", "zapato", "22", 13, 5, 520],
  ["ZAPATO DE SEGURIDAD # 23", "zapato", "23", 0, 5, 520],
  ["ZAPATO DE SEGURIDAD # 24", "zapato", "24", 8, 5, 520],
  ["ZAPATO DE SEGURIDAD # 25", "zapato", "25", 7, 5, 520],
  ["ZAPATO DE SEGURIDAD # 26", "zapato", "26", 27, 5, 520],
  ["ZAPATO DE SEGURIDAD # 27", "zapato", "27", 24, 5, 520],
  ["ZAPATO DE SEGURIDAD # 28", "zapato", "28", 19, 5, 520],
  ["ZAPATO DE SEGURIDAD # 29", "zapato", "29", 21, 5, 520],
  ["ZAPATO DE SEGURIDAD # 30", "zapato", "30", 6, 5, 520],
  ["ZAPATO DE SEGURIDAD # 31", "zapato", "31", 4, 5, 520],
  ["ZAPATO DE SEGURIDAD # 32", "zapato", "32", 2, 5, 520],
];

export function seedItems(): Item[] {
  return SEED.map((row, i) => ({
    id: `UNI-${String(i + 1).padStart(3, "0")}`,
    description: row[0],
    family: row[1],
    size: row[2],
    stock: row[3],
    minStock: row[4],
    unitCost: row[5],
  }));
}

export const FAMILY_LABEL: Record<Family, string> = {
  "blusa-oxford": "Blusa oxford dama",
  "camisa-oxford-cab": "Camisa oxford caballero",
  "camisa-mezclilla-cab": "Camisa mezclilla caballero",
  "camisa-mezclilla-dama": "Camisa mezclilla dama",
  "pantalon-mezclilla-dama": "Pantalón mezclilla dama",
  "pantalon-caqui-cab": "Pantalón caqui caballero",
  "pantalon-mezclilla-cab": "Pantalón mezclilla caballero",
  "polo-cielo": "Polo azul cielo",
  "polo-marino": "Polo azul marino",
  zapato: "Zapato de seguridad",
};

export type KitPiece = {
  key: "pantalon" | "camisa" | "polo" | "zapato";
  label: string;
  qty: number;
  family: Family;
  note?: string;
};

export const ROLE_LABEL: Record<Role, string> = {
  operador: "Operador",
  supervisor: "Supervisor",
  mantenimiento: "Supervisor de mantenimiento",
  caseta: "Operador de caseta",
};

function operatorOrMaintenanceKit(gender: Gender): KitPiece[] {
  return [
    {
      key: "pantalon",
      label: "Pantalón mezclilla",
      qty: 2,
      family: gender === "mujer" ? "pantalon-mezclilla-dama" : "pantalon-mezclilla-cab",
    },
    {
      key: "zapato",
      label: "Botas de seguridad",
      qty: 1,
      family: "zapato",
    },
    {
      key: "polo",
      label: "Polo azul cielo (unisex)",
      qty: 1,
      family: "polo-cielo",
    },
    {
      key: "camisa",
      label: gender === "mujer" ? "Camisa mezclilla dama" : "Camisa mezclilla",
      qty: 1,
      family: gender === "mujer" ? "camisa-mezclilla-dama" : "camisa-mezclilla-cab",
    },
  ];
}

function standardSupervisorKit(gender: Gender): KitPiece[] {
  return [
    {
      key: "pantalon",
      label: gender === "mujer" ? "Pantalón mezclilla dama" : "Pantalón caqui",
      qty: 2,
      family: gender === "mujer" ? "pantalon-mezclilla-dama" : "pantalon-caqui-cab",
      note:
        gender === "mujer"
          ? "No hay pantalón caqui dama en el catálogo actual; se usa mezclilla dama."
          : undefined,
    },
    {
      key: "zapato",
      label: "Botas de seguridad",
      qty: 1,
      family: "zapato",
    },
    {
      key: "polo",
      label: "Polo azul marino (unisex)",
      qty: 1,
      family: "polo-marino",
    },
    {
      key: "camisa",
      label: gender === "mujer" ? "Blusa oxford" : "Camisa oxford",
      qty: 1,
      family: gender === "mujer" ? "blusa-oxford" : "camisa-oxford-cab",
    },
  ];
}

function casetaKit(gender: Gender): KitPiece[] {
  return [
    {
      key: "pantalon",
      label: gender === "mujer" ? "Pantalón mezclilla dama" : "Pantalón caqui",
      qty: 2,
      family: gender === "mujer" ? "pantalon-mezclilla-dama" : "pantalon-caqui-cab",
      note:
        gender === "mujer"
          ? "No hay pantalón caqui dama en el catálogo actual; se usa mezclilla dama."
          : undefined,
    },
    {
      key: "zapato",
      label: "Botas de seguridad",
      qty: 1,
      family: "zapato",
    },
    {
      key: "polo",
      label: "Polo azul rey (unisex)",
      qty: 1,
      // En el catálogo original esta familia se llamó polo-cielo,
      // pero las prendas cargadas corresponden a PLAYERA AZUL REY.
      family: "polo-cielo",
    },
    {
      key: "camisa",
      label: gender === "mujer" ? "Blusa oxford" : "Camisa oxford",
      qty: 1,
      family: gender === "mujer" ? "blusa-oxford" : "camisa-oxford-cab",
    },
  ];
}

export function kitFor(role: Role, gender: Gender): KitPiece[] {
  // Operadores y supervisor de mantenimiento usan mezclilla.
  if (role === "operador" || role === "mantenimiento") {
    return operatorOrMaintenanceKit(gender);
  }

  // Operador de caseta: pantalón caqui, botas, polo azul rey y camisa oxford.
  if (role === "caseta") {
    return casetaKit(gender);
  }

  // Supervisores de las demás áreas usan el kit estándar.
  return standardSupervisorKit(gender);
}

export function stockStatus(item: Item): "ok" | "bajo" | "agotado" {
  if (item.stock <= 0) return "agotado";
  if (item.stock <= item.minStock) return "bajo";
  return "ok";
}
