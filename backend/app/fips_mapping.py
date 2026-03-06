""" 
Complete FIPS 10-4 to ISO3 country code mapping
Source: US National Geospatial-Intelligence Agency FIPS 10-4 standard
"""

FIPS_TO_ISO3 = {
    "AA": "ABW",  # Aruba
    "AC": "ATG",  # Antigua and Barbuda
    "AE": "ARE",  # United Arab Emirates
    "AF": "AFG",  # Afghanistan
    "AG": "DZA",  # Algeria
    "AJ": "AZE",  # Azerbaijan
    "AL": "ALB",  # Albania
    "AM": "ARM",  # Armenia
    "AN": "AND",  # Andorra
    "AO": "AGO",  # Angola
    "AQ": "ASM",  # American Samoa
    "AR": "ARG",  # Argentina
    "AS": "AUS",  # Australia
    "AT": "ATA",  # Ashmore and Cartier Islands
    "AU": "AUT",  # Austria
    "AV": "AIA",  # Anguilla
    "AX": "ATF",  # Akrotiri (no ISO3, fallback)
    "AY": "ATA",  # Antarctica
    "BA": "BHR",  # Bahrain
    "BB": "BRB",  # Barbados
    "BC": "BWA",  # Botswana
    "BD": "BMU",  # Bermuda
    "BE": "BEL",  # Belgium
    "BF": "BHS",  # Bahamas
    "BG": "BGD",  # Bangladesh
    "BH": "BLZ",  # Belize
    "BK": "BIH",  # Bosnia and Herzegovina
    "BL": "BOL",  # Bolivia
    "BM": "MMR",  # Burma (Myanmar)
    "BN": "BEN",  # Benin
    "BO": "BLR",  # Belarus
    "BP": "SLB",  # Solomon Islands
    "BQ": "NAM",  # Navassa Island
    "BR": "BRA",  # Brazil
    "BS": "BES",  # Bassas da India
    "BT": "BTN",  # Bhutan
    "BU": "BGR",  # Bulgaria
    "BV": "BVT",  # Bouvet Island
    "BX": "BRN",  # Brunei
    "BY": "BDI",  # Burundi
    "CA": "CAN",  # Canada
    "CB": "KHM",  # Cambodia
    "CD": "TCD",  # Chad
    "CE": "LKA",  # Sri Lanka
    "CF": "COG",  # Congo, Republic of
    "CG": "DRC",  # Congo, Democratic Republic
    "CH": "CHN",  # China
    "CI": "CHL",  # Chile
    "CJ": "CYM",  # Cayman Islands
    "CK": "CCK",  # Cocos (Keeling) Islands
    "CM": "CMR",  # Cameroon
    "CN": "COM",  # Comoros
    "CO": "COL",  # Colombia
    "CQ": "MNP",  # Northern Mariana Islands
    "CR": "CRI",  # Costa Rica
    "CS": "CAF",  # Central African Republic
    "CT": "CPV",  # Cape Verde
    "CU": "CUB",  # Cuba
    "CV": "COK",  # Cook Islands
    "CW": "COD",  # Congo DR (alt)
    "CY": "CYP",  # Cyprus
    "DA": "DNK",  # Denmark
    "DJ": "DJI",  # Djibouti
    "DO": "DOM",  # Dominican Republic
    "DQ": "IOT",  # Diego Garcia
    "DR": "DOM",  # Dominican Republic (alt)
    "EC": "ECU",  # Ecuador
    "EG": "EGY",  # Egypt
    "EI": "IRL",  # Ireland
    "EK": "GNQ",  # Equatorial Guinea
    "EN": "EST",  # Estonia
    "ER": "ERI",  # Eritrea
    "ES": "SLV",  # El Salvador
    "ET": "ETH",  # Ethiopia
    "EU": "EUR",  # Europa Island
    "EZ": "CZE",  # Czech Republic
    "FG": "GUF",  # French Guiana
    "FI": "FIN",  # Finland
    "FJ": "FJI",  # Fiji
    "FK": "FLK",  # Falkland Islands
    "FM": "FSM",  # Micronesia
    "FO": "FRO",  # Faroe Islands
    "FP": "PYF",  # French Polynesia
    "FR": "FRA",  # France
    "FS": "ATF",  # French Southern and Antarctic Lands
    "GA": "GMB",  # Gambia
    "GB": "GAB",  # Gabon
    "GC": "GLP",  # Guadeloupe
    "GG": "GEO",  # Georgia
    "GH": "GHA",  # Ghana
    "GI": "GIB",  # Gibraltar
    "GJ": "GRD",  # Grenada
    "GK": "GGY",  # Guernsey
    "GL": "GRL",  # Greenland
    "GM": "DEU",  # Germany
    "GO": "GLP",  # Glorioso Islands
    "GP": "GUM",  # Guam
    "GQ": "GUM",  # Guam (alt)
    "GR": "GRC",  # Greece
    "GT": "GTM",  # Guatemala
    "GV": "GIN",  # Guinea
    "GY": "GUY",  # Guyana
    "GZ": "PSE",  # Gaza Strip
    "HA": "HTI",  # Haiti
    "HK": "HKG",  # Hong Kong
    "HM": "HMD",  # Heard Island and McDonald Islands
    "HO": "HND",  # Honduras
    "HQ": "UMI",  # Howland Island
    "HR": "HRV",  # Croatia
    "HU": "HUN",  # Hungary
    "IC": "ISL",  # Iceland
    "ID": "IDN",  # Indonesia
    "IM": "IMN",  # Isle of Man
    "IN": "IND",  # India
    "IO": "IOT",  # British Indian Ocean Territory
    "IP": "CLI",  # Clipperton Island
    "IR": "IRN",  # Iran
    "IS": "ISR",  # Israel
    "IT": "ITA",  # Italy
    "IV": "CIV",  # Ivory Coast (Côte d'Ivoire)
    "IZ": "IRQ",  # Iraq
    "JA": "JPN",  # Japan
    "JE": "JEY",  # Jersey
    "JM": "JAM",  # Jamaica
    "JN": "SJM",  # Jan Mayen
    "JO": "JOR",  # Jordan
    "JQ": "UMI",  # Johnston Atoll
    "JU": "IOT",  # Juan de Nova Island
    "KE": "KEN",  # Kenya
    "KG": "KGZ",  # Kyrgyzstan
    "KN": "PRK",  # North Korea
    "KQ": "KIR",  # Kingman Reef
    "KR": "KIR",  # Kiribati
    "KS": "KOR",  # South Korea
    "KT": "CXR",  # Christmas Island
    "KU": "KWT",  # Kuwait
    "KV": "XKX",  # Kosovo
    "KZ": "KAZ",  # Kazakhstan
    "LA": "LAO",  # Laos
    "LE": "LBN",  # Lebanon
    "LG": "LVA",  # Latvia
    "LH": "LTU",  # Lithuania
    "LI": "LBR",  # Liberia
    "LO": "SVK",  # Slovakia
    "LS": "LSO",  # Lesotho
    "LT": "LSO",  # Lesotho (alt)
    "LU": "LUX",  # Luxembourg
    "LY": "LBY",  # Libya
    "MA": "MDG",  # Madagascar
    "MB": "MRB",  # Martinique
    "MC": "MCO",  # Monaco
    "MD": "MDA",  # Moldova
    "MF": "MAF",  # Saint Martin
    "MG": "MNG",  # Mongolia
    "MH": "MHL",  # Marshall Islands
    "MI": "MWI",  # Malawi
    "MJ": "MNE",  # Montenegro
    "MK": "MKD",  # North Macedonia
    "ML": "MLI",  # Mali
    "MN": "MCO",  # Monaco (alt)
    "MO": "MAR",  # Morocco
    "MP": "MRT",  # Mauritania
    "MQ": "MTQ",  # Martinique
    "MR": "MUS",  # Mauritius
    "MT": "MLT",  # Malta
    "MU": "OMN",  # Oman
    "MV": "MDV",  # Maldives
    "MX": "MEX",  # Mexico
    "MY": "MYS",  # Malaysia
    "MZ": "MOZ",  # Mozambique
    "NA": "NAM",  # Namibia
    "NC": "NCL",  # New Caledonia
    "NE": "NER",  # Niger
    "NF": "NFK",  # Norfolk Island
    "NG": "NGA",  # Nigeria
    "NH": "VUT",  # Vanuatu
    "NI": "NIC",  # Nicaragua
    "NL": "NLD",  # Netherlands
    "NO": "NOR",  # Norway
    "NP": "NPL",  # Nepal
    "NR": "NRU",  # Nauru
    "NS": "SUR",  # Suriname
    "NT": "ANT",  # Netherlands Antilles
    "NU": "NIC",  # Nicaragua (alt)
    "NZ": "NZL",  # New Zealand
    "OC": "ATF",  # Ocean Island (Banaba)
    "OD": "SSD",  # South Sudan
    "PA": "PRY",  # Paraguay
    "PC": "PCN",  # Pitcairn Islands
    "PE": "PER",  # Peru
    "PF": "PLW",  # Palau
    "PG": "SPM",  # Saint Pierre and Miquelon
    "PK": "PAK",  # Pakistan
    "PL": "POL",  # Poland
    "PM": "PAN",  # Panama
    "PO": "PRT",  # Portugal
    "PP": "PNG",  # Papua New Guinea
    "PQ": "UMI",  # Palmyra Atoll
    "PS": "PLW",  # Palau (alt)
    "PU": "GNB",  # Guinea-Bissau
    "QA": "QAT",  # Qatar
    "RE": "REU",  # Reunion
    "RI": "SRB",  # Serbia
    "RM": "MHL",  # Marshall Islands (alt)
    "RN": "NER",  # Niger (alt)
    "RO": "ROU",  # Romania
    "RP": "PHL",  # Philippines
    "RQ": "PRI",  # Puerto Rico
    "RS": "RUS",  # Russia
    "RW": "RWA",  # Rwanda
    "SA": "SAU",  # Saudi Arabia
    "SB": "SPM",  # Saint Pierre and Miquelon (alt)
    "SC": "KNA",  # Saint Kitts and Nevis
    "SE": "SYC",  # Seychelles
    "SF": "ZAF",  # South Africa
    "SG": "SEN",  # Senegal
    "SH": "SHN",  # Saint Helena
    "SI": "SVN",  # Slovenia
    "SK": "SVK",  # Slovakia (alt)
    "SL": "SLE",  # Sierra Leone
    "SM": "SMR",  # San Marino
    "SN": "SGP",  # Singapore
    "SO": "SOM",  # Somalia
    "SP": "ESP",  # Spain
    "SR": "SUR",  # Suriname (alt)
    "SS": "SSD",  # South Sudan (alt)
    "ST": "STP",  # Sao Tome and Principe
    "SU": "SDN",  # Sudan
    "SV": "SVK",  # Slovakia (alt2)
    "SW": "SWE",  # Sweden
    "SX": "SGS",  # South Georgia and the South Sandwich Islands
    "SY": "SYR",  # Syria
    "SZ": "CHE",  # Switzerland
    "TB": "SJM",  # Svalbard
    "TD": "TTO",  # Trinidad and Tobago
    "TE": "TLS",  # Timor-Leste
    "TH": "THA",  # Thailand
    "TI": "TJK",  # Tajikistan
    "TK": "TKM",  # Turkmenistan
    "TL": "TLS",  # Timor-Leste (alt)
    "TN": "TON",  # Tonga
    "TO": "TGO",  # Togo
    "TP": "STP",  # Sao Tome and Principe (alt)
    "TS": "TUN",  # Tunisia
    "TT": "TTO",  # Trinidad and Tobago (alt)
    "TU": "TUR",  # Turkey
    "TV": "TUV",  # Tuvalu
    "TW": "TWN",  # Taiwan
    "TX": "TKL",  # Tokelau
    "TZ": "TZA",  # Tanzania
    "UG": "UGA",  # Uganda
    "UK": "GBR",  # United Kingdom
    "UP": "UKR",  # Ukraine
    "US": "USA",  # United States
    "UV": "BFA",  # Burkina Faso
    "UY": "URY",  # Uruguay
    "UZ": "UZB",  # Uzbekistan
    "VC": "VCT",  # Saint Vincent and the Grenadines
    "VE": "VEN",  # Venezuela
    "VI": "VGB",  # British Virgin Islands
    "VM": "VNM",  # Vietnam
    "VQ": "VIR",  # US Virgin Islands
    "VT": "VAT",  # Vatican City
    "WA": "NAM",  # Namibia (alt)
    "WE": "PSE",  # West Bank
    "WF": "WLF",  # Wallis and Futuna
    "WI": "ESH",  # Western Sahara
    "WQ": "UMI",  # Wake Island
    "WS": "WSM",  # Samoa
    "WZ": "SWZ",  # Eswatini (Swaziland)
    "YM": "YEM",  # Yemen
    "YI": "SRB",  # Serbia (alt)
    "ZA": "ZMB",  # Zambia
    "ZI": "ZWE",  # Zimbabwe
    "ZM": "ZMB",  # Zambia (alt)
    "ZW": "ZWE",  # Zimbabwe (alt)
}