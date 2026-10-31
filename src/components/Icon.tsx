export type IconName = 'home'|'receipt'|'chart'|'target'|'user'|'signal'|'wifi'|'battery'|'logo'|'scan'|'backspace'|'chevronLeft'|'chevronRight'|'chevronDown'|'eye'|'eyeOff'|'trendingUp'|'trendingDown'|'arrowDown'|'arrowUp'|'plus'|'send'|'food'|'car'|'sparkles'|'grid'|'bag'|'search'|'sliders'|'trash'|'calendar'|'piggy'|'wallet'|'plane'|'shield'|'moon'|'coins'|'bell'|'lock'|'download'|'help'|'logout'|'chevronRight'|'close'|'store'|'check'|'arrowLeft'|'arrowRight';

const paths: Record<IconName, React.ReactNode> = {
  home:<><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
  receipt:<><path d="M6 3h12v19l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></>,
  chart:<><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
  target:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m15 9 6-6"/></>,
  user:<><circle cx="12" cy="8" r="4"/><path d="M4 21c.7-4.5 3.3-7 8-7s7.3 2.5 8 7"/></>,
  signal:<path d="M3 20v-3M8 20v-6M13 20v-9M18 20V8"/>, wifi:<path d="M3 9c5-4 13-4 18 0M6 13c3.5-3 8.5-3 12 0M9.5 17c1.5-1.2 3.5-1.2 5 0M12 21h.01"/>, battery:<><rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 10v4M6 10h9v4H6z"/></>,
  logo:<><path d="M6 5h12M6 12h9M6 19h12"/><path d="m14 5 4 4-4 3 4 4-4 3"/></>,
  scan:<><path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><path d="M8 15c2.5 2 5.5 2 8 0"/></>,
  backspace:<><path d="m21 6-4-2H9L3 12l6 8h8l4-2V6Z"/><path d="m11 9 5 6m0-6-5 6"/></>,
  chevronLeft:<path d="m15 18-6-6 6-6"/>, chevronRight:<path d="m9 18 6-6-6-6"/>, chevronDown:<path d="m6 9 6 6 6-6"/>,
  eye:<><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>, eyeOff:<><path d="m3 3 18 18M10.5 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-2.1 2.8M6.4 6.4C3.5 8.2 2 12 2 12s3.5 6 10 6c1.5 0 2.8-.3 4-.8"/><path d="M10 10a3 3 0 0 0 4 4"/></>,
  trendingUp:<path d="m3 17 6-6 4 4 8-9M15 6h6v6"/>, trendingDown:<path d="m3 7 6 6 4-4 8 9M15 18h6v-6"/>,
  arrowDown:<path d="M12 3v18m-7-7 7 7 7-7"/>, arrowUp:<path d="M12 21V3m-7 7 7-7 7 7"/>, plus:<path d="M12 5v14M5 12h14"/>, send:<path d="m22 2-7 20-4-9-9-4 20-7Z"/>,
  food:<><path d="M6 3v8M3 3v5c0 2 1 3 3 3s3-1 3-3V3M6 11v10M15 3v18M15 3c4 2 4 8 0 10"/></>,
  car:<><path d="m3 16 2-7h14l2 7M5 9l2-4h10l2 4"/><path d="M4 16h16v4h-3v-2H7v2H4v-4Z"/><circle cx="7" cy="14" r="1"/><circle cx="17" cy="14" r="1"/></>,
  sparkles:<><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></>,
  grid:<><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  bag:<><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>, search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, sliders:<path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6"/>, trash:<><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
  calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>, piggy:<><path d="M4 12c0-4 3-7 8-7 3 0 5 1 6 3h3v6l-3 1c-.5 1-1.5 2-3 2v3h-3v-2H8v2H5v-4c-1-1-1-2-1-4Z"/><path d="M9 5V3h4M16 10h.01"/></>, wallet:<><path d="M4 5h14v15H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h13v4"/><path d="M14 11h8v6h-8a3 3 0 0 1 0-6Z"/></>,
  plane:<path d="m22 2-8 20-2-8-8-2 18-10ZM12 14l-4 4"/>, shield:<path d="M12 3 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-3Z"/>, moon:<path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z"/>, coins:<><circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/></>, bell:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>, lock:<><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>, download:<path d="M12 3v13m-5-5 5 5 5-5M4 21h16"/>, help:<><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.9.4-.9 1-.9 2M12 17h.01"/></>, logout:<path d="M10 4H4v16h6M15 8l4 4-4 4M8 12h11"/>,
  close:<path d="m5 5 14 14M19 5 5 19"/>, store:<><path d="M4 10v11h16V10M3 4h18l-2 6H5L3 4ZM9 14h6v7"/></>, check:<path d="m5 12 4 4L19 6"/>, arrowLeft:<path d="M20 12H4m6-6-6 6 6 6"/>, arrowRight:<path d="M4 12h16m-6-6 6 6-6 6"/>
};
export function Icon({ name }: { name: IconName }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>; }
