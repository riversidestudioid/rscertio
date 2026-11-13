/** Baca orientasi EXIF (1–8) dari JPEG. Mengembalikan 1 jika tidak ada. */
export function readJpegOrientation(bytes: Uint8Array): number {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return 1;
  let p = 2;
  while (p + 4 <= bytes.length) {
    if (bytes[p] !== 0xff) return 1;
    const marker = bytes[p + 1];
    const len = (bytes[p + 2] << 8) | bytes[p + 3];
    if (marker === 0xe1 && len >= 16) {
      const s = p + 4;
      const isExif =
        bytes[s] === 0x45 && bytes[s + 1] === 0x78 && bytes[s + 2] === 0x69 && bytes[s + 3] === 0x66;
      if (isExif) {
        const t = s + 6; // awal header TIFF
        const little = bytes[t] === 0x49;
        const u16 = (o: number) =>
          little ? bytes[o] | (bytes[o + 1] << 8) : (bytes[o] << 8) | bytes[o + 1];
        const u32 = (o: number) =>
          little
            ? (bytes[o] | (bytes[o + 1] << 8) | (bytes[o + 2] << 16) | (bytes[o + 3] << 24)) >>> 0
            : ((bytes[o] << 24) | (bytes[o + 1] << 16) | (bytes[o + 2] << 8) | bytes[o + 3]) >>> 0;
        const ifd = t + u32(t + 4);
        if (ifd + 2 > bytes.length) return 1;
        const count = u16(ifd);
        for (let i = 0; i < count; i++) {
          const e = ifd + 2 + i * 12;
          if (e + 12 > bytes.length) return 1;
          if (u16(e) === 0x0112) {
            const v = u16(e + 8);
            return v >= 1 && v <= 8 ? v : 1;
          }
        }
      }
    }
    if (marker === 0xda) return 1; // mulai data gambar
    p += 2 + len;
  }
  return 1;
}
