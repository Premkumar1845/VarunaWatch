"""
VarunaWatch - Demo Data Generator
Comprehensive multi-state dataset covering all 9 Indian Coastal States and Union Territories (7,516+ km Coastline):
- Gujarat (1,600 km)
- Tamil Nadu (1,076 km)
- Andhra Pradesh (974 km)
- Maharashtra (720 km)
- Kerala (590 km)
- Odisha (480 km)
- Karnataka (320 km)
- West Bengal (157 km)
- Goa (101 km)
- Puducherry & Island UTs (1,000 km)
"""
import math
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# Seed for reproducibility
random.seed(42)

# ============================================================
#  COASTAL STATE / ZONE DEFINITIONS (PAN-INDIA)
# ============================================================

ZONES = [
    # --- ANDHRA PRADESH (ap) ---
    {
        "id": "zone-vsk-north", "state_id": "ap", "state_name": "Andhra Pradesh",
        "name": "Visakhapatnam Port & North", "district": "Visakhapatnam",
        "center": {"lat": 17.7500, "lng": 83.3000}, "population": 485000,
        "area_sq_km": 312, "elevation_avg": 45, "coastal": True,
        "polygon": [[83.20, 17.80], [83.40, 17.80], [83.40, 17.70], [83.20, 17.70], [83.20, 17.80]]
    },
    {
        "id": "zone-vsk-south", "state_id": "ap", "state_name": "Andhra Pradesh",
        "name": "Visakhapatnam Industrial South", "district": "Visakhapatnam",
        "center": {"lat": 17.6800, "lng": 83.2200}, "population": 620000,
        "area_sq_km": 285, "elevation_avg": 12, "coastal": True,
        "polygon": [[83.12, 17.73], [83.32, 17.73], [83.32, 17.63], [83.12, 17.63], [83.12, 17.73]]
    },
    {
        "id": "zone-kakinada", "state_id": "ap", "state_name": "Andhra Pradesh",
        "name": "Kakinada Deepwater Basin", "district": "Kakinada",
        "center": {"lat": 16.9891, "lng": 82.2475}, "population": 410000,
        "area_sq_km": 295, "elevation_avg": 5, "coastal": True,
        "polygon": [[82.15, 17.05], [82.35, 17.05], [82.35, 16.93], [82.15, 16.93], [82.15, 17.05]]
    },
    {
        "id": "zone-amalapuram", "state_id": "ap", "state_name": "Andhra Pradesh",
        "name": "Amalapuram Konaseema Delta", "district": "Konaseema",
        "center": {"lat": 16.5783, "lng": 82.0040}, "population": 290000,
        "area_sq_km": 450, "elevation_avg": 3, "coastal": True,
        "polygon": [[81.90, 16.65], [82.10, 16.65], [82.10, 16.50], [81.90, 16.50], [81.90, 16.65]]
    },
    {
        "id": "zone-machilipatnam", "state_id": "ap", "state_name": "Andhra Pradesh",
        "name": "Machilipatnam Estuary", "district": "Krishna",
        "center": {"lat": 16.1875, "lng": 81.1389}, "population": 350000,
        "area_sq_km": 310, "elevation_avg": 4, "coastal": True,
        "polygon": [[81.04, 16.25], [81.24, 16.25], [81.24, 16.12], [81.04, 16.12], [81.04, 16.25]]
    },

    # --- ODISHA (od) ---
    {
        "id": "zone-paradeep", "state_id": "od", "state_name": "Odisha",
        "name": "Paradip Port Industrial Complex", "district": "Jagatsinghpur",
        "center": {"lat": 20.2644, "lng": 86.6713}, "population": 320000,
        "area_sq_km": 280, "elevation_avg": 4, "coastal": True,
        "polygon": [[86.55, 20.35], [86.75, 20.35], [86.75, 20.20], [86.55, 20.20], [86.55, 20.35]]
    },
    {
        "id": "zone-puri", "state_id": "od", "state_name": "Odisha",
        "name": "Puri Coastal Littoral", "district": "Puri",
        "center": {"lat": 19.8135, "lng": 85.8312}, "population": 420000,
        "area_sq_km": 360, "elevation_avg": 6, "coastal": True,
        "polygon": [[85.70, 19.90], [85.95, 19.90], [85.95, 19.75], [85.70, 19.75], [85.70, 19.90]]
    },
    {
        "id": "zone-balasore", "state_id": "od", "state_name": "Odisha",
        "name": "Balasore & Chandipur Coast", "district": "Balasore",
        "center": {"lat": 21.4934, "lng": 86.9135}, "population": 380000,
        "area_sq_km": 410, "elevation_avg": 12, "coastal": True,
        "polygon": [[86.80, 21.60], [87.05, 21.60], [87.05, 21.40], [86.80, 21.40], [86.80, 21.60]]
    },
    {
        "id": "zone-gopalpur", "state_id": "od", "state_name": "Odisha",
        "name": "Gopalpur & Ganjam Port Basin", "district": "Ganjam",
        "center": {"lat": 19.2612, "lng": 84.8643}, "population": 290000,
        "area_sq_km": 340, "elevation_avg": 8, "coastal": True,
        "polygon": [[84.75, 19.35], [84.95, 19.35], [84.95, 19.20], [84.75, 19.20], [84.75, 19.35]]
    },

    # --- WEST BENGAL (wb) ---
    {
        "id": "zone-sundarbans", "state_id": "wb", "state_name": "West Bengal",
        "name": "Sundarbans Biosphere Delta", "district": "South 24 Parganas",
        "center": {"lat": 21.9497, "lng": 88.8999}, "population": 540000,
        "area_sq_km": 960, "elevation_avg": 2, "coastal": True,
        "polygon": [[88.60, 22.15], [89.10, 22.15], [89.10, 21.75], [88.60, 21.75], [88.60, 22.15]]
    },
    {
        "id": "zone-digha", "state_id": "wb", "state_name": "West Bengal",
        "name": "Digha & Shankarpur Littoral", "district": "East Medinipur",
        "center": {"lat": 21.6266, "lng": 87.5074}, "population": 210000,
        "area_sq_km": 240, "elevation_avg": 4, "coastal": True,
        "polygon": [[87.40, 21.70], [87.65, 21.70], [87.65, 21.55], [87.40, 21.55], [87.40, 21.70]]
    },
    {
        "id": "zone-haldia", "state_id": "wb", "state_name": "West Bengal",
        "name": "Haldia Industrial Dock Complex", "district": "East Medinipur",
        "center": {"lat": 22.0667, "lng": 88.0698}, "population": 310000,
        "area_sq_km": 210, "elevation_avg": 6, "coastal": True,
        "polygon": [[87.95, 22.15], [88.15, 22.15], [88.15, 22.00], [87.95, 22.00], [87.95, 22.15]]
    },

    # --- TAMIL NADU (tn) ---
    {
        "id": "zone-chennai-north", "state_id": "tn", "state_name": "Tamil Nadu",
        "name": "Chennai Port & Ennore Littoral", "district": "Chennai",
        "center": {"lat": 13.1200, "lng": 80.3000}, "population": 980000,
        "area_sq_km": 190, "elevation_avg": 5, "coastal": True,
        "polygon": [[80.20, 13.25], [80.38, 13.25], [80.38, 13.05], [80.20, 13.05], [80.20, 13.25]]
    },
    {
        "id": "zone-cuddalore", "state_id": "tn", "state_name": "Tamil Nadu",
        "name": "Cuddalore SIPCOT & Lowlands", "district": "Cuddalore",
        "center": {"lat": 11.7480, "lng": 79.7714}, "population": 360000,
        "area_sq_km": 320, "elevation_avg": 3, "coastal": True,
        "polygon": [[79.65, 11.85], [79.85, 11.85], [79.85, 11.65], [79.65, 11.65], [79.65, 11.85]]
    },
    {
        "id": "zone-nagapattinam", "state_id": "tn", "state_name": "Tamil Nadu",
        "name": "Nagapattinam & Velankanni Coast", "district": "Nagapattinam",
        "center": {"lat": 10.7672, "lng": 79.8449}, "population": 280000,
        "area_sq_km": 350, "elevation_avg": 3, "coastal": True,
        "polygon": [[79.72, 10.88], [79.92, 10.88], [79.92, 10.68], [79.72, 10.68], [79.72, 10.88]]
    },
    {
        "id": "zone-thoothukudi", "state_id": "tn", "state_name": "Tamil Nadu",
        "name": "Thoothukudi Port & VOC Belt", "district": "Thoothukudi",
        "center": {"lat": 8.7642, "lng": 78.1348}, "population": 440000,
        "area_sq_km": 310, "elevation_avg": 6, "coastal": True,
        "polygon": [[78.02, 8.88], [78.22, 8.88], [78.22, 8.68], [78.02, 8.68], [78.02, 8.88]]
    },

    # --- MAHARASHTRA (mh) ---
    {
        "id": "zone-mumbai-mmr", "state_id": "mh", "state_name": "Maharashtra",
        "name": "Mumbai Island & JNPT Terminal", "district": "Mumbai",
        "center": {"lat": 18.9500, "lng": 72.8500}, "population": 1450000,
        "area_sq_km": 220, "elevation_avg": 8, "coastal": True,
        "polygon": [[72.75, 19.10], [73.00, 19.10], [73.00, 18.88], [72.75, 18.88], [72.75, 19.10]]
    },
    {
        "id": "zone-raigad-alibaug", "state_id": "mh", "state_name": "Maharashtra",
        "name": "Raigad & Alibaug Coastal Strip", "district": "Raigad",
        "center": {"lat": 18.6414, "lng": 72.8722}, "population": 340000,
        "area_sq_km": 420, "elevation_avg": 5, "coastal": True,
        "polygon": [[72.75, 18.75], [72.98, 18.75], [72.98, 18.50], [72.75, 18.50], [72.75, 18.75]]
    },
    {
        "id": "zone-ratnagiri", "state_id": "mh", "state_name": "Maharashtra",
        "name": "Ratnagiri Konkan Port Corridor", "district": "Ratnagiri",
        "center": {"lat": 16.9902, "lng": 73.3120}, "population": 290000,
        "area_sq_km": 480, "elevation_avg": 25, "coastal": True,
        "polygon": [[73.18, 17.12], [73.42, 17.12], [73.42, 16.85], [73.18, 16.85], [73.18, 17.12]]
    },

    # --- GUJARAT (gj) ---
    {
        "id": "zone-kutch-kandla", "state_id": "gj", "state_name": "Gujarat",
        "name": "Gulf of Kutch & Deendayal Port", "district": "Kutch",
        "center": {"lat": 23.0033, "lng": 70.2189}, "population": 460000,
        "area_sq_km": 680, "elevation_avg": 4, "coastal": True,
        "polygon": [[70.05, 23.15], [70.35, 23.15], [70.35, 22.88], [70.05, 22.88], [70.05, 23.15]]
    },
    {
        "id": "zone-dwarka", "state_id": "gj", "state_name": "Gujarat",
        "name": "Devbhumi Dwarka Littoral", "district": "Devbhumi Dwarka",
        "center": {"lat": 22.2442, "lng": 68.9685}, "population": 220000,
        "area_sq_km": 390, "elevation_avg": 7, "coastal": True,
        "polygon": [[68.85, 22.35], [69.10, 22.35], [69.10, 22.12], [68.85, 22.12], [68.85, 22.35]]
    },
    {
        "id": "zone-surat-hazira", "state_id": "gj", "state_name": "Gujarat",
        "name": "Hazira Port & Tapi Estuary", "district": "Surat",
        "center": {"lat": 21.1200, "lng": 72.6500}, "population": 850000,
        "area_sq_km": 280, "elevation_avg": 6, "coastal": True,
        "polygon": [[72.50, 21.25], [72.80, 21.25], [72.80, 21.00], [72.50, 21.00], [72.50, 21.25]]
    },

    # --- KERALA (kl) ---
    {
        "id": "zone-kochi", "state_id": "kl", "state_name": "Kerala",
        "name": "Kochi Backwaters & Port", "district": "Ernakulam",
        "center": {"lat": 9.9312, "lng": 76.2673}, "population": 680000,
        "area_sq_km": 230, "elevation_avg": 2, "coastal": True,
        "polygon": [[76.15, 10.05], [76.38, 10.05], [76.38, 9.85], [76.15, 9.85], [76.15, 10.05]]
    },
    {
        "id": "zone-alappuzha", "state_id": "kl", "state_name": "Kerala",
        "name": "Alappuzha Kuttanad Lowlands", "district": "Alappuzha",
        "center": {"lat": 9.4981, "lng": 76.3388}, "population": 410000,
        "area_sq_km": 340, "elevation_avg": 1, "coastal": True,
        "polygon": [[76.20, 9.62], [76.45, 9.62], [76.45, 9.38], [76.20, 9.38], [76.20, 9.62]]
    },

    # --- KARNATAKA (ka) ---
    {
        "id": "zone-mangaluru", "state_id": "ka", "state_name": "Karnataka",
        "name": "Mangaluru Port & Netravati Basin", "district": "Dakshina Kannada",
        "center": {"lat": 12.9141, "lng": 74.8560}, "population": 490000,
        "area_sq_km": 290, "elevation_avg": 14, "coastal": True,
        "polygon": [[74.75, 13.02], [74.98, 13.02], [74.98, 12.80], [74.75, 12.80], [74.75, 13.02]]
    },
    {
        "id": "zone-karwar", "state_id": "ka", "state_name": "Karnataka",
        "name": "Karwar Sea Bird & Kali Estuary", "district": "Uttara Kannada",
        "center": {"lat": 14.8185, "lng": 74.1297}, "population": 190000,
        "area_sq_km": 310, "elevation_avg": 8, "coastal": True,
        "polygon": [[74.02, 14.92], [74.24, 14.92], [74.24, 14.72], [74.02, 14.72], [74.02, 14.92]]
    },

    # --- GOA (ga) ---
    {
        "id": "zone-mormugao", "state_id": "ga", "state_name": "Goa",
        "name": "Mormugao Port & Zuari Estuary", "district": "South Goa",
        "center": {"lat": 15.3850, "lng": 73.8050}, "population": 260000,
        "area_sq_km": 180, "elevation_avg": 10, "coastal": True,
        "polygon": [[73.72, 15.48], [73.92, 15.48], [73.92, 15.30], [73.72, 15.30], [73.72, 15.48]]
    },

    # --- UTs & ISLANDS (ut) ---
    {
        "id": "zone-puducherry", "state_id": "ut", "state_name": "Puducherry & UTs",
        "name": "Puducherry & Karaikal Coastal Enclave", "district": "Puducherry",
        "center": {"lat": 11.9416, "lng": 79.8083}, "population": 380000,
        "area_sq_km": 210, "elevation_avg": 3, "coastal": True,
        "polygon": [[79.72, 12.02], [79.88, 12.02], [79.88, 11.85], [79.72, 11.85], [79.72, 12.02]]
    }
]

# Quick map lookup
ZONE_MAP = {z["id"]: z for z in ZONES}


# ============================================================
#  INFRASTRUCTURE ASSETS (ALL 9 STATES & UTs)
# ============================================================

INFRASTRUCTURE_ASSETS = [
    # --- ANDHRA PRADESH (ap) ---
    {"id": "hosp-kgh", "state_id": "ap", "name": "King George Hospital (KGH)", "type": "hospital",
     "position": {"lat": 17.7215, "lng": 83.3119}, "zone_id": "zone-vsk-north",
     "criticality": 1.0, "capacity": 1200, "status": "Operational"},
    {"id": "hosp-kkd-gh", "state_id": "ap", "name": "Kakinada Government General Hospital", "type": "hospital",
     "position": {"lat": 16.9891, "lng": 82.2305}, "zone_id": "zone-kakinada",
     "criticality": 1.0, "capacity": 750, "status": "Operational"},
    {"id": "hosp-mchp-gh", "state_id": "ap", "name": "Machilipatnam District Hospital", "type": "hospital",
     "position": {"lat": 16.1900, "lng": 81.1350}, "zone_id": "zone-machilipatnam",
     "criticality": 1.0, "capacity": 350, "status": "Operational"},
    {"id": "pow-vsk-sub", "state_id": "ap", "name": "Visakhapatnam 400kV Grid Substation", "type": "power",
     "position": {"lat": 17.7100, "lng": 83.2900}, "zone_id": "zone-vsk-north",
     "criticality": 1.0, "capacity": None, "status": "Operational"},
    {"id": "pow-kkd-sub", "state_id": "ap", "name": "Kakinada Port 220kV Substation", "type": "power",
     "position": {"lat": 16.9750, "lng": 82.2200}, "zone_id": "zone-kakinada",
     "criticality": 1.0, "capacity": None, "status": "Operational"},
    {"id": "shlt-kkd-01", "state_id": "ap", "name": "Kakinada Coastal Multi-Purpose Shelter", "type": "shelter",
     "position": {"lat": 16.9950, "lng": 82.2400}, "zone_id": "zone-kakinada",
     "criticality": 0.5, "capacity": 1500, "status": "Open"},
    {"id": "shlt-amlp-01", "state_id": "ap", "name": "Amalapuram Central High School Cyclone Shelter", "type": "shelter",
     "position": {"lat": 16.5750, "lng": 82.0000}, "zone_id": "zone-amalapuram",
     "criticality": 0.5, "capacity": 1200, "status": "Open"},
    {"id": "brg-godavari", "state_id": "ap", "name": "Godavari Rail-Road Bridge Link", "type": "bridge",
     "position": {"lat": 16.9600, "lng": 81.7700}, "zone_id": "zone-amalapuram",
     "criticality": 0.8, "capacity": None, "status": "Operational"},

    # --- ODISHA (od) ---
    {"id": "hosp-puri-dh", "state_id": "od", "name": "Puri District Headquarters Hospital", "type": "hospital",
     "position": {"lat": 19.8150, "lng": 85.8300}, "zone_id": "zone-puri",
     "criticality": 1.0, "capacity": 550, "status": "Operational"},
    {"id": "hosp-paradeep-port", "state_id": "od", "name": "Paradip Port Trust Hospital", "type": "hospital",
     "position": {"lat": 20.2600, "lng": 86.6650}, "zone_id": "zone-paradeep",
     "criticality": 1.0, "capacity": 300, "status": "Operational"},
    {"id": "pow-paradeep-sub", "state_id": "od", "name": "Paradip OPTCL 220kV Grid Substation", "type": "power",
     "position": {"lat": 20.2700, "lng": 86.6800}, "zone_id": "zone-paradeep",
     "criticality": 1.0, "capacity": None, "status": "Operational"},
    {"id": "shlt-od-puri-01", "state_id": "od", "name": "Puri Marine Drive Multi-Purpose Cyclone Shelter", "type": "shelter",
     "position": {"lat": 19.8050, "lng": 85.8200}, "zone_id": "zone-puri",
     "criticality": 0.5, "capacity": 2000, "status": "Open"},
    {"id": "brg-mahanadi", "state_id": "od", "name": "Mahanadi River Estuary Bridge (Paradip Link)", "type": "bridge",
     "position": {"lat": 20.2800, "lng": 86.6400}, "zone_id": "zone-paradeep",
     "criticality": 0.9, "capacity": None, "status": "Operational"},

    # --- WEST BENGAL (wb) ---
    {"id": "hosp-digha-sgh", "state_id": "wb", "name": "Digha State General Hospital", "type": "hospital",
     "position": {"lat": 21.6300, "lng": 87.5100}, "zone_id": "zone-digha",
     "criticality": 1.0, "capacity": 300, "status": "Operational"},
    {"id": "hosp-haldia-sdh", "state_id": "wb", "name": "Haldia Sub-Divisional Hospital", "type": "hospital",
     "position": {"lat": 22.0700, "lng": 88.0750}, "zone_id": "zone-haldia",
     "criticality": 1.0, "capacity": 450, "status": "Operational"},
    {"id": "pow-haldia-sub", "state_id": "wb", "name": "Haldia Industrial 220kV Substation", "type": "power",
     "position": {"lat": 22.0600, "lng": 88.0600}, "zone_id": "zone-haldia",
     "criticality": 1.0, "capacity": None, "status": "Operational"},
    {"id": "shlt-sundarbans-01", "state_id": "wb", "name": "Kakdwip Sundarbans Cyclone Shelter", "type": "shelter",
     "position": {"lat": 21.9400, "lng": 88.8800}, "zone_id": "zone-sundarbans",
     "criticality": 0.6, "capacity": 1800, "status": "Open"},
    {"id": "brg-haldia-dock", "state_id": "wb", "name": "Haldia Dock Approach Flyover", "type": "bridge",
     "position": {"lat": 22.0550, "lng": 88.0500}, "zone_id": "zone-haldia",
     "criticality": 0.8, "capacity": None, "status": "Operational"},

    # --- TAMIL NADU (tn) ---
    {"id": "hosp-stanley-chn", "state_id": "tn", "name": "Stanley Medical College & Hospital (Chennai Port)", "type": "hospital",
     "position": {"lat": 13.1070, "lng": 80.2870}, "zone_id": "zone-chennai-north",
     "criticality": 1.0, "capacity": 1400, "status": "Operational"},
    {"id": "hosp-cuddalore-gh", "state_id": "tn", "name": "Cuddalore Government Headquarter Hospital", "type": "hospital",
     "position": {"lat": 11.7500, "lng": 79.7650}, "zone_id": "zone-cuddalore",
     "criticality": 1.0, "capacity": 600, "status": "Operational"},
    {"id": "pow-ennore-sub", "state_id": "tn", "name": "Ennore Thermal & 400kV Substation", "type": "power",
     "position": {"lat": 13.2000, "lng": 80.3200}, "zone_id": "zone-chennai-north",
     "criticality": 1.0, "capacity": None, "status": "Operational"},
    {"id": "shlt-nagai-01", "state_id": "tn", "name": "Nagapattinam Tsunami & Cyclone Relief Centre", "type": "shelter",
     "position": {"lat": 10.7600, "lng": 79.8400}, "zone_id": "zone-nagapattinam",
     "criticality": 0.5, "capacity": 2200, "status": "Open"},
    {"id": "brg-pamban", "state_id": "tn", "name": "New Pamban Sea Bridge Link", "type": "bridge",
     "position": {"lat": 9.2800, "lng": 79.1900}, "zone_id": "zone-nagapattinam",
     "criticality": 1.0, "capacity": None, "status": "Operational"},

    # --- MAHARASHTRA (mh) ---
    {"id": "hosp-kem-mumbai", "state_id": "mh", "name": "KEM Hospital & Medical Research (Mumbai)", "type": "hospital",
     "position": {"lat": 19.0020, "lng": 72.8420}, "zone_id": "zone-mumbai-mmr",
     "criticality": 1.0, "capacity": 1800, "status": "Operational"},
    {"id": "pow-tata-trombay", "state_id": "mh", "name": "Tata Trombay & JNPT Power Grid 400kV", "type": "power",
     "position": {"lat": 19.0100, "lng": 72.9100}, "zone_id": "zone-mumbai-mmr",
     "criticality": 1.0, "capacity": None, "status": "Operational"},
    {"id": "shlt-alibaug-01", "state_id": "mh", "name": "Alibaug Konkan Coastal Emergency Shelter", "type": "shelter",
     "position": {"lat": 18.6400, "lng": 72.8700}, "zone_id": "zone-raigad-alibaug",
     "criticality": 0.5, "capacity": 1200, "status": "Open"},
    {"id": "brg-mthl", "state_id": "mh", "name": "Atal Setu (Mumbai Trans Harbour Link)", "type": "bridge",
     "position": {"lat": 18.9900, "lng": 72.9300}, "zone_id": "zone-mumbai-mmr",
     "criticality": 1.0, "capacity": None, "status": "Operational"},

    # --- GUJARAT (gj) ---
    {"id": "hosp-kandla-port", "state_id": "gj", "name": "Deendayal Port Trust Hospital (Gandhidham)", "type": "hospital",
     "position": {"lat": 23.0700, "lng": 70.1300}, "zone_id": "zone-kutch-kandla",
     "criticality": 1.0, "capacity": 450, "status": "Operational"},
    {"id": "pow-hazira-sub", "state_id": "gj", "name": "Hazira Industrial Power Complex 400kV", "type": "power",
     "position": {"lat": 21.1100, "lng": 72.6400}, "zone_id": "zone-surat-hazira",
     "criticality": 1.0, "capacity": None, "status": "Operational"},
    {"id": "shlt-dwarka-01", "state_id": "gj", "name": "Dwarka Coastal Emergency Cyclone Relief Centre", "type": "shelter",
     "position": {"lat": 22.2400, "lng": 68.9600}, "zone_id": "zone-dwarka",
     "criticality": 0.5, "capacity": 1600, "status": "Open"},
    {"id": "brg-sudarshan", "state_id": "gj", "name": "Sudarshan Setu (Okha-Beyt Dwarka Bridge)", "type": "bridge",
     "position": {"lat": 22.4600, "lng": 69.0700}, "zone_id": "zone-dwarka",
     "criticality": 0.9, "capacity": None, "status": "Operational"},

    # --- KERALA (kl) ---
    {"id": "hosp-ernakulam-gh", "state_id": "kl", "name": "Ernakulam General Hospital (Kochi)", "type": "hospital",
     "position": {"lat": 9.9720, "lng": 76.2810}, "zone_id": "zone-kochi",
     "criticality": 1.0, "capacity": 800, "status": "Operational"},
    {"id": "pow-kalamassery-sub", "state_id": "kl", "name": "Kalamassery 220kV Grid Substation", "type": "power",
     "position": {"lat": 10.0500, "lng": 76.3200}, "zone_id": "zone-kochi",
     "criticality": 1.0, "capacity": None, "status": "Operational"},
    {"id": "shlt-alappuzha-01", "state_id": "kl", "name": "Kuttanad Waterway Evacuation Shelter", "type": "shelter",
     "position": {"lat": 9.5000, "lng": 76.3400}, "zone_id": "zone-alappuzha",
     "criticality": 0.6, "capacity": 1500, "status": "Open"},
    {"id": "brg-vallarpadam", "state_id": "kl", "name": "Vallarpadam International Container Terminal Bridge", "type": "bridge",
     "position": {"lat": 9.9900, "lng": 76.2600}, "zone_id": "zone-kochi",
     "criticality": 0.8, "capacity": None, "status": "Operational"},

    # --- KARNATAKA (ka) ---
    {"id": "hosp-wenlock-mng", "state_id": "ka", "name": "Government Wenlock Hospital (Mangaluru)", "type": "hospital",
     "position": {"lat": 12.8650, "lng": 74.8450}, "zone_id": "zone-mangaluru",
     "criticality": 1.0, "capacity": 900, "status": "Operational"},
    {"id": "pow-kavoor-sub", "state_id": "ka", "name": "Kavoor 220kV Coastal Substation", "type": "power",
     "position": {"lat": 12.9200, "lng": 74.8600}, "zone_id": "zone-mangaluru",
     "criticality": 1.0, "capacity": None, "status": "Operational"},
    {"id": "brg-netravati", "state_id": "ka", "name": "Netravati River NH-66 Coastal Bridge", "type": "bridge",
     "position": {"lat": 12.8400, "lng": 74.8600}, "zone_id": "zone-mangaluru",
     "criticality": 0.8, "capacity": None, "status": "Operational"},

    # --- GOA (ga) ---
    {"id": "hosp-gmc-bambolim", "state_id": "ga", "name": "Goa Medical College Hospital (Bambolim)", "type": "hospital",
     "position": {"lat": 15.4600, "lng": 73.8500}, "zone_id": "zone-mormugao",
     "criticality": 1.0, "capacity": 1100, "status": "Operational"},
    {"id": "brg-zuari", "state_id": "ga", "name": "New Zuari Bridge (NH-66 Goa Link)", "type": "bridge",
     "position": {"lat": 15.4100, "lng": 73.8700}, "zone_id": "zone-mormugao",
     "criticality": 0.8, "capacity": None, "status": "Operational"},

    # --- UTs & ISLANDS (ut) ---
    {"id": "hosp-puducherry-gh", "state_id": "ut", "name": "Indira Gandhi Govt General Hospital (Puducherry)", "type": "hospital",
     "position": {"lat": 11.9350, "lng": 79.8300}, "zone_id": "zone-puducherry",
     "criticality": 1.0, "capacity": 650, "status": "Operational"},
]


