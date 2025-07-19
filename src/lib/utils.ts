export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
import { format, parseISO } from "date-fns";
import liburNasional from "../data/libur.json"; // pastikan file ini ada

export function isHariLibur(dateStr: string): boolean {
  const tanggal = parseISO(dateStr);
  const hari = tanggal.getDay(); // 0: Minggu, 6: Sabtu
  const isMinggu = hari === 0;
  const isLiburNasional = liburNasional.includes(format(tanggal, "yyyy-MM-dd"));
  return isMinggu || isLiburNasional;
}

export function hitungLembur(tanggal: string, jamMasuk: string, jamKeluar: string) {
  const jamLembur = hitungJamLembur(jamMasuk, jamKeluar);
  return {
    tanggal,
    jamMasuk,
    jamKeluar,
    jamLembur,
    libur: isHariLibur(tanggal)
  };
}

function hitungJamLembur(masuk: string, keluar: string): number {
  const [jamM, menitM] = masuk.split(":").map(Number);
  const [jamK, menitK] = keluar.split(":").map(Number);
  const totalMasuk = jamM * 60 + menitM;
  const totalKeluar = jamK * 60 + menitK;
  const durasi = totalKeluar - totalMasuk;
  return durasi > 0 ? durasi / 60 : 0;
}
