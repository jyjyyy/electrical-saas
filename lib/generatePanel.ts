export type Circuit = {
  room: string;
  name: string;
  disjoncteur: string;
  cable: string;
  diff?: string;
};

export type IDiff = {
  idType: "Type A" | "Type AC";
  amperage: 40 | 63;
  circuits: Circuit[];
};

const equipmentRules: {
  [key: string]: {
    disjoncteur: string;
    cable: string;
    idType: "Type A" | "Type AC";
  };
} = {
  "Prises électriques": { disjoncteur: "20A", cable: "2.5mm²", idType: "Type AC" },
  "Éclairages": { disjoncteur: "10A", cable: "1.5mm²", idType: "Type AC" },
  "Spots encastrés": { disjoncteur: "10A", cable: "1.5mm²", idType: "Type AC" },
  "Plaques de cuisson": { disjoncteur: "32A", cable: "6mm²", idType: "Type A" },
  "Lave-linge": { disjoncteur: "20A", cable: "2.5mm²", idType: "Type A" },
  "Lave-vaisselle": { disjoncteur: "20A", cable: "2.5mm²", idType: "Type A" },
  "Réfrigérateur": { disjoncteur: "16A", cable: "2.5mm²", idType: "Type A" },
  "Chauffe-eau": { disjoncteur: "20A", cable: "2.5mm²", idType: "Type A" },
  "Volets roulants": { disjoncteur: "16A", cable: "1.5mm²", idType: "Type AC" },
  "Congélateur": { disjoncteur: "20A", cable: "2.5mm²", idType: "Type A" },
  "Four électrique": { disjoncteur: "20A", cable: "2.5mm²", idType: "Type A" },
  "Chauffage électrique": { disjoncteur: "20A", cable: "2.5mm²", idType: "Type AC" },
};

type Room = { name: string; equipment: { [key: string]: number } };

export function generatePanel(rooms: Room[]): {
  circuits: Circuit[];
  differentials: IDiff[];
  rowCount: number;
  notes: string[];
} {
  const circuits: Circuit[] = [];
  const notes: string[] = [];

  const prises: { room: string }[] = [];
  const eclairages: { room: string }[] = [];
  const volets: { room: string }[] = [];

  for (const room of rooms) {
    for (const [eq, qty] of Object.entries(room.equipment)) {
      if (eq === "Prises électriques") {
        for (let i = 0; i < qty; i++) prises.push({ room: room.name });
      } else if (eq === "Éclairages") {
        for (let i = 0; i < qty; i++) eclairages.push({ room: room.name });
      } else if (eq === "Spots encastrés") {
        for (let i = 0; i < qty; i++) {
          circuits.push({
            room: room.name,
            name: "Spots encastrés",
            disjoncteur: "10A",
            cable: "1.5mm²",
          });
        }
      } else if (eq === "Volets roulants") {
        for (let i = 0; i < qty; i++) volets.push({ room: room.name });
      } else {
        const rule = equipmentRules[eq];
        if (!rule) continue;
        for (let i = 0; i < qty; i++) {
          circuits.push({
            room: room.name,
            name: eq,
            disjoncteur: rule.disjoncteur,
            cable: rule.cable,
          });
        }
      }
    }
  }

  // 🔌 Regrouper les prises
  while (prises.length > 0) {
    const group: { room: string }[] = [];
    const roomsInGroup = new Set();

    for (let i = 0; i < prises.length; i++) {
      if (roomsInGroup.size >= 2) break;
      if (!roomsInGroup.has(prises[i].room)) {
        roomsInGroup.add(prises[i].room);
      }
      group.push(prises[i]);
      if (group.length === 8) break;
    }

    const disjoncteur = group.length <= 5 ? "16A" : "20A";
    const cable = disjoncteur === "16A" ? "1.5mm²" : "2.5mm²";

    circuits.push({
      room: Array.from(roomsInGroup).join(" + "),
      name: "Prises électriques",
      disjoncteur,
      cable,
    });

    prises.splice(0, group.length);
  }

  // 💡 Regrouper les éclairages
  while (eclairages.length > 0) {
    const group: { room: string }[] = [];
    const roomsInGroup = new Set();

    for (let i = 0; i < eclairages.length; i++) {
      if (roomsInGroup.size >= 2) break;
      if (!roomsInGroup.has(eclairages[i].room)) {
        roomsInGroup.add(eclairages[i].room);
      }
      group.push(eclairages[i]);
      if (group.length === 8) break;
    }

    circuits.push({
      room: Array.from(roomsInGroup).join(" + "),
      name: "Éclairages",
      disjoncteur: "10A",
      cable: "1.5mm²",
    });

    eclairages.splice(0, group.length);
  }

  // 🪟 Regrouper les volets roulants sur un seul disjoncteur
  if (volets.length > 0) {
    const rooms = volets.map((v) => v.room);
    circuits.push({
      room: Array.from(new Set(rooms)).join(" + "),
      name: "Volets roulants",
      disjoncteur: "16A",
      cable: "1.5mm²",
    });

    notes.push("⚠️ Tous les volets doivent être raccordés via une boîte de dérivation. Maximum 2 câbles peuvent être ramenés au disjoncteur.");
  }

  // ⚡ Regrouper dans des différentiels
  const differentials: IDiff[] = [];

  for (const circuit of circuits) {
    const rule = equipmentRules[circuit.name] || equipmentRules["Éclairages"];
    const circuitAmp = parseInt(rule.disjoncteur);
    let assigned = false;

    for (const diff of differentials) {
      const totalAmp = diff.circuits.reduce(
        (sum, c) => sum + parseInt(equipmentRules[c.name]?.disjoncteur || "0"),
        0
      );

      if (
        diff.idType === rule.idType &&
        diff.circuits.length < 8 &&
        totalAmp + circuitAmp <= Math.floor(0.8 * diff.amperage)
      ) {
        circuit.diff = `Diff ${differentials.indexOf(diff) + 1}`;
        diff.circuits.push(circuit);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      const amperage = 63; // Toujours 63A sauf cas très léger
      circuit.diff = `Diff ${differentials.length + 1}`;
      differentials.push({
        idType: rule.idType,
        amperage,
        circuits: [circuit],
      });
    }
  }

  const rowCount = Math.ceil(circuits.length / 11); // 11 modules max / rangée

  return { circuits, differentials, rowCount, notes };
}