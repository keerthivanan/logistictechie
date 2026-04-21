# Major global seaports with UNLOCODEs
# Used as fallback when Maersk API key is not configured
# Format: (name, city, unlocode, country_name, country_code)

MAJOR_PORTS = [
    # China (CN)
    ("Port of Shanghai", "Shanghai", "CNSHA", "China", "CN"),
    ("Port of Ningbo", "Ningbo", "CNNBO", "China", "CN"),
    ("Port of Shenzhen", "Shenzhen", "CNSZX", "China", "CN"),
    ("Port of Guangzhou", "Guangzhou", "CNGZH", "China", "CN"),
    ("Port of Qingdao", "Qingdao", "CNTAO", "China", "CN"),
    ("Port of Tianjin", "Tianjin", "CNTSN", "China", "CN"),
    ("Port of Xiamen", "Xiamen", "CNXMN", "China", "CN"),
    ("Port of Dalian", "Dalian", "CNDLC", "China", "CN"),
    ("Port of Hong Kong", "Hong Kong", "HKHKG", "Hong Kong", "HK"),
    ("Port of Suzhou", "Suzhou", "CNSUZ", "China", "CN"),
    ("Port of Wuhan", "Wuhan", "CNWUH", "China", "CN"),
    ("Port of Chongqing", "Chongqing", "CNCKG", "China", "CN"),
    ("Port of Nanjing", "Nanjing", "CNNKG", "China", "CN"),
    ("Port of Lianyungang", "Lianyungang", "CNLYG", "China", "CN"),
    ("Port of Yingkou", "Yingkou", "CNYKO", "China", "CN"),

    # United States (US)
    ("Port of Los Angeles", "Los Angeles", "USLAX", "United States", "US"),
    ("Port of Long Beach", "Long Beach", "USLGB", "United States", "US"),
    ("Port of New York", "New York", "USNYC", "United States", "US"),
    ("Port of Savannah", "Savannah", "USSAV", "United States", "US"),
    ("Port of Seattle", "Seattle", "USSEA", "United States", "US"),
    ("Port of Houston", "Houston", "USHOU", "United States", "US"),
    ("Port of Baltimore", "Baltimore", "USBAL", "United States", "US"),
    ("Port of Norfolk", "Norfolk", "USORF", "United States", "US"),
    ("Port of Charleston", "Charleston", "USCHS", "United States", "US"),
    ("Port of Miami", "Miami", "USMIA", "United States", "US"),
    ("Port of Oakland", "Oakland", "USOAK", "United States", "US"),
    ("Port of Tacoma", "Tacoma", "USTCM", "United States", "US"),
    ("Port of New Orleans", "New Orleans", "USMSY", "United States", "US"),
    ("Port of Boston", "Boston", "USBOS", "United States", "US"),
    ("Port of Philadelphia", "Philadelphia", "USPHL", "United States", "US"),

    # Germany (DE)
    ("Port of Hamburg", "Hamburg", "DEHAM", "Germany", "DE"),
    ("Port of Bremen", "Bremen", "DEBRV", "Germany", "DE"),
    ("Port of Duisburg", "Duisburg", "DEDUI", "Germany", "DE"),
    ("Port of Rostock", "Rostock", "DERSK", "Germany", "DE"),

    # Netherlands (NL)
    ("Port of Rotterdam", "Rotterdam", "NLRTM", "Netherlands", "NL"),
    ("Port of Amsterdam", "Amsterdam", "NLAMS", "Netherlands", "NL"),

    # Belgium (BE)
    ("Port of Antwerp", "Antwerp", "BEANR", "Belgium", "BE"),
    ("Port of Zeebrugge", "Zeebrugge", "BEZEE", "Belgium", "BE"),

    # United Kingdom (GB)
    ("Port of Felixstowe", "Felixstowe", "GBFXT", "United Kingdom", "GB"),
    ("Port of Southampton", "Southampton", "GBSOU", "United Kingdom", "GB"),
    ("Port of London Gateway", "London", "GBLGP", "United Kingdom", "GB"),
    ("Port of Liverpool", "Liverpool", "GBLIVP", "United Kingdom", "GB"),
    ("Port of Bristol", "Bristol", "GBBRS", "United Kingdom", "GB"),

    # Singapore (SG)
    ("Port of Singapore", "Singapore", "SGSIN", "Singapore", "SG"),
    ("Port of Jurong", "Singapore", "SGJUR", "Singapore", "SG"),

    # South Korea (KR)
    ("Port of Busan", "Busan", "KRPUS", "South Korea", "KR"),
    ("Port of Incheon", "Incheon", "KRINC", "South Korea", "KR"),
    ("Port of Gwangyang", "Gwangyang", "KRKWJ", "South Korea", "KR"),

    # Japan (JP)
    ("Port of Tokyo", "Tokyo", "JPTYO", "Japan", "JP"),
    ("Port of Yokohama", "Yokohama", "JPYOK", "Japan", "JP"),
    ("Port of Kobe", "Kobe", "JPUKB", "Japan", "JP"),
    ("Port of Osaka", "Osaka", "JPOSA", "Japan", "JP"),
    ("Port of Nagoya", "Nagoya", "JPNGO", "Japan", "JP"),
    ("Port of Fukuoka", "Fukuoka", "JPFUK", "Japan", "JP"),

    # India (IN)
    ("Port of Mumbai", "Mumbai", "INBOM", "India", "IN"),
    ("Port of Mundra", "Mundra", "INMUN", "India", "IN"),
    ("Port of Chennai", "Chennai", "INMAA", "India", "IN"),
    ("Port of Kochi", "Kochi", "INCOK", "India", "IN"),
    ("Port of Visakhapatnam", "Visakhapatnam", "INVTZ", "India", "IN"),
    ("Port of Kolkata", "Kolkata", "INCCU", "India", "IN"),
    ("Port of Pipavav", "Pipavav", "INPAV", "India", "IN"),
    ("Port of Hazira", "Surat", "INHAZ", "India", "IN"),
    ("Port of Ennore", "Chennai", "INENN", "India", "IN"),
    ("Port of Thoothukudi", "Thoothukudi", "INTUT", "India", "IN"),

    # UAE (AE)
    ("Port of Dubai", "Dubai", "AEJEA", "United Arab Emirates", "AE"),
    ("Port of Abu Dhabi", "Abu Dhabi", "AEAUH", "United Arab Emirates", "AE"),
    ("Port of Sharjah", "Sharjah", "AESHJ", "United Arab Emirates", "AE"),

    # Saudi Arabia (SA)
    ("Port of Jeddah", "Jeddah", "SAJED", "Saudi Arabia", "SA"),
    ("Port of Dammam", "Dammam", "SADMM", "Saudi Arabia", "SA"),
    ("Port of Jubail", "Jubail", "SAJUB", "Saudi Arabia", "SA"),

    # Malaysia (MY)
    ("Port of Klang", "Port Klang", "MYPKG", "Malaysia", "MY"),
    ("Port of Penang", "Penang", "MYPGU", "Malaysia", "MY"),
    ("Port of Tanjung Pelepas", "Johor", "MYTPP", "Malaysia", "MY"),

    # Thailand (TH)
    ("Port of Laem Chabang", "Laem Chabang", "THLCH", "Thailand", "TH"),
    ("Port of Bangkok", "Bangkok", "THBKK", "Thailand", "TH"),

    # Vietnam (VN)
    ("Port of Ho Chi Minh City", "Ho Chi Minh City", "VNVUT", "Vietnam", "VN"),
    ("Port of Saigon", "Ho Chi Minh City", "VNSGN", "Vietnam", "VN"),
    ("Port of Hai Phong", "Hai Phong", "VNHPH", "Vietnam", "VN"),
    ("Port of Da Nang", "Da Nang", "VNDAD", "Vietnam", "VN"),

    # Indonesia (ID)
    ("Port of Jakarta", "Jakarta", "IDJKT", "Indonesia", "ID"),
    ("Port of Surabaya", "Surabaya", "IDSUB", "Indonesia", "ID"),
    ("Port of Medan", "Medan", "IDMDN", "Indonesia", "ID"),

    # Australia (AU)
    ("Port of Sydney", "Sydney", "AUSYD", "Australia", "AU"),
    ("Port of Melbourne", "Melbourne", "AUMEL", "Australia", "AU"),
    ("Port of Brisbane", "Brisbane", "AUBNE", "Australia", "AU"),
    ("Port of Fremantle", "Fremantle", "AUFRE", "Australia", "AU"),
    ("Port of Adelaide", "Adelaide", "AUADL", "Australia", "AU"),

    # Canada (CA)
    ("Port of Vancouver", "Vancouver", "CAVAN", "Canada", "CA"),
    ("Port of Prince Rupert", "Prince Rupert", "CAPRR", "Canada", "CA"),
    ("Port of Montreal", "Montreal", "CAMTR", "Canada", "CA"),
    ("Port of Halifax", "Halifax", "CAHAL", "Canada", "CA"),
    ("Port of Toronto", "Toronto", "CATOR", "Canada", "CA"),

    # Brazil (BR)
    ("Port of Santos", "Santos", "BRSSZ", "Brazil", "BR"),
    ("Port of Rio de Janeiro", "Rio de Janeiro", "BRRIO", "Brazil", "BR"),
    ("Port of Paranagua", "Paranaguá", "BRPNG", "Brazil", "BR"),
    ("Port of Itajai", "Itajaí", "BRITJ", "Brazil", "BR"),
    ("Port of Manaus", "Manaus", "BRMAO", "Brazil", "BR"),

    # South Africa (ZA)
    ("Port of Durban", "Durban", "ZADUR", "South Africa", "ZA"),
    ("Port of Cape Town", "Cape Town", "ZACPT", "South Africa", "ZA"),
    ("Port of Gqeberha", "Gqeberha", "ZAPLZ", "South Africa", "ZA"),

    # Egypt (EG)
    ("Port of Port Said", "Port Said", "EGPSD", "Egypt", "EG"),
    ("Port of Alexandria", "Alexandria", "EGALY", "Egypt", "EG"),
    ("Port of Damietta", "Damietta", "EGDAM", "Egypt", "EG"),

    # Spain (ES)
    ("Port of Valencia", "Valencia", "ESVLC", "Spain", "ES"),
    ("Port of Barcelona", "Barcelona", "ESBCN", "Spain", "ES"),
    ("Port of Algeciras", "Algeciras", "ESALG", "Spain", "ES"),
    ("Port of Bilbao", "Bilbao", "ESBIO", "Spain", "ES"),

    # Italy (IT)
    ("Port of Genoa", "Genoa", "ITGOA", "Italy", "IT"),
    ("Port of La Spezia", "La Spezia", "ITSPZ", "Italy", "IT"),
    ("Port of Gioia Tauro", "Gioia Tauro", "ITGIT", "Italy", "IT"),
    ("Port of Livorno", "Livorno", "ITLIV", "Italy", "IT"),
    ("Port of Naples", "Naples", "ITNAP", "Italy", "IT"),
    ("Port of Venice", "Venice", "ITVCE", "Italy", "IT"),

    # France (FR)
    ("Port of Le Havre", "Le Havre", "FRLEH", "France", "FR"),
    ("Port of Marseille", "Marseille", "FRMRS", "France", "FR"),
    ("Port of Dunkirk", "Dunkirk", "FRDKK", "France", "FR"),

    # Turkey (TR)
    ("Port of Istanbul", "Istanbul", "TRISK", "Turkey", "TR"),
    ("Port of Mersin", "Mersin", "TRMER", "Turkey", "TR"),
    ("Port of Izmir", "Izmir", "TRIZM", "Turkey", "TR"),

    # Greece (GR)
    ("Port of Piraeus", "Piraeus", "GRPIR", "Greece", "GR"),
    ("Port of Thessaloniki", "Thessaloniki", "GRSKG", "Greece", "GR"),

    # Russia (RU)
    ("Port of St. Petersburg", "St. Petersburg", "RULED", "Russia", "RU"),
    ("Port of Novorossiysk", "Novorossiysk", "RUNVS", "Russia", "RU"),
    ("Port of Vladivostok", "Vladivostok", "RUVVO", "Russia", "RU"),

    # Mexico (MX)
    ("Port of Manzanillo", "Manzanillo", "MXZLO", "Mexico", "MX"),
    ("Port of Veracruz", "Veracruz", "MXVER", "Mexico", "MX"),
    ("Port of Lazaro Cardenas", "Lázaro Cárdenas", "MXLZC", "Mexico", "MX"),

    # Pakistan (PK)
    ("Port of Karachi", "Karachi", "PKKHI", "Pakistan", "PK"),
    ("Port Qasim", "Karachi", "PKPQI", "Pakistan", "PK"),

    # Bangladesh (BD)
    ("Port of Chittagong", "Chittagong", "BDCGP", "Bangladesh", "BD"),

    # Sri Lanka (LK)
    ("Port of Colombo", "Colombo", "LKCMB", "Sri Lanka", "LK"),

    # Kenya (KE)
    ("Port of Mombasa", "Mombasa", "KEMBA", "Kenya", "KE"),

    # Nigeria (NG)
    ("Port of Lagos", "Lagos", "NGLOS", "Nigeria", "NG"),
    ("Port of Tin Can Island", "Lagos", "NGTIN", "Nigeria", "NG"),

    # Morocco (MA)
    ("Port of Tangier", "Tangier", "MATNR", "Morocco", "MA"),
    ("Port of Casablanca", "Casablanca", "MACAS", "Morocco", "MA"),

    # Oman (OM)
    ("Port of Salalah", "Salalah", "OMSLL", "Oman", "OM"),
    ("Port of Sohar", "Sohar", "OMSOH", "Oman", "OM"),

    # Israel (IL)
    ("Port of Haifa", "Haifa", "ILHFA", "Israel", "IL"),
    ("Port of Ashdod", "Ashdod", "ILASH", "Israel", "IL"),

    # Jordan (JO)
    ("Port of Aqaba", "Aqaba", "JOAQJ", "Jordan", "JO"),

    # Poland (PL)
    ("Port of Gdansk", "Gdańsk", "PLGDN", "Poland", "PL"),
    ("Port of Gdynia", "Gdynia", "PLGDY", "Poland", "PL"),

    # Sweden (SE)
    ("Port of Gothenburg", "Gothenburg", "SEGOT", "Sweden", "SE"),

    # Norway (NO)
    ("Port of Oslo", "Oslo", "NOOSL", "Norway", "NO"),
    ("Port of Bergen", "Bergen", "NOBGO", "Norway", "NO"),

    # Denmark (DK)
    ("Port of Copenhagen", "Copenhagen", "DKCPH", "Denmark", "DK"),
    ("Port of Aarhus", "Aarhus", "DKAAR", "Denmark", "DK"),

    # Finland (FI)
    ("Port of Helsinki", "Helsinki", "FIHEL", "Finland", "FI"),

    # Portugal (PT)
    ("Port of Lisbon", "Lisbon", "PTLIS", "Portugal", "PT"),
    ("Port of Sines", "Sines", "PTSIN", "Portugal", "PT"),

    # Taiwan (TW)
    ("Port of Kaohsiung", "Kaohsiung", "TWKHH", "Taiwan", "TW"),
    ("Port of Keelung", "Keelung", "TWKEL", "Taiwan", "TW"),
    ("Port of Taichung", "Taichung", "TWTXG", "Taiwan", "TW"),

    # Philippines (PH)
    ("Port of Manila", "Manila", "PHMNL", "Philippines", "PH"),
    ("Port of Cebu", "Cebu", "PHCEB", "Philippines", "PH"),

    # Argentina (AR)
    ("Port of Buenos Aires", "Buenos Aires", "ARBUE", "Argentina", "AR"),
    ("Port of Rosario", "Rosario", "ARROS", "Argentina", "AR"),

    # Chile (CL)
    ("Port of Valparaíso", "Valparaíso", "CLVAP", "Chile", "CL"),
    ("Port of San Antonio", "San Antonio", "CLSAI", "Chile", "CL"),

    # Colombia (CO)
    ("Port of Cartagena", "Cartagena", "COCTG", "Colombia", "CO"),
    ("Port of Buenaventura", "Buenaventura", "COBUN", "Colombia", "CO"),

    # Peru (PE)
    ("Port of Callao", "Lima", "PECLL", "Peru", "PE"),

    # Ecuador (EC)
    ("Port of Guayaquil", "Guayaquil", "ECGYE", "Ecuador", "EC"),

    # Panama (PA)
    ("Port of Balboa", "Panama City", "PABLB", "Panama", "PA"),
    ("Port of Colon", "Colón", "PAONX", "Panama", "PA"),
    ("Port of Manzanillo", "Colón", "PAMANIT", "Panama", "PA"),
]