# ============================================================
#  ROAD NETWORK SEGMENTS (COASTAL HIGHWAYS)
# ============================================================

ROAD_SEGMENTS = [
    # AP
    {"id": "road-nh16-vsk-kkd", "state_id": "ap", "name": "NH-16 Vizag–Kakinada Corridor", "road_type": "National Highway",
     "length_km": 165, "zone_id": "zone-kakinada",
     "geometry": {"type": "LineString", "coordinates": [[83.30, 17.72], [83.00, 17.35], [82.25, 16.99]]}},
    {"id": "road-sh-kkd-amlp", "state_id": "ap", "name": "SH Kakinada–Amalapuram Delta Link", "road_type": "State Highway",
     "length_km": 55, "zone_id": "zone-amalapuram",
     "geometry": {"type": "LineString", "coordinates": [[82.25, 16.99], [82.00, 16.58]]}},
    {"id": "road-nh16-mchp", "state_id": "ap", "name": "NH-165 Machilipatnam Coastal Highway", "road_type": "National Highway",
     "length_km": 70, "zone_id": "zone-machilipatnam",
     "geometry": {"type": "LineString", "coordinates": [[81.10, 16.71], [81.14, 16.19]]}},

    # Odisha
    {"id": "road-nh53-paradeep", "state_id": "od", "name": "NH-53 Cuttack–Paradip Expressway", "road_type": "National Highway",
     "length_km": 85, "zone_id": "zone-paradeep",
     "geometry": {"type": "LineString", "coordinates": [[85.90, 20.45], [86.30, 20.35], [86.67, 20.26]]}},
    {"id": "road-sh316-puri", "state_id": "od", "name": "NH-316 Bhubaneswar–Puri Highway", "road_type": "National Highway",
     "length_km": 60, "zone_id": "zone-puri",
     "geometry": {"type": "LineString", "coordinates": [[85.82, 20.25], [85.84, 20.05], [85.83, 19.81]]}},

    # West Bengal
    {"id": "road-nh116-haldia", "state_id": "wb", "name": "NH-116 Kolaghat–Haldia Port Highway", "road_type": "National Highway",
     "length_km": 55, "zone_id": "zone-haldia",
     "geometry": {"type": "LineString", "coordinates": [[87.85, 22.40], [87.95, 22.20], [88.07, 22.06]]}},
    {"id": "road-nh116b-digha", "state_id": "wb", "name": "NH-116B Nandakumar–Digha Coastal Road", "road_type": "National Highway",
     "length_km": 90, "zone_id": "zone-digha",
     "geometry": {"type": "LineString", "coordinates": [[87.90, 22.25], [87.75, 21.90], [87.51, 21.62]]}},

    # Tamil Nadu
    {"id": "road-ecr-chennai-cuddalore", "state_id": "tn", "name": "East Coast Road (ECR) Chennai–Cuddalore", "road_type": "Expressway",
     "length_km": 160, "zone_id": "zone-chennai-north",
     "geometry": {"type": "LineString", "coordinates": [[80.28, 13.08], [80.00, 12.50], [79.77, 11.75]]}},
    {"id": "road-nh32-nagai", "state_id": "tn", "name": "NH-32 Cuddalore–Nagapattinam Coastal Route", "road_type": "National Highway",
     "length_km": 95, "zone_id": "zone-nagapattinam",
     "geometry": {"type": "LineString", "coordinates": [[79.77, 11.75], [79.80, 11.30], [79.84, 10.76]]}},

    # Maharashtra
    {"id": "road-nh66-mumbai-goa", "state_id": "mh", "name": "NH-66 Mumbai–Goa Konkan Highway", "road_type": "National Highway",
     "length_km": 475, "zone_id": "zone-mumbai-mmr",
     "geometry": {"type": "LineString", "coordinates": [[73.00, 19.00], [73.20, 18.20], [73.31, 16.99]]}},

    # Gujarat
    {"id": "road-nh41-kandla", "state_id": "gj", "name": "NH-41 Kandla–Mundra Coastal Corridor", "road_type": "National Highway",
     "length_km": 75, "zone_id": "zone-kutch-kandla",
     "geometry": {"type": "LineString", "coordinates": [[70.22, 23.00], [69.90, 22.90], [69.72, 22.84]]}},
    {"id": "road-nh51-dwarka-porbandar", "state_id": "gj", "name": "NH-51 Coastal Highway Dwarka–Porbandar", "road_type": "National Highway",
     "length_km": 105, "zone_id": "zone-dwarka",
     "geometry": {"type": "LineString", "coordinates": [[68.96, 22.24], [69.30, 21.90], [69.60, 21.64]]}},

    # Kerala
    {"id": "road-nh66-kochi-alappuzha", "state_id": "kl", "name": "NH-66 Coastal Link Kochi–Alappuzha", "road_type": "National Highway",
     "length_km": 65, "zone_id": "zone-kochi",
     "geometry": {"type": "LineString", "coordinates": [[76.26, 9.93], [76.30, 9.70], [76.33, 9.49]]}},

    # Karnataka
    {"id": "road-nh66-karavali", "state_id": "ka", "name": "NH-66 Karavali Coast Mangaluru–Karwar", "road_type": "National Highway",
     "length_km": 270, "zone_id": "zone-mangaluru",
     "geometry": {"type": "LineString", "coordinates": [[74.85, 12.91], [74.74, 13.34], [74.12, 14.81]]}},
]


# ============================================================
#  CYCLONE SCENARIO TELEMETRY (DYNAMIC PER STATE / BASIN)
# ============================================================

STATE_CYCLONE_MAP = {
    "ap": {
        "name": "Cyclone Michaung", "category": 3, "wind_speed": 165, "pressure": 962,
        "position": {"lat": 16.2, "lng": 83.8}, "direction": "WNW", "speed_of_movement": 18,
        "eta_landfall": "~14 hours", "status": "Active — Bay of Bengal East Littoral Vector"
    },
    "od": {
        "name": "Cyclone Dana", "category": 4, "wind_speed": 195, "pressure": 950,
        "position": {"lat": 19.4, "lng": 87.2}, "direction": "NW", "speed_of_movement": 16,
        "eta_landfall": "~10 hours", "status": "Severe Cyclonic Storm — Dhamra/Puri Corridor"
    },
    "wb": {
        "name": "Cyclone Remal", "category": 3, "wind_speed": 150, "pressure": 968,
        "position": {"lat": 20.8, "lng": 89.2}, "direction": "NNE", "speed_of_movement": 20,
        "eta_landfall": "~8 hours", "status": "Active — Sundarbans & Sagar Island Sector"
    },
    "tn": {
        "name": "Cyclone Mandous", "category": 3, "wind_speed": 160, "pressure": 964,
        "position": {"lat": 12.1, "lng": 81.8}, "direction": "NW", "speed_of_movement": 17,
        "eta_landfall": "~16 hours", "status": "Severe — Chennai & Cuddalore Coromandel Track"
    },
    "mh": {
        "name": "Cyclone Tauktae", "category": 3, "wind_speed": 175, "pressure": 958,
        "position": {"lat": 17.8, "lng": 71.8}, "direction": "NNW", "speed_of_movement": 22,
        "eta_landfall": "~18 hours", "status": "Extremely Severe — Konkan / Mumbai Outer Ring"
    },
    "gj": {
        "name": "Cyclone Biparjoy", "category": 4, "wind_speed": 210, "pressure": 942,
        "position": {"lat": 21.6, "lng": 68.2}, "direction": "NE", "speed_of_movement": 14,
        "eta_landfall": "~12 hours", "status": "Very Severe — Kutch & Saurashtra Landfall Sector"
    },
    "kl": {
        "name": "Cyclone Ockhi", "category": 2, "wind_speed": 130, "pressure": 980,
        "position": {"lat": 8.9, "lng": 75.1}, "direction": "NNW", "speed_of_movement": 19,
        "eta_landfall": "~22 hours", "status": "Depression Escalation — Malabar Sea Vector"
    },
    "ka": {
        "name": "Karavali Deep Vector", "category": 2, "wind_speed": 125, "pressure": 982,
        "position": {"lat": 13.5, "lng": 73.2}, "direction": "N", "speed_of_movement": 15,
        "eta_landfall": "~24 hours", "status": "Monsoon Squall Front — Mangaluru Outer Zone"
    },
    "ga": {
        "name": "Konkan Surge Vector", "category": 2, "wind_speed": 115, "pressure": 985,
        "position": {"lat": 15.0, "lng": 72.8}, "direction": "NNE", "speed_of_movement": 16,
        "eta_landfall": "~20 hours", "status": "Active Maritime Storm — Mormugao Approach"
    },
    "ut": {
        "name": "Cyclone Varuna UT", "category": 3, "wind_speed": 160, "pressure": 965,
        "position": {"lat": 11.2, "lng": 81.5}, "direction": "WNW", "speed_of_movement": 18,
        "eta_landfall": "~15 hours", "status": "Coastal Enclave Early Warning"
    },
    "all": {
        "name": "Cyclone Michaung & Biparjoy (Dual Basin)", "category": 3, "wind_speed": 165, "pressure": 960,
        "position": {"lat": 16.2, "lng": 83.8}, "direction": "WNW", "speed_of_movement": 18,
        "eta_landfall": "~14 hours", "status": "Pan-India Coastal Threat Monitoring"
    }
}


