export default function HaikeiBackdrop() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-80" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sanjeevani-wave" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4de3d3" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#4b2c89" stopOpacity="0.02" />
        </linearGradient>
        <filter id="sanjeevani-blur"><feGaussianBlur stdDeviation="18" /></filter>
      </defs>
      <path d="M0,640 C153,575 225,754 417,664 C606,575 657,440 821,519 C1036,622 1146,383 1440,446 L1440,900 L0,900 Z" fill="url(#sanjeevani-wave)" />
      <path d="M0,696 C193,595 341,820 589,675 C794,555 988,690 1154,595 C1284,522 1363,554 1440,514" fill="none" stroke="#57f5e2" strokeOpacity="0.2" strokeWidth="1.2" />
      <g filter="url(#sanjeevani-blur)"><circle cx="1175" cy="175" r="106" fill="#36d7d0" fillOpacity="0.13" /><circle cx="1010" cy="90" r="76" fill="#7d55d9" fillOpacity="0.1" /></g>
      <g fill="none" stroke="#7fe9df" strokeOpacity="0.13"><circle cx="1187" cy="177" r="155" /><circle cx="1187" cy="177" r="205" strokeDasharray="4 11" /></g>
    </svg>
  );
}
