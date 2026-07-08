// 이미지 파일 → 최대 900px, JPEG 0.7로 축소한 data URL (클라이언트 전용)
export function resizeImage(file: File, maxSize = 900, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxSize || height > maxSize) {
          const s = maxSize / Math.max(width, height);
          width = Math.round(width * s);
          height = Math.round(height * s);
        }
        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        c.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