def get_demo_cyclone(state_id: Optional[str] = None) -> Dict[str, Any]:
    """Returns current cyclone status tailored to state or national grid."""
    key = state_id.lower() if state_id and state_id.lower() in STATE_CYCLONE_MAP else "all"
    item = STATE_CYCLONE_MAP.get(key, STATE_CYCLONE_MAP["all"])
    return {
        "id": f"cyc-{key}-2026",
        "name": item["name"],
        "category": item["category"],
        "wind_speed": item["wind_speed"],
        "pressure": item["pressure"],
        "position": item["position"],
        "direction": item["direction"],
        "speed_of_movement": item["speed_of_movement"],
        "eta_landfall": item["eta_landfall"],
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": item["status"],
    }


def get_demo_track(state_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns track points tailored to the state."""
    cyclone = get_demo_cyclone(state_id)
    c_lat, c_lng = cyclone["position"]["lat"], cyclone["position"]["lng"]
    base_time = datetime.utcnow() - timedelta(hours=36)
    track = []

    # Generate 6 past points and 4 forecast points around cyclone center
    for i in range(6):
        t_lat = c_lat - (5 - i) * 0.4
        t_lng = c_lng + (5 - i) * 0.5
        track.append({
            "position": {"lat": round(t_lat, 2), "lng": round(t_lng, 2)},
            "timestamp": (base_time + timedelta(hours=i * 6)).isoformat() + "Z",
            "wind_speed": int(cyclone["wind_speed"] * (0.6 + 0.08 * i)),
            "pressure": int(cyclone["pressure"] + (6 - i) * 5),
            "category": max(1, cyclone["category"] - 1),
            "is_forecast": False
        })

    # Current point
    track.append({
        "position": {"lat": c_lat, "lng": c_lng},
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "wind_speed": cyclone["wind_speed"],
        "pressure": cyclone["pressure"],
        "category": cyclone["category"],
        "is_forecast": False
    })

    # Forecast points
    for j in range(1, 5):
        f_lat = c_lat + j * 0.35
        f_lng = c_lng - j * 0.45
        track.append({
            "position": {"lat": round(f_lat, 2), "lng": round(f_lng, 2)},
            "timestamp": (datetime.utcnow() + timedelta(hours=j * 6)).isoformat() + "Z",
            "wind_speed": int(cyclone["wind_speed"] * (1.0 - 0.08 * j)),
            "pressure": int(cyclone["pressure"] + j * 4),
            "category": max(1, cyclone["category"] - (1 if j > 2 else 0)),
            "is_forecast": True
        })

    return track


def get_demo_forecast_cone(state_id: Optional[str] = None) -> List[List[float]]:
    """Returns forecast polygon cone."""
    cyclone = get_demo_cyclone(state_id)
    c_lat, c_lng = cyclone["position"]["lat"], cyclone["position"]["lng"]
    return [
        [round(c_lng + 0.6, 2), round(c_lat, 2)],
        [round(c_lng + 0.8, 2), round(c_lat - 0.5, 2)],
        [round(c_lng - 0.2, 2), round(c_lat + 0.8, 2)],
        [round(c_lng - 0.9, 2), round(c_lat + 1.4, 2)],
        [round(c_lng - 1.4, 2), round(c_lat + 1.8, 2)],
        [round(c_lng - 0.8, 2), round(c_lat + 1.9, 2)],
        [round(c_lng - 0.2, 2), round(c_lat + 1.5, 2)],
        [round(c_lng + 0.4, 2), round(c_lat + 0.6, 2)],
        [round(c_lng + 0.6, 2), round(c_lat, 2)]
    ]


def get_demo_rainfall_forecast(state_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns hourly rainfall forecast."""
    base_time = datetime.utcnow()
    forecast = []
    for h in range(48):
        t = h / 48.0
        if t < 0.3:
            rain = 5 + 40 * (t / 0.3)
        elif t < 0.6:
            rain = 45 + 50 * math.sin((t - 0.3) / 0.3 * math.pi)
        else:
            rain = 45 * (1 - (t - 0.6) / 0.4)
        forecast.append({
            "time": (base_time + timedelta(hours=h)).isoformat() + "Z",
            "hour": h,
            "rainfall_mm": round(max(0, rain + random.uniform(-3, 3)), 1),
            "probability": round(min(1.0, max(0.1, 0.4 + rain / 120)), 2),
        })
    return forecast


def get_demo_wind_forecast(state_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns hourly wind forecast."""
    base_time = datetime.utcnow()
    cyclone = get_demo_cyclone(state_id)
    peak = cyclone["wind_speed"]
    forecast = []
    for h in range(48):
        t = h / 48.0
        if t < 0.35:
            speed = 40 + (peak - 40) * (t / 0.35)
        elif t < 0.55:
            speed = peak - 15 * ((t - 0.35) / 0.2)
        else:
            speed = (peak - 15) - (peak - 55) * ((t - 0.55) / 0.45)
        forecast.append({
            "time": (base_time + timedelta(hours=h)).isoformat() + "Z",
            "hour": h,
            "wind_speed_kmh": round(max(25, speed + random.uniform(-6, 6)), 1),
            "gust_kmh": round(max(35, speed * 1.25 + random.uniform(-8, 8)), 1),
        })
    return forecast


# ============================================================
#  RISK & HAZARD SCORING ENGINE
# ============================================================

RISK_WEIGHTS = {
    "flood": 0.30,
    "rainfall": 0.20,
    "wind": 0.15,
    "surge": 0.15,
    "vulnerability": 0.20,
}

def calculate_risk_level(score: float) -> str:
    if score >= 81:
        return "Extreme"
    elif score >= 61:
        return "Very High"
    elif score >= 41:
        return "High"
    elif score >= 21:
        return "Moderate"
    else:
        return "Low"


def compute_zone_hazards(zone: Dict, category: int = 3, rainfall_mult: float = 1.0) -> Dict[str, float]:
    elevation = zone.get("elevation_avg", 20)
    is_coastal = zone.get("coastal", False)
    pop_density = zone.get("population", 200000) / max(zone.get("area_sq_km", 300), 1)

    cat_wind = {1: 0.3, 2: 0.5, 3: 0.7, 4: 0.85, 5: 1.0}
    cat_surge = {1: 0.2, 2: 0.4, 3: 0.65, 4: 0.85, 5: 1.0}
    cat_rain = {1: 0.4, 2: 0.6, 3: 0.75, 4: 0.9, 5: 1.0}

    wind_factor = cat_wind.get(category, 0.7)
    surge_factor = cat_surge.get(category, 0.65)
    rain_factor = cat_rain.get(category, 0.75) * rainfall_mult

    flood_base = max(0, 100 - elevation * 2.2)
    flood_score = min(100, flood_base * rain_factor * 0.9)
    rainfall_score = min(100, 68 * rain_factor)
    wind_score = min(100, 85 * wind_factor)

    if is_coastal:
        surge_base = max(0, 100 - elevation * 3.5)
        surge_score = min(100, surge_base * surge_factor)
    else:
        surge_score = max(0, 8 - elevation * 0.2)

    vuln_score = min(100, pop_density * 0.04 + (35 if is_coastal else 15))

    return {
        "flood_score": round(flood_score, 1),
        "rainfall_score": round(rainfall_score, 1),
        "wind_score": round(wind_score, 1),
        "surge_score": round(surge_score, 1),
        "vulnerability_score": round(vuln_score, 1),
    }


def compute_zone_risk(hazards: Dict[str, float]) -> float:
    risk = (
        RISK_WEIGHTS["flood"] * hazards["flood_score"] +
        RISK_WEIGHTS["rainfall"] * hazards["rainfall_score"] +
        RISK_WEIGHTS["wind"] * hazards["wind_score"] +
        RISK_WEIGHTS["surge"] * hazards["surge_score"] +
        RISK_WEIGHTS["vulnerability"] * hazards["vulnerability_score"]
    )
    return round(min(100, max(0, risk)), 1)


def get_demo_hazard_zones(category: int = 3, rainfall_mult: float = 1.0, state_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Generate hazard zone data, filtered optionally by state."""
    target_zones = ZONES
    if state_id and state_id.lower() != "all":
        target_zones = [z for z in ZONES if z.get("state_id") == state_id.lower()]
        if not target_zones:
            target_zones = ZONES

    zones_data = []
    for zone in target_zones:
        hazards = compute_zone_hazards(zone, category, rainfall_mult)
        risk_score = compute_zone_risk(hazards)
        zones_data.append({
            **zone,
            **hazards,
            "risk_score": risk_score,
            "risk_level": calculate_risk_level(risk_score),
            "historical_events": random.randint(3, 14),
            "last_major_event": "Cyclone Michaung (2023)" if zone.get("state_id") in ["ap", "tn"] else "Cyclone Dana (2024)",
        })
    return sorted(zones_data, key=lambda z: z["risk_score"], reverse=True)


RECOMMENDED_ACTIONS_MAP = {
    "hospital": {
        "Extreme": ["EVACUATE patients to backup facility", "Deploy mobile medical units", "Pre-position oxygen & fuel"],
        "Very High": ["Prepare patient transfer protocols", "Secure backup power generators", "Alert emergency trauma teams"],
        "High": ["Review emergency response plan", "Verify generator fuel reserves", "Stock 72-hour life-saving drugs"],
        "Moderate": ["Monitor weather telemetry", "Verify communication links"],
        "Low": ["Standard baseline monitoring"],
    },
    "power": {
        "Extreme": ["Initiate controlled sectional shutdown", "Deploy marine restoration crews", "Coordinate with hospitals for captive power"],
        "Very High": ["Pre-position mobile transformer units", "Secure switchyard control rooms", "Notify essential services"],
        "High": ["Inspect and reinforce transmission pylons", "Test black-start systems"],
        "Moderate": ["Vegetation clearance along feeder lines"],
        "Low": ["Routine grid checks"],
    },
    "shelter": {
        "Extreme": ["Activate full shelter capacity", "Deploy NDRF/SDRF relief rations", "Organize continuous bus evacuation"],
        "Very High": ["Open shelters for voluntary evacuation", "Stock drinking water and medical packs"],
        "High": ["Inspect roof and sanitary readiness", "Pre-position ration kits"],
        "Moderate": ["Place shelter managers on active standby"],
        "Low": ["Routine readiness check"],
    },
    "bridge": {
        "Extreme": ["CLOSE bridge to all vehicular traffic", "Deploy structural monitoring sensors", "Activate inland bypass route"],
        "Very High": ["Restrict heavy articulated trucks", "Deploy police checkpoint", "Prepare closure barriers"],
        "High": ["Monitor estuarine water velocity and scouring", "Inspect expansion joints"],
        "Moderate": ["Check drainage clearance"],
        "Low": ["Routine inspection"],
    },
    "road": {
        "Extreme": ["Close highway corridor immediately", "Deploy watercraft diversion", "Broadcast emergency radio alert"],
        "Very High": ["Restrict non-essential movement", "Pre-position earthmovers & dewatering pumps"],
        "High": ["Clear drainage culverts", "Monitor low-lying causeways"],
        "Moderate": ["Standard highway patrol"],
        "Low": ["No restriction"],
    },
}


def compute_asset_vulnerability(asset: Dict, zone_hazards: Dict, category: int = 3) -> Dict[str, Any]:
    criticality = asset.get("criticality", 0.5)
    asset_type = asset["type"]

    flood_exposure = zone_hazards.get("flood_score", 50)
    wind_exposure = zone_hazards.get("wind_score", 50)
    surge_exposure = zone_hazards.get("surge_score", 30)

    accessibility_risk = min(100, flood_exposure * 0.6 + wind_exposure * 0.2 + 10)
    hazard_exposure = (flood_exposure * 0.4 + wind_exposure * 0.3 + surge_exposure * 0.3)
    vulnerability = min(100, hazard_exposure * (0.5 + 0.5 * criticality) * (1 + accessibility_risk / 200))

    risk_level = calculate_risk_level(vulnerability)
    actions = RECOMMENDED_ACTIONS_MAP.get(asset_type, {}).get(risk_level, ["Monitor telemetry"])

    status = "Critical" if vulnerability >= 80 else ("At Risk" if vulnerability >= 60 else "Operational")

    return {
        "vulnerability_score": round(vulnerability, 1),
        "risk_level": risk_level,
        "flood_exposure": round(flood_exposure, 1),
        "wind_exposure": round(wind_exposure, 1),
        "surge_exposure": round(surge_exposure, 1),
        "accessibility_risk": round(accessibility_risk, 1),
        "recommended_actions": actions,
        "backup_power_available": asset_type == "hospital" or (asset_type == "shelter" and vulnerability < 70),
        "last_inspection": "2026-08-15",
        "status": status,
    }


def get_demo_infrastructure(category: int = 3, rainfall_mult: float = 1.0, state_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Generate infrastructure assets with vulnerability scores, filtered optionally by state."""
    target_assets = INFRASTRUCTURE_ASSETS
    if state_id and state_id.lower() != "all":
        target_assets = [a for a in INFRASTRUCTURE_ASSETS if a.get("state_id") == state_id.lower()]
        if not target_assets:
            target_assets = INFRASTRUCTURE_ASSETS

    zone_hazard_map = {}
    for zone in ZONES:
        zone_hazard_map[zone["id"]] = compute_zone_hazards(zone, category, rainfall_mult)

    assets = []
    for asset in target_assets:
        zone_id = asset.get("zone_id", "zone-kakinada")
        zone_hazards = zone_hazard_map.get(zone_id, {})
        vuln = compute_asset_vulnerability(asset, zone_hazards, category)
        zone_info = ZONE_MAP.get(zone_id, {})

        assets.append({
            **asset,
            "zone_name": zone_info.get("name", "Coastal Zone"),
            "district": zone_info.get("district", "Coastal District"),
            "state_name": zone_info.get("state_name", "Coastal State"),
            **vuln,
        })

    return sorted(assets, key=lambda a: a["vulnerability_score"], reverse=True)


def get_demo_roads(category: int = 3, rainfall_mult: float = 1.0, state_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Generate road segments with risk scores, filtered optionally by state."""
    target_roads = ROAD_SEGMENTS
    if state_id and state_id.lower() != "all":
        target_roads = [r for r in ROAD_SEGMENTS if r.get("state_id") == state_id.lower()]
        if not target_roads:
            target_roads = ROAD_SEGMENTS

    zone_hazard_map = {}
    for zone in ZONES:
        zone_hazard_map[zone["id"]] = compute_zone_hazards(zone, category, rainfall_mult)

    segments = []
    for road in target_roads:
        zone_id = road.get("zone_id", "zone-kakinada")
        hazards = zone_hazard_map.get(zone_id, {})

        risk = (hazards.get("flood_score", 40) * 0.5 +
                hazards.get("wind_score", 30) * 0.2 +
                hazards.get("surge_score", 20) * 0.3)
        risk = min(100, risk)
        risk_level = calculate_risk_level(risk)

        if risk >= 75:
            access = "Likely Blocked"
        elif risk >= 55:
            access = "Restricted"
        elif risk >= 35:
            access = "Partially Affected"
        else:
            access = "Open"

        zone_info = ZONE_MAP.get(zone_id, {})
        segments.append({
            **road,
            "zone_name": zone_info.get("name", "Coastal Corridor"),
            "state_name": zone_info.get("state_name", "Coastal State"),
            "risk_score": round(risk, 1),
            "risk_level": risk_level,
            "accessibility": access,
            "factors": {
                "flood_risk": round(hazards.get("flood_score", 0), 1),
                "wind_debris": round(hazards.get("wind_score", 0), 1),
                "surge_inundation": round(hazards.get("surge_score", 0), 1),
            }
        })

    return sorted(segments, key=lambda r: r["risk_score"], reverse=True)


def get_demo_risk_summary(category: int = 3, rainfall_mult: float = 1.0, state_id: Optional[str] = None) -> Dict[str, Any]:
    """Compute overall risk summary across zones and assets for state or all India."""
    zones = get_demo_hazard_zones(category, rainfall_mult, state_id)
    infra = get_demo_infrastructure(category, rainfall_mult, state_id)
    roads = get_demo_roads(category, rainfall_mult, state_id)

    total_pop = sum(z["population"] for z in zones)
    pop_exposed = sum(z["population"] for z in zones if z["risk_score"] >= 40)

    hospitals = [a for a in infra if a["type"] == "hospital"]
    hospitals_at_risk = sum(1 for h in hospitals if h["vulnerability_score"] >= 50)

    power = [a for a in infra if a["type"] == "power"]
    power_at_risk = sum(1 for p in power if p["vulnerability_score"] >= 50)

    shelters = [a for a in infra if a["type"] == "shelter"]
    shelters_at_risk = sum(1 for s in shelters if s["vulnerability_score"] >= 50)

    total_road_km = sum(r["length_km"] for r in roads)
    affected_road_km = sum(r["length_km"] for r in roads if r["risk_score"] >= 40)

    overall_risk = sum(z["risk_score"] * z["population"] for z in zones) / max(total_pop, 1)

    return {
        "overall_risk_score": round(overall_risk, 1),
        "overall_risk_level": calculate_risk_level(overall_risk),
        "population_total": total_pop,
        "population_exposed": pop_exposed,
        "hospitals_total": len(hospitals),
        "hospitals_at_risk": hospitals_at_risk,
        "power_assets_total": len(power),
        "power_assets_at_risk": power_at_risk,
        "shelters_total": len(shelters),
        "shelters_available": len(shelters) - shelters_at_risk,
        "shelters_at_risk": shelters_at_risk,
        "total_road_km": total_road_km,
        "road_km_affected": affected_road_km,
        "bridges_total": sum(1 for a in infra if a["type"] == "bridge"),
        "bridges_at_risk": sum(1 for a in infra if a["type"] == "bridge" and a["vulnerability_score"] >= 50),
        "top_risks": [
            {"zone": z["name"], "score": z["risk_score"], "level": z["risk_level"], "population": z["population"], "state": z.get("state_name")}
            for z in zones[:5]
        ],
        "zone_breakdown": [
            {"zone": z["name"], "score": z["risk_score"], "level": z["risk_level"], "state": z.get("state_name")}
            for z in zones
        ],
    }


CATEGORY_PARAMS = {
    1: {"wind_speed": 90, "rainfall_mm": 150, "surge_height": 1.2},
    2: {"wind_speed": 120, "rainfall_mm": 200, "surge_height": 2.0},
    3: {"wind_speed": 165, "rainfall_mm": 280, "surge_height": 3.5},
    4: {"wind_speed": 200, "rainfall_mm": 350, "surge_height": 5.0},
    5: {"wind_speed": 250, "rainfall_mm": 450, "surge_height": 7.0},
}


def simulate_scenario(category: int, rainfall_multiplier: float = 1.0, state_id: Optional[str] = None) -> Dict[str, Any]:
    """Run a digital twin scenario simulation for a state or national grid."""
    params = CATEGORY_PARAMS.get(category, CATEGORY_PARAMS[3])
    summary = get_demo_risk_summary(category, rainfall_multiplier, state_id)
    current = get_demo_risk_summary(3, 1.0, state_id)

    zones = get_demo_hazard_zones(category, rainfall_multiplier, state_id)
    zone_impacts = [
        {
            "zone": z["name"],
            "risk_score": z["risk_score"],
            "risk_level": z["risk_level"],
            "population": z["population"],
            "flood_score": z["flood_score"],
            "wind_score": z["wind_score"],
            "surge_score": z["surge_score"],
            "state_name": z.get("state_name")
        }
        for z in zones
    ]

    return {
        "category": category,
        "rainfall_multiplier": rainfall_multiplier,
        "wind_speed": params["wind_speed"],
        "rainfall_mm": round(params["rainfall_mm"] * rainfall_multiplier, 1),
        "surge_height": params["surge_height"],
        "population_exposed": summary["population_exposed"],
        "hospitals_at_risk": summary["hospitals_at_risk"],
        "road_km_affected": summary["road_km_affected"],
        "power_assets_at_risk": summary["power_assets_at_risk"],
        "shelters_at_risk": summary["shelters_at_risk"],
        "overall_risk_score": summary["overall_risk_score"],
        "risk_level": summary["overall_risk_level"],
        "zone_impacts": zone_impacts,
        "delta_from_current": {
            "population_exposed": summary["population_exposed"] - current["population_exposed"],
            "hospitals_at_risk": summary["hospitals_at_risk"] - current["hospitals_at_risk"],
            "road_km_affected": round(summary["road_km_affected"] - current["road_km_affected"], 1),
            "power_assets_at_risk": summary["power_assets_at_risk"] - current["power_assets_at_risk"],
            "risk_score_change": round(summary["overall_risk_score"] - current["overall_risk_score"], 1),
        }
    }


def get_trigger_status(state_id: Optional[str] = None) -> Dict[str, Any]:
    """Check forecast against configurable thresholds."""
    rainfall_forecast = get_demo_rainfall_forecast(state_id)
    wind_forecast = get_demo_wind_forecast(state_id)

    peak_rainfall_24h = sum(p["rainfall_mm"] for p in rainfall_forecast[:24])
    peak_wind = max(p["wind_speed_kmh"] for p in wind_forecast[:24])
    peak_gust = max(p["gust_kmh"] for p in wind_forecast[:24])

    thresholds = [
        {
            "parameter": "Rainfall (24h cumulative)",
            "threshold_value": 250,
            "forecast_value": round(peak_rainfall_24h, 1),
            "unit": "mm",
            "status": "Likely Trigger" if peak_rainfall_24h >= 250 else ("Watch" if peak_rainfall_24h >= 200 else "Clear"),
            "confidence": 0.82,
        },
        {
            "parameter": "Sustained Wind Speed",
            "threshold_value": 120,
            "forecast_value": round(peak_wind, 1),
            "unit": "km/h",
            "status": "Likely Trigger" if peak_wind >= 120 else ("Watch" if peak_wind >= 90 else "Clear"),
            "confidence": 0.78,
        },
        {
            "parameter": "Wind Gust",
            "threshold_value": 160,
            "forecast_value": round(peak_gust, 1),
            "unit": "km/h",
            "status": "Likely Trigger" if peak_gust >= 160 else ("Watch" if peak_gust >= 120 else "Clear"),
            "confidence": 0.75,
        },
        {
            "parameter": "Storm Surge",
            "threshold_value": 3.0,
            "forecast_value": 3.5,
            "unit": "m",
            "status": "Likely Trigger",
            "confidence": 0.70,
        },
    ]

    statuses = [t["status"] for t in thresholds]
    overall = "Likely Trigger" if "Likely Trigger" in statuses else ("Watch" if "Watch" in statuses else "Clear")

    return {
        "overall_status": overall,
        "thresholds": thresholds,
        "last_updated": datetime.utcnow().isoformat() + "Z",
    }


def get_demo_alerts(state_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Generate alert feed for state or national grid."""
    base_time = datetime.utcnow()
    alerts = [
        {
            "id": "alert-001", "state_id": "ap",
            "severity": "extreme",
            "title": "Cyclone Michaung — Red Alert (Andhra Coast)",
            "message": "Category 3 Cyclone approaching Godavari delta corridor. Landfall ETA ~14h. SDRF Battalion deployed.",
            "zone": "Kakinada & Amalapuram",
            "timestamp": (base_time - timedelta(minutes=30)).isoformat() + "Z",
            "is_active": True,
        },
        {
            "id": "alert-002", "state_id": "od",
            "severity": "extreme",
            "title": "Cyclone Dana — Red Warning (Odisha Coast)",
            "message": "Extremely Severe storm tracking towards Paradip & Puri. Storm surge 4.5m expected. Evacuations active.",
            "zone": "Paradip & Puri",
            "timestamp": (base_time - timedelta(minutes=45)).isoformat() + "Z",
            "is_active": True,
        },
        {
            "id": "alert-003", "state_id": "gj",
            "severity": "critical",
            "title": "Severe Cyclone Biparjoy Alert (Gujarat Kutch)",
            "message": "Landfall vector targeting Deendayal/Kandla Port and Mandvi. Port operations suspended. Section 144 enacted.",
            "zone": "Kutch & Dwarka",
            "timestamp": (base_time - timedelta(hours=1)).isoformat() + "Z",
            "is_active": True,
        },
        {
            "id": "alert-004", "state_id": "wb",
            "severity": "critical",
            "title": "Estuarine Inundation Warning — Sundarbans & Haldia",
            "message": "High tide confluence with Cyclone Remal storm surge. River dykes at Sagar Island reinforced.",
            "zone": "Sundarbans & Digha",
            "timestamp": (base_time - timedelta(hours=2)).isoformat() + "Z",
            "is_active": True,
        },
        {
            "id": "alert-005", "state_id": "tn",
            "severity": "warning",
            "title": "Chennai Port & Coromandel Coastal Watch",
            "message": "Heavy squally winds of 110-130 km/h with localized urban flooding along Chennai ECR and Cuddalore.",
            "zone": "Chennai North & Cuddalore",
            "timestamp": (base_time - timedelta(hours=3)).isoformat() + "Z",
            "is_active": True,
        },
        {
            "id": "alert-006", "state_id": "mh",
            "severity": "warning",
            "title": "Konkan Sea Surge & Maritime Advisory",
            "message": "Fishermen advised not to venture into Arabian Sea off Mumbai MMR and Ratnagiri coasts. Gale winds active.",
            "zone": "Mumbai MMR & Ratnagiri",
            "timestamp": (base_time - timedelta(hours=4)).isoformat() + "Z",
            "is_active": True,
        }
    ]

    if state_id and state_id.lower() != "all":
        filtered = [a for a in alerts if a.get("state_id") == state_id.lower()]
        return filtered if filtered else alerts

    return alerts
