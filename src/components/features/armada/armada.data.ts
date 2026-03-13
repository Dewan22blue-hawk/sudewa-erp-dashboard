export interface ArmadaEquipment {
    radioTape: number;
    toolkit: number;
    kotakP3K: number;
    dongkrak: number;
    pipaDongkrak: number;
    pemantikRokok: number;
    banSerep: number;
    pipaPress1: number;
    pipaPress2: number;
    pelanaJok: number;
    taliIkatBesar: number;
    taliIkatKecil: number;
    selangStang: number;
    spion: number;
    gembokToolBox: number;
    tabungAPAR: number;
    sponATI: number;
    bukuService: number;
}

export interface Armada {
    id: number;
    noPolisi: string;
    noMesin: string;
    noRangka: string;
    nomorSTNK: string;
    masaSTNK: string;
    bukuKIR: string;
    masaKIR: string;
    type: string;
    perlengkapan: ArmadaEquipment;
}

// In-memory store for dummy CRUD operations simulation across pages
export let DUMMY_ARMADAS: Armada[] = [
    {
        id: 1,
        noPolisi: "AB 0000 XX",
        noMesin: "HNDH874298634",
        noRangka: "KJFGS738423",
        nomorSTNK: "232333334848",
        masaSTNK: "05/02/2030", // simulated formatting string
        bukuKIR: "KIR-123",
        masaKIR: "02/06/2026",
        type: "Fuso",
        perlengkapan: {
            radioTape: 1, toolkit: 1, kotakP3K: 1, dongkrak: 1, pipaDongkrak: 1, pemantikRokok: 1, banSerep: 1, pipaPress1: 1, pipaPress2: 1,
            pelanaJok: 2, taliIkatBesar: 2, taliIkatKecil: 2, selangStang: 2, spion: 2, gembokToolBox: 2, tabungAPAR: 2, sponATI: 2, bukuService: 2
        }
    },
    {
        id: 2,
        noPolisi: "AB 1111 XX",
        noMesin: "HNDH874298635",
        noRangka: "KJFGS738424",
        nomorSTNK: "232333334849",
        masaSTNK: "05/02/2030",
        bukuKIR: "KIR-124",
        masaKIR: "02/06/2026",
        type: "CDD",
        perlengkapan: {
            radioTape: 1, toolkit: 1, kotakP3K: 1, dongkrak: 1, pipaDongkrak: 1, pemantikRokok: 1, banSerep: 1, pipaPress1: 1, pipaPress2: 1,
            pelanaJok: 2, taliIkatBesar: 2, taliIkatKecil: 2, selangStang: 2, spion: 2, gembokToolBox: 2, tabungAPAR: 2, sponATI: 2, bukuService: 2
        }
    },
    {
        id: 3,
        noPolisi: "AB 2222 XX",
        noMesin: "HNDH874298636",
        noRangka: "KJFGS738425",
        nomorSTNK: "232333334850",
        masaSTNK: "05/02/2030",
        bukuKIR: "KIR-125",
        masaKIR: "02/06/2026",
        type: "Fuso",
        perlengkapan: {
            radioTape: 1, toolkit: 1, kotakP3K: 1, dongkrak: 1, pipaDongkrak: 1, pemantikRokok: 1, banSerep: 1, pipaPress1: 1, pipaPress2: 1,
            pelanaJok: 2, taliIkatBesar: 2, taliIkatKecil: 2, selangStang: 2, spion: 2, gembokToolBox: 2, tabungAPAR: 2, sponATI: 2, bukuService: 2
        }
    },
    {
        id: 4,
        noPolisi: "AB 3333 XX",
        noMesin: "HNDH874298637",
        noRangka: "KJFGS738426",
        nomorSTNK: "232333334851",
        masaSTNK: "05/02/2030",
        bukuKIR: "KIR-126",
        masaKIR: "02/06/2026",
        type: "CDD",
        perlengkapan: {
            radioTape: 1, toolkit: 1, kotakP3K: 1, dongkrak: 1, pipaDongkrak: 1, pemantikRokok: 1, banSerep: 1, pipaPress1: 1, pipaPress2: 1,
            pelanaJok: 2, taliIkatBesar: 2, taliIkatKecil: 2, selangStang: 2, spion: 2, gembokToolBox: 2, tabungAPAR: 2, sponATI: 2, bukuService: 2
        }
    },
    {
        id: 5,
        noPolisi: "AB 4444 XX",
        noMesin: "HNDH874298638",
        noRangka: "KJFGS738427",
        nomorSTNK: "232333334852",
        masaSTNK: "05/02/2030",
        bukuKIR: "KIR-127",
        masaKIR: "02/06/2026",
        type: "Fuso",
        perlengkapan: {
            radioTape: 1, toolkit: 1, kotakP3K: 1, dongkrak: 1, pipaDongkrak: 1, pemantikRokok: 1, banSerep: 1, pipaPress1: 1, pipaPress2: 1,
            pelanaJok: 2, taliIkatBesar: 2, taliIkatKecil: 2, selangStang: 2, spion: 2, gembokToolBox: 2, tabungAPAR: 2, sponATI: 2, bukuService: 2
        }
    }
];

export const setDummyArmadas = (data: Armada[]) => {
    DUMMY_ARMADAS = data;
};
