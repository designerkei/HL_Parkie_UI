const batteryOutline = `
  <path d="M9.67857 21C8.96817 21 8.28687 20.6881 7.78454 20.1329C7.28221 19.5777 7 18.8247 7 18.0395V7.53947C7 6.75429 7.28221 6.00127 7.78453 5.44606C8.28686 4.89086 8.96817 4.57895 9.67857 4.57895H10.5714V3.78947C10.5714 3.58009 10.6467 3.37929 10.7806 3.23123C10.9146 3.08318 11.0963 3 11.2857 3H12.7143C12.9037 3 13.0854 3.08318 13.2194 3.23123C13.3533 3.37929 13.4286 3.58009 13.4286 3.78947V4.57895H14.3214C15.0318 4.57895 15.7131 4.89086 16.2155 5.44606C16.7178 6.00127 17 6.75429 17 7.53947V18.0395C17 18.8247 16.7178 19.5777 16.2155 20.1329C15.7131 20.6881 15.0318 21 14.3214 21H9.67857ZM8.07143 18.0395C8.07143 18.5106 8.24075 18.9624 8.54215 19.2955C8.84355 19.6286 9.25233 19.8158 9.67857 19.8158H14.3214C14.7477 19.8158 15.1565 19.6286 15.4579 19.2955C15.7592 18.9624 15.9286 18.5106 15.9286 18.0395V7.53947C15.9286 7.06836 15.7592 6.61655 15.4578 6.28343C15.1565 5.9503 14.7477 5.76316 14.3214 5.76316H9.67857C9.25233 5.76316 8.84355 5.9503 8.54215 6.28343C8.24075 6.61655 8.07143 7.06837 8.07143 7.53947V18.0395Z" fill="currentColor" fill-opacity="0.95"/>
`;

const chargingBolt = `
  <path d="M13.8006 12.7625C13.796 12.6602 13.7653 12.5608 13.7114 12.4737C13.6575 12.3867 13.5823 12.3149 13.4929 12.2651C13.4035 12.2154 13.3028 12.1893 13.2005 12.1894H11.7706L12.5373 10.6575C12.6085 10.515 12.6202 10.3501 12.5699 10.199C12.5195 10.0479 12.4112 9.92296 12.2687 9.85173C12.1263 9.7805 11.9613 9.76877 11.8102 9.81915C11.6591 9.86953 11.5342 9.97786 11.463 10.1203L10.2627 12.521C10.2169 12.6125 10.1952 12.7143 10.1998 12.8165C10.2044 12.9188 10.2351 13.0181 10.2889 13.1052C10.3427 13.1923 10.4179 13.2641 10.5074 13.3139C10.5968 13.3637 10.6975 13.3898 10.7998 13.3897H12.2297L11.463 14.9217C11.3918 15.0641 11.3801 15.2291 11.4304 15.3802C11.4808 15.5313 11.5891 15.6562 11.7316 15.7274C11.874 15.7986 12.039 15.8104 12.1901 15.76C12.3412 15.7096 12.4661 15.6013 12.5373 15.4588L13.7377 13.0581C13.7835 12.9666 13.8051 12.8648 13.8006 12.7625Z" fill="white"/>
`;

