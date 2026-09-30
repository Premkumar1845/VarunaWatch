/**
 * VarunaWatch - Coastal Lanes Configuration
 * Coverage across all 9 Indian Coastal States and Union Territories (7,516+ km Coastline)
 */

export interface CoastalLane {
  id: string;
  name: string;
  shortName: string;
  basin: 'Bay of Bengal' | 'Arabian Sea' | 'Indian Ocean' | 'Pan-India';
  coastline_km: number;
  center: [number, number]; // [lng, lat] for MapLibre
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  defaultZoom: number;
  spatialDomain: string;
  sdrfForce: string;
  cycloneTrackName: string;
  cycloneCategory: number;
  keyDistricts: string[];
  keyPorts: string[];
}

export const COASTAL_LANES: CoastalLane[] = [
  {
    id: 'all',
    name: 'All Coastal India (National Grid)',
    shortName: 'National Grid',
    basin: 'Pan-India',
    coastline_km: 7516,
    center: [80.5, 16.5],
    bounds: [68.0, 7.5, 94.0, 24.5],
    defaultZoom: 4.8,
    spatialDomain: '68.0°E – 94.0°E · 7.5°N – 24.5°N (7,516 km Coastline)',
    sdrfForce: 'National Disaster Response Force (NDRF) & Joint SDRF Pool',
    cycloneTrackName: 'National Coastal Threat Monitoring',
    cycloneCategory: 3,
    keyDistricts: ['Visakhapatnam', 'Puri', 'Chennai', 'Mumbai', 'Kandla', 'Kochi', 'Kolkata'],
    keyPorts: ['JNPT', 'Paradip', 'Chennai', 'Visakhapatnam', 'Kandla', 'Cochin', 'Haldia'],
  },
  {
    id: 'ap',
    name: 'Coastal Andhra Pradesh',
    shortName: 'Andhra Pradesh',
    basin: 'Bay of Bengal',
    coastline_km: 974,
    center: [82.2, 16.5],
    bounds: [80.0, 14.0, 84.5, 18.5],
    defaultZoom: 6.8,
    spatialDomain: '80.0°E – 84.5°E · 14.0°N – 18.5°N (974 km)',
    sdrfForce: 'AP SDRF Rapid Deployment Wing',
    cycloneTrackName: 'Cyclone Michaung / VAYU Track',
    cycloneCategory: 3,
    keyDistricts: ['Visakhapatnam', 'Kakinada', 'Konaseema', 'Krishna', 'Bapatla', 'Nellore'],
    keyPorts: ['Visakhapatnam Port', 'Kakinada Deep Water Port', 'Krishnapatnam Port', 'Machilipatnam'],
  },
  {
    id: 'od',
    name: 'Odisha Coastal Corridor',
    shortName: 'Odisha',
    basin: 'Bay of Bengal',
    coastline_km: 480,
    center: [86.2, 20.0],
    bounds: [84.5, 19.0, 87.8, 21.8],
    defaultZoom: 7.0,
    spatialDomain: '84.5°E – 87.8°E · 19.0°N – 21.8°N (480 km)',
    sdrfForce: 'Odisha Disaster Rapid Action Force (ODRAF)',
    cycloneTrackName: 'Cyclone Dana / Fani Storm Corridor',
    cycloneCategory: 4,
    keyDistricts: ['Puri', 'Jagatsinghpur', 'Kendrapara', 'Bhadrak', 'Balasore', 'Ganjam'],
    keyPorts: ['Paradip Port', 'Dhamra Port', 'Gopalpur Port'],
  },
  {
    id: 'wb',
    name: 'West Bengal & Sundarbans Delta',
    shortName: 'West Bengal',
    basin: 'Bay of Bengal',
    coastline_km: 157,
    center: [88.5, 21.8],
    bounds: [87.4, 21.3, 89.4, 22.8],
    defaultZoom: 7.4,
    spatialDomain: '87.4°E – 89.4°E · 21.3°N – 22.8°N (157 km)',
    sdrfForce: 'West Bengal SDRF & Civil Defence Marine Unit',
    cycloneTrackName: 'Cyclone Amphan / Remal Estuarine Track',
    cycloneCategory: 3,
    keyDistricts: ['South 24 Parganas', 'North 24 Parganas', 'East Medinipur', 'Sundarbans'],
    keyPorts: ['Syama Prasad Mookerjee Port (Kolkata)', 'Haldia Dock Complex', 'Digha'],
  },
  {
    id: 'tn',
    name: 'Tamil Nadu Coromandel Coast',
    shortName: 'Tamil Nadu',
    basin: 'Bay of Bengal',
    coastline_km: 1076,
    center: [79.8, 11.5],
    bounds: [77.5, 8.0, 80.8, 13.5],
    defaultZoom: 6.6,
    spatialDomain: '77.5°E – 80.8°E · 8.0°N – 13.5°N (1,076 km)',
    sdrfForce: 'Tamil Nadu SDRF Coastal Taskforce',
    cycloneTrackName: 'Cyclone Mandous / Michaung South Track',
    cycloneCategory: 3,
    keyDistricts: ['Chennai', 'Tiruvallur', 'Cuddalore', 'Nagapattinam', 'Ramanathapuram', 'Thoothukudi'],
    keyPorts: ['Chennai Port', 'Kamajarar Port (Ennore)', 'V.O. Chidambaranar Port (Thoothukudi)', 'Kattupalli'],
  },
  {
    id: 'kl',
    name: 'Kerala Malabar & South Littoral',
    shortName: 'Kerala',
    basin: 'Arabian Sea',
    coastline_km: 590,
    center: [76.2, 10.0],
    bounds: [74.8, 8.2, 77.2, 12.8],
    defaultZoom: 6.9,
    spatialDomain: '74.8°E – 77.2°E · 8.2°N – 12.8°N (590 km)',
    sdrfForce: 'Kerala SDRF Disaster Mitigation Wing',
    cycloneTrackName: 'Cyclone Ockhi / Arabian Sea Depressions',
    cycloneCategory: 2,
    keyDistricts: ['Thiruvananthapuram', 'Kollam', 'Alappuzha', 'Ernakulam', 'Kozhikode', 'Kannur'],
    keyPorts: ['Cochin Port', 'Vizhinjam International Seaport', 'Beypore', 'Kollam Port'],
  },
  {
    id: 'ka',
    name: 'Karnataka Karavali Coast',
    shortName: 'Karnataka',
    basin: 'Arabian Sea',
    coastline_km: 320,
    center: [74.6, 13.8],
    bounds: [74.0, 12.5, 75.2, 15.0],
    defaultZoom: 7.2,
    spatialDomain: '74.0°E – 75.2°E · 12.5°N – 15.0°N (320 km)',
    sdrfForce: 'Karnataka SDRF Marine & Coastal Wing',
    cycloneTrackName: 'Arabian Sea Karavali Storm Vector',
    cycloneCategory: 2,
    keyDistricts: ['Dakshina Kannada', 'Udupi', 'Uttara Kannada'],
    keyPorts: ['New Mangalore Port', 'Karwar Port', 'Malpe Port', 'Tadri'],
  },
  {
    id: 'ga',
    name: 'Goa Coastal Corridor',
    shortName: 'Goa',
    basin: 'Arabian Sea',
    coastline_km: 101,
    center: [73.9, 15.3],
    bounds: [73.6, 14.8, 74.3, 15.8],
    defaultZoom: 8.8,
    spatialDomain: '73.6°E – 74.3°E · 14.8°N – 15.8°N (101 km)',
    sdrfForce: 'Goa SDRF Marine Rescue Division',
    cycloneTrackName: 'Konkan-Goa Coastal Vector',
    cycloneCategory: 2,
    keyDistricts: ['North Goa', 'South Goa'],
    keyPorts: ['Mormugao Port', 'Panaji Seaport'],
  },
  {
    id: 'mh',
    name: 'Maharashtra Konkan & Mumbai MMR',
    shortName: 'Maharashtra',
    basin: 'Arabian Sea',
    coastline_km: 720,
    center: [73.0, 18.5],
    bounds: [72.5, 15.7, 73.8, 20.2],
    defaultZoom: 6.8,
    spatialDomain: '72.5°E – 73.8°E · 15.7°N – 20.2°N (720 km)',
    sdrfForce: 'Maharashtra SDRF & MCGM Disaster Management',
    cycloneTrackName: 'Cyclone Nisarga / Tauktae Konkan Track',
    cycloneCategory: 3,
    keyDistricts: ['Mumbai City', 'Mumbai Suburban', 'Thane', 'Palghar', 'Raigad', 'Ratnagiri', 'Sindhudurg'],
    keyPorts: ['Jawaharlal Nehru Port (JNPT)', 'Mumbai Port Trust', 'Dighi Port', 'Jaigad Port'],
  },
  {
    id: 'gj',
    name: 'Gujarat Saurashtra & Kutch Corridor',
    shortName: 'Gujarat',
    basin: 'Arabian Sea',
    coastline_km: 1600,
    center: [70.5, 21.8],
    bounds: [68.1, 20.0, 73.5, 24.5],
    defaultZoom: 6.3,
    spatialDomain: '68.1°E – 73.5°E · 20.0°N – 24.5°N (1,600 km)',
    sdrfForce: 'Gujarat SDRF & GSDMA State Emergency Operations',
    cycloneTrackName: 'Cyclone Biparjoy / Vayu Kutch Track',
    cycloneCategory: 4,
    keyDistricts: ['Kutch', 'Jamnagar', 'Devbhumi Dwarka', 'Porbandar', 'Junagadh', 'Gir Somnath', 'Surat', 'Bhavnagar'],
    keyPorts: ['Deendayal Port (Kandla)', 'Mundra Port', 'Pipavav Port', 'Hazira Port', 'Dahej', 'Porbandar Port'],
  },
  {
    id: 'ut',
    name: 'Puducherry & Island Union Territories',
    shortName: 'UTs & Islands',
    basin: 'Pan-India',
    coastline_km: 1000,
    center: [79.8, 11.9],
    bounds: [72.0, 6.0, 94.0, 14.0],
    defaultZoom: 6.0,
    spatialDomain: 'Bay of Bengal & Arabian Sea Island Corridors',
    sdrfForce: 'UT Disaster Response Forces & Coast Guard Command',
    cycloneTrackName: 'Island & Enclave Early Warning Grid',
    cycloneCategory: 3,
    keyDistricts: ['Puducherry', 'Karaikal', 'Yanam', 'Andaman & Nicobar', 'Lakshadweep'],
    keyPorts: ['Port Blair', 'Karaikal Port', 'Puducherry Port', 'Kavaratti Jetty'],
  },
];

export function getCoastalLane(id?: string): CoastalLane {
  if (!id) return COASTAL_LANES[0]; // Default to All Coastal India or AP
  const found = COASTAL_LANES.find((lane) => lane.id === id || lane.shortName.toLowerCase() === id.toLowerCase());
  return found || COASTAL_LANES[0];
}
