import { useEffect, useState } from "react";
import QR from "qrcode";

export function QrMark({ value, size = 148 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let live = true;
    void QR.toDataURL(value, {
      margin: 1,
      width: size * 2,
      color: { dark: "#1c1917", light: "#ffffff" },
    }).then((url) => {
      if (live) setSrc(url);
    });
    return () => {
      live = false;
    };
  }, [value, size]);

  if (!src) {
    return <div className="bg-surface" style={{ width: size, height: size }} />;
  }
  return <img src={src} alt={`QR ${value}`} width={size} height={size} />;
}