export default {
  Monitoring: {
    viewBox: '0 0 24 24',
    source: 'Parkie Original',
    body: '<path d="M15.375 21H8.625M3 13.56V6.84C3 5.496 3 4.824 3.24525 4.3104C3.46125 3.858 3.80437 3.492 4.2285 3.2616C4.71 3 5.34 3 6.6 3H17.4C18.66 3 19.29 3 19.7704 3.2616C20.1945 3.492 20.5387 3.858 20.7547 4.3104C21 4.8228 21 5.4948 21 6.8364V13.5636C21 14.9052 21 15.576 20.7547 16.0884C20.5389 16.5406 20.1943 16.9082 19.7704 17.1384C19.29 17.4 18.6611 17.4 17.4034 17.4H6.59663C5.33888 17.4 4.70888 17.4 4.2285 17.1384C3.80498 16.908 3.46077 16.5404 3.24525 16.0884C3 15.576 3 14.904 3 13.56Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  Robot: {
    viewBox: '0 0 24 24',
    source: 'Parkie Original',
    body: '<rect x="5" y="8" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8V5M9.5 13h.01M14.5 13h.01M8.5 17h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  Charger: {
    viewBox: '0 0 24 24',
    source: 'Parkie Original',
    body: '<rect x="6" y="7" width="9" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 11h2v4h-2M10 10l-1 3h2l-1 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  Connection: {
    viewBox: '0 0 24 24',
    source: 'Parkie Original',
    body: '<path d="M3 10a13 13 0 0 1 18 0M6.5 13.5a8 8 0 0 1 11 0M10 17a3 3 0 0 1 4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="19" r="1.25" fill="currentColor"/>',
  },
  VehicleTransport: {
    viewBox: '0 0 24 24',
    source: 'Parkie Custom',
    body: '<path d="M5 13.5 6.5 9h11l1.5 4.5M4 13.5h16v4H4v-4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7.5" cy="17.5" r="1.5" fill="currentColor"/><circle cx="16.5" cy="17.5" r="1.5" fill="currentColor"/><path d="M8 21h8M12 18.5V21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  },
  ParkingBay: {
    viewBox: '0 0 24 24',
    source: 'Parkie Custom',
    body: '<rect x="4" y="3" width="10" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 13V6h2.2a2.3 2.3 0 0 1 0 4.6H8M4 20h16M7 16v4M17 9v11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  Route: {
    viewBox: '0 0 24 24',
    source: 'Parkie Custom',
    body: '<circle cx="6" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 18h3a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-1a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2.4 2.4"/>',
  },
  Obstacle: {
    viewBox: '0 0 24 24',
    source: 'Parkie Custom',
    body: '<path d="M4 14h16l-2-6H6l-2 6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m8 8 2 6M14 8l2 6M7 14v4M17 14v4M5 18h4M15 18h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  },
  ManualControl: {
    viewBox: '0 0 24 24',
    source: 'Parkie Custom',
    body: '<path d="M7.5 8h9a4 4 0 0 1 3.8 2.8l1.1 3.7a3 3 0 0 1-5 3l-1.5-1.5H9.1l-1.5 1.5a3 3 0 0 1-5-3l1.1-3.7A4 4 0 0 1 7.5 8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 11v4M6 13h4M16.5 11.5h.01M18.5 13.5h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  },
  EmergencyStop: {
    viewBox: '0 0 24 24',
    source: 'Parkie Custom',
    body: '<path d="m8 3-5 5v8l5 5h8l5-5V8l-5-5H8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 7v6M12 17h.01" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  },
  BatteryFull: {
    viewBox: '0 0 24 24',
    source: 'Parkie Original',
    body: `${batteryOutline}<rect x="8.98438" y="7.04688" width="6.01562" height="11.4856" rx="1" fill="currentColor"/>`,
  },
  BatteryMedium: {
    viewBox: '0 0 24 24',
    source: 'Parkie Original',
    body: `${batteryOutline}<rect x="8.98438" y="12.7875" width="6.01562" height="5.745" rx="1" fill="var(--parkie-icon-battery-full)"/>`,
  },
  BatteryCritical: {
    viewBox: '0 0 24 24',
    source: 'Parkie Original',
    body: `${batteryOutline}<rect x="8.98438" y="15.6625" width="6.01562" height="2.87" rx="1" fill="var(--parkie-icon-battery-critical)"/>`,
  },
  BatteryChargingLow: {
    viewBox: '0 0 24 24',
    source: 'Parkie Original',
    body: `${batteryOutline}<rect x="8.98438" y="15.6625" width="6.01562" height="2.87" rx="1" fill="var(--parkie-icon-charging)"/>${chargingBolt}`,
  },
  BatteryChargingHigh: {
    viewBox: '0 0 24 24',
    source: 'Parkie Original',
    body: `${batteryOutline}<rect x="8.98438" y="12.7875" width="6.01562" height="5.745" rx="1" fill="var(--parkie-icon-charging)"/>${chargingBolt}`,
  },
  ConnectionGood: {
    viewBox: '0 0 24 24',
    source: 'Parkie Custom',
    body: '<path d="M3 9.5a14 14 0 0 1 18 0M6.5 13a8.5 8.5 0 0 1 11 0M10 16.5a3.2 3.2 0 0 1 4 0" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="19.2" r="1.2" fill="currentColor"/>',
  },
  ConnectionWeak: {
    viewBox: '0 0 24 24',
    source: 'Parkie Custom',
    body: '<path d="M7 13a8 8 0 0 1 10 0M10 16.5a3.2 3.2 0 0 1 4 0" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="19.2" r="1.2" fill="currentColor"/>',
  },
  ConnectionLost: {
    viewBox: '0 0 24 24',
    source: 'Parkie Custom',
    body: '<path d="M4 4 20 20M3 9.5a14 14 0 0 1 13.2-2.2M6.5 13a8.5 8.5 0 0 1 5.2-2M10 16.5a3.2 3.2 0 0 1 4 0" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="19.2" r="1.2" fill="currentColor"/>',
  },
};
