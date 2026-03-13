export interface DODetail {
    id: number;
    doId: number;
    customer: string;
    muat: string;
    muatan: string;
    tujuanKirim: string;
    bongkar: string;
    invoice: string;
    banSerep: string;
    pipaPress1: string;
    pipaPress2: string;
    biayaTambahan: string;
    ppn: string;
    fee: string;
    ujDriver: string;
    lainnya: string;
    pph: string;
}

export interface DOEkspedisi {
    id: number;
    kodeDO: string;
    tanggal: string;
    noPolisi: string;
    tipeKendaraan: string;
    driver: string;
}

export let DUMMY_DO_EKSPEDISI: DOEkspedisi[] = [
    {
        id: 1,
        kodeDO: "DOE-WJR000000",
        tanggal: "2026-06-02",
        noPolisi: "AB 000 XX",
        tipeKendaraan: "Fuso",
        driver: "Ahmad Syahroni"
    },
    {
        id: 2,
        kodeDO: "DOE-WJR000001",
        tanggal: "2026-06-02",
        noPolisi: "AB 000 XX",
        tipeKendaraan: "Fuso",
        driver: "Ahmad Syahroni"
    },
    {
        id: 3,
        kodeDO: "DOE-WJR000002",
        tanggal: "2026-06-02",
        noPolisi: "AB 000 XX",
        tipeKendaraan: "Fuso",
        driver: "Ahmad Syahroni"
    },
    {
        id: 4,
        kodeDO: "DOE-WJR000003",
        tanggal: "2026-06-02",
        noPolisi: "AB 000 XX",
        tipeKendaraan: "Fuso",
        driver: "Ahmad Syahroni"
    },
    {
        id: 5,
        kodeDO: "DOE-WJR000004",
        tanggal: "2026-06-02",
        noPolisi: "AB 000 XX",
        tipeKendaraan: "Fuso",
        driver: "Ahmad Syahroni"
    }
];

export let DUMMY_DO_DETAILS: DODetail[] = [
    {
        id: 1,
        doId: 1,
        customer: "Ella Young",
        muat: "?",
        tujuanKirim: "Bandung",
        bongkar: "?",
        muatan: "24 unit",
        invoice: "Stylo 160 CBS",
        biayaTambahan: "Stylo 160 CBS",
        ppn: "ABC 1223 DDDDD",
        fee: "MH847420JVDIDC",
        banSerep: "",
        pipaPress1: "",
        pipaPress2: "",
        ujDriver: "",
        lainnya: "",
        pph: ""
    },
    {
        id: 2,
        doId: 1,
        customer: "Ella Young",
        muat: "?",
        tujuanKirim: "Bandung",
        bongkar: "?",
        muatan: "24 unit",
        invoice: "Stylo 160 CBS",
        biayaTambahan: "Stylo 160 CBS",
        ppn: "ABC 1223 DDDDD",
        fee: "MH847420JVDIDC",
        banSerep: "",
        pipaPress1: "",
        pipaPress2: "",
        ujDriver: "",
        lainnya: "",
        pph: ""
    },
    {
        id: 3,
        doId: 1,
        customer: "Ella Young",
        muat: "?",
        tujuanKirim: "Bandung",
        bongkar: "?",
        muatan: "24 unit",
        invoice: "Stylo 160 CBS",
        biayaTambahan: "Stylo 160 CBS",
        ppn: "ABC 1223 DDDDD",
        fee: "MH847420JVDIDC",
        banSerep: "",
        pipaPress1: "",
        pipaPress2: "",
        ujDriver: "",
        lainnya: "",
        pph: ""
    },
    {
        id: 4,
        doId: 1,
        customer: "Ella Young",
        muat: "?",
        tujuanKirim: "Bandung",
        bongkar: "?",
        muatan: "24 unit",
        invoice: "Stylo 160 CBS",
        biayaTambahan: "Stylo 160 CBS",
        ppn: "ABC 1223 DDDDD",
        fee: "MH847420JVDIDC",
        banSerep: "",
        pipaPress1: "",
        pipaPress2: "",
        ujDriver: "",
        lainnya: "",
        pph: ""
    }
];

export const setDummyDOs = (data: DOEkspedisi[]) => {
    DUMMY_DO_EKSPEDISI = data;
};

export const setDummyDODetails = (data: DODetail[]) => {
    DUMMY_DO_DETAILS = data;
};
