package gov.cdc.usds.simplereport.db.model;

import static gov.cdc.usds.simplereport.api.Translators.FEMALE;
import static gov.cdc.usds.simplereport.api.Translators.MALE;
import static gov.cdc.usds.simplereport.api.Translators.NON_BINARY;
import static gov.cdc.usds.simplereport.api.Translators.OTHER;
import static gov.cdc.usds.simplereport.api.Translators.REFUSED;
import static gov.cdc.usds.simplereport.api.Translators.TRANS_MAN;
import static gov.cdc.usds.simplereport.api.Translators.TRANS_WOMAN;

import gov.cdc.usds.simplereport.api.MappingConstants;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PersonUtils {
  private PersonUtils() {
    throw new IllegalStateException("Utility class");
  }

  public static Map<String, String> tribalMap() {
    var tribeCodes = new HashMap<String, String>();
    tribeCodes.put("1", "Absentee-Shawnee Tribe of Indians of Oklahoma");
    tribeCodes.put(
        "2",
        "Agua Caliente Band of Cahuilla Indians of the Agua Caliente Indian Reservation, California");
    tribeCodes.put("3", "Ak-Chin Indian Community");
    tribeCodes.put("4", "Alabama-Coushatta Tribe of Texas");
    tribeCodes.put("5", "Alabama-Quassarte Tribal Town");
    tribeCodes.put("6", "Alturas Indian Rancheria, California");
    tribeCodes.put("7", "Apache Tribe of Oklahoma");
    tribeCodes.put("8", "Northern Arapaho Tribe of the Wind River Reservation, Wyoming");
    tribeCodes.put("9", "Mi'kmaq Nation");
    tribeCodes.put(
        "10", "Assiniboine and Sioux Tribes of the Fort Peck Indian Reservation, Montana");
    tribeCodes.put("11", "Augustine Band of Cahuilla Indians, California");
    tribeCodes.put(
        "12",
        "Bad River Band of the Lake Superior Tribe of Chippewa Indians of the Bad River Reservation, Wisconsin");
    tribeCodes.put("33", "Barona Group of Capitan Grande Band of Mission Ind");
    tribeCodes.put("13", "Bay Mills Indian Community, Michigan");
    tribeCodes.put("14", "Bear River Band of the Rohnerville Rancheria, California");
    tribeCodes.put("15", "Berry Creek Rancheria of Maidu Indians of California");
    tribeCodes.put("16", "Big Lagoon Rancheria, California");
    tribeCodes.put("17", "Big Pine Paiute Tribe of the Owens Valley");
    tribeCodes.put("18", "Big Sandy Rancheria of Western Mono Indians of California");
    tribeCodes.put("19", "Big Valley Band of Pomo Indians of the Big Valley Rancheria, California");
    tribeCodes.put("20", "Blackfeet Tribe of the Blackfeet Indian Reservation of Montana");
    tribeCodes.put("21", "Blue Lake Rancheria, California");
    tribeCodes.put("22", "Bridgeport Indian Colony");
    tribeCodes.put("23", "Buena Vista Rancheria of Me-Wuk Indians of California");
    tribeCodes.put("24", "Burns Paiute Tribe");
    tribeCodes.put("25", "Cabazon Band of Mission Indians, California");
    tribeCodes.put(
        "26",
        "Cachil DeHe Band of Wintun Indians of the Colusa Indian Community of the Colusa Rancheria, California");
    tribeCodes.put("27", "Caddo Nation of Oklahoma");
    tribeCodes.put("29", "Cahto Tribe of the Laytonville Rancheria");
    tribeCodes.put("28", "Cahuilla Band of Indians");
    tribeCodes.put("30", "California Valley Miwok Tribe, California");
    tribeCodes.put(
        "31", "Campo Band of Diegueno Mission Indians of the Campo Indian Reservation, California");
    tribeCodes.put("32", "Capitan Grande Band of Diegueno Mission Indians of California");
    tribeCodes.put("35", "Catawba Indian Nation");
    tribeCodes.put("36", "Cayuga Nation");
    tribeCodes.put("37", "Cedarville Rancheria, California");
    tribeCodes.put("38", "Chemehuevi Indian Tribe of the Chemehuevi Reservation, California");
    tribeCodes.put("39", "Cher-Ae Heights Indian Community of the Trinidad Rancheria, California");
    tribeCodes.put("40", "Cherokee Nation");
    tribeCodes.put(
        "42", "Cheyenne River Sioux Tribe of the Cheyenne River Reservation, South Dakota");
    tribeCodes.put("41", "Cheyenne and Arapaho Tribes, Oklahoma");
    tribeCodes.put("43", "The Chickasaw Nation");
    tribeCodes.put("44", "Chicken Ranch Rancheria of Me-Wuk Indians of California");
    tribeCodes.put("45", "Chippewa Cree Indians of the Rocky Boy's Reservation, Montana");
    tribeCodes.put("46", "Chitimacha Tribe of Louisiana");
    tribeCodes.put("47", "The Choctaw Nation of Oklahoma");
    tribeCodes.put("48", "Citizen Potawatomi Nation, Oklahoma");
    tribeCodes.put("49", "Cloverdale Rancheria of Pomo Indians of California");
    tribeCodes.put("50", "Cocopah Tribe of Arizona");
    tribeCodes.put("51", "Coeur D'Alene Tribe");
    tribeCodes.put("52", "Cold Springs Rancheria of Mono Indians of California");
    tribeCodes.put(
        "53",
        "Colorado River Indian Tribes of the Colorado River Indian Reservation, Arizona and California");
    tribeCodes.put("54", "Comanche Nation, Oklahoma");
    tribeCodes.put("55", "Confederated Salish and Kootenai Tribes of the Flathead Reservation");
    tribeCodes.put("64", "Confederated Tribes and Bands of the Yakama Nation");
    tribeCodes.put("56", "Confederated Tribes of the Chehalis Reservation");
    tribeCodes.put("57", "Confederated Tribes of the Colville Reservation");
    tribeCodes.put("58", "Confederated Tribes of the Coos, Lower Umpqua and Siuslaw Indians");
    tribeCodes.put("59", "Confederated Tribes of the Goshute Reservation, Nevada and Utah");
    tribeCodes.put("60", "Confederated Tribes of the Grand Ronde Community of Oregon");
    tribeCodes.put("61", "Confederated Tribes of Siletz Indians of Oregon");
    tribeCodes.put("62", "Confederated Tribes of the Umatilla Indian Reservation");
    tribeCodes.put("63", "Confederated Tribes of the Warm Springs Reservation of Oregon");
    tribeCodes.put("65", "Coquille Indian Tribe");
    tribeCodes.put("66", "Kletsel Dehe Band of Wintun Indians");
    tribeCodes.put("67", "Coushatta Tribe of Louisiana");
    tribeCodes.put("68", "Cow Creek Band of Umpqua Tribe of Indians");
    tribeCodes.put("69", "Coyote Valley Band of Pomo Indians of California");
    tribeCodes.put("71", "Crow Creek Sioux Tribe of the Crow Creek Reservation, South Dakota");
    tribeCodes.put("70", "Crow Tribe of Montana");
    tribeCodes.put("72", "Ewiiaapaayp Band of Kumeyaay Indians, California");
    tribeCodes.put("73", "Timbisha Shoshone Tribe");
    tribeCodes.put("74", "Delaware Nation, Oklahoma");
    tribeCodes.put("75", "Delaware Tribe of Indians");
    tribeCodes.put("76", "Dry Creek Rancheria Band of Pomo Indians, California");
    tribeCodes.put("77", "Duckwater Shoshone Tribe of the Duckwater Reservation, Nevada");
    tribeCodes.put("78", "Eastern Band of Cherokee Indians");
    tribeCodes.put("79", "Eastern Shawnee Tribe of Oklahoma");
    tribeCodes.put(
        "80", "Elem Indian Colony of Pomo Indians of the Sulphur Bank Rancheria, California");
    tribeCodes.put("81", "Elk Valley Rancheria, California");
    tribeCodes.put("82", "Ely Shoshone Tribe of Nevada");
    tribeCodes.put("83", "Enterprise Rancheria of Maidu Indians of California");
    tribeCodes.put("84", "Flandreau Santee Sioux Tribe of South Dakota");
    tribeCodes.put("85", "Forest County Potawatomi Community, Wisconsin");
    tribeCodes.put(
        "86", "Fort Belknap Indian Community of the Fort Belknap Reservation of Montana");
    tribeCodes.put(
        "87", "Fort Bidwell Indian Community of the Fort Bidwell Reservation of California");
    tribeCodes.put(
        "88",
        "Fort Independence Indian Community of Paiute Indians of the Fort Independence Reservation, California");
    tribeCodes.put(
        "89",
        "Fort McDermitt Paiute and Shoshone Tribes of the Fort McDermitt Indian Reservation, Nevada and Oregon");
    tribeCodes.put("90", "Fort McDowell Yavapai Nation, Arizona");
    tribeCodes.put("91", "Fort Mojave Indian Tribe of Arizona, California & Nevada");
    tribeCodes.put("92", "Fort Sill Apache Tribe of Oklahoma");
    tribeCodes.put(
        "93", "Gila River Indian Community of the Gila River Indian Reservation, Arizona");
    tribeCodes.put("94", "Grand Traverse Band of Ottawa and Chippewa Indians, Michigan");
    tribeCodes.put("95", "Federated Indians of Graton Rancheria, California");
    tribeCodes.put("96", "Greenville Rancheria");
    tribeCodes.put("97", "Grindstone Indian Rancheria of Wintun-Wailaki Indians of California");
    tribeCodes.put("98", "Guidiville Rancheria of California");
    tribeCodes.put("99", "Hannahville Indian Community, Michigan");
    tribeCodes.put("100", "Havasupai Tribe of the Havasupai Reservation, Arizona");
    tribeCodes.put("101", "Ho-Chunk Nation of Wisconsin");
    tribeCodes.put("102", "Hoh Indian Tribe");
    tribeCodes.put("103", "Hoopa Valley Tribe, California");
    tribeCodes.put("104", "Hopi Tribe of Arizona");
    tribeCodes.put("105", "Hopland Band of Pomo Indians, California");
    tribeCodes.put("106", "Houlton Band of Maliseet Indians");
    tribeCodes.put("107", "Hualapai Indian Tribe of the Hualapai Indian Reservation, Arizona");
    tribeCodes.put("108", "Nottawaseppi Huron Band of the Potawatomi, Michigan");
    tribeCodes.put(
        "109",
        "Inaja Band of Diegueno Mission Indians of the Inaja and Cosmit Reservation, California");
    tribeCodes.put("110", "Ione Band of Miwok Indians of California");
    tribeCodes.put("111", "Iowa Tribe of Kansas and Nebraska");
    tribeCodes.put("112", "Iowa Tribe of Oklahoma");
    tribeCodes.put("113", "Jackson Band of Miwuk Indians");
    tribeCodes.put("114", "Jamestown S'Klallam Tribe");
    tribeCodes.put("115", "Jamul Indian Village of California");
    tribeCodes.put("116", "Jena Band of Choctaw Indians");
    tribeCodes.put("117", "Jicarilla Apache Nation, New Mexico");
    tribeCodes.put(
        "118", "Kaibab Band of Paiute Indians of the Kaibab Indian Reservation, Arizona");
    tribeCodes.put("119", "Kalispel Indian Community of the Kalispel Reservation");
    tribeCodes.put("120", "Karuk Tribe");
    tribeCodes.put(
        "121", "Kashia Band of Pomo Indians of the Stewarts Point Rancheria, California");
    tribeCodes.put("122", "Kaw Nation, Oklahoma");
    tribeCodes.put("123", "Keweenaw Bay Indian Community, Michigan");
    tribeCodes.put("124", "Kialegee Tribal Town");
    tribeCodes.put("127", "Kickapoo Traditional Tribe of Texas");
    tribeCodes.put("125", "Kickapoo Tribe of Indians of the Kickapoo Reservation in Kansas");
    tribeCodes.put("126", "Kickapoo Tribe of Oklahoma");
    tribeCodes.put("128", "Kiowa Indian Tribe of Oklahoma");
    tribeCodes.put("129", "Klamath Tribes");
    tribeCodes.put("130", "Kootenai Tribe of Idaho");
    tribeCodes.put("131", "La Jolla Band of Luiseno Indians, California");
    tribeCodes.put(
        "132",
        "La Posta Band of Diegueno Mission Indians of the La Posta Indian Reservation, California");
    tribeCodes.put(
        "133", "Lac Courte Oreilles Band of Lake Superior Chippewa Indians of Wisconsin");
    tribeCodes.put(
        "134",
        "Lac du Flambeau Band of Lake Superior Chippewa Indians of the Lac du Flambeau Reservation of Wisconsin");
    tribeCodes.put("135", "Lac Vieux Desert Band of Lake Superior Chippewa Indians of Michigan");
    tribeCodes.put(
        "136", "Las Vegas Tribe of Paiute Indians of the Las Vegas Indian Colony, Nevada");
    tribeCodes.put("137", "Little River Band of Ottawa Indians, Michigan");
    tribeCodes.put("138", "Little Traverse Bay Bands of Odawa Indians, Michigan");
    tribeCodes.put("140", "Los Coyotes Band of Cahuilla and Cupeno Indians, California");
    tribeCodes.put("141", "Lovelock Paiute Tribe of the Lovelock Indian Colony, Nevada");
    tribeCodes.put("142", "Lower Brule Sioux Tribe of the Lower Brule Reservation, South Dakota");
    tribeCodes.put("143", "Lower Elwha Tribal Community");
    tribeCodes.put("139", "Koi Nation of Northern California");
    tribeCodes.put("144", "Lower Sioux Indian Community in the State of Minnesota");
    tribeCodes.put("145", "Lummi Tribe of the Lummi Reservation");
    tribeCodes.put("146", "Lytton Rancheria of California");
    tribeCodes.put("147", "Makah Indian Tribe of the Makah Indian Reservation");
    tribeCodes.put(
        "148", "Manchester Band of Pomo Indians of the Manchester Rancheria, California");
    tribeCodes.put(
        "149",
        "Manzanita Band of Diegueno Mission Indians of the Manzanita Reservation, California");
    tribeCodes.put("150", "Mashantucket Pequot Indian Tribe");
    tribeCodes.put("151", "Match-e-be-nash-she-wish Band of Pottawatomi Indians of Michigan");
    tribeCodes.put("152", "Mechoopda Indian Tribe of Chico Rancheria, California");
    tribeCodes.put("153", "Menominee Indian Tribe of Wisconsin");
    tribeCodes.put(
        "154",
        "Mesa Grande Band of Diegueno Mission Indians of the Mesa Grande Reservation, California");
    tribeCodes.put("155", "Mescalero Apache Tribe of the Mescalero Reservation, New Mexico");
    tribeCodes.put("156", "Miami Tribe of Oklahoma");
    tribeCodes.put("157", "Miccosukee Tribe of Indians");
    tribeCodes.put("158", "Middletown Rancheria of Pomo Indians of California");
    tribeCodes.put(
        "159",
        "Minnesota Chippewa Tribe, Minnesota (Six component reservations: Bois Forte Band (Nett Lake); Fond du Lac Band; Grand Portage Band; Leech Lake Band; Mille Lacs Band; White Earth Band)");
    tribeCodes.put("160", "Bois Forte Band (Nett Lake); Fond du Lac Band; Gra");
    tribeCodes.put("161", "Mississippi Band of Choctaw Indians");
    tribeCodes.put(
        "162", "Moapa Band of Paiute Indians of the Moapa River Indian Reservation, Nevada");
    tribeCodes.put("163", "Modoc Nation");
    tribeCodes.put("164", "Mohegan Tribe of Indians of Connecticut");
    tribeCodes.put("165", "Mooretown Rancheria of Maidu Indians of California");
    tribeCodes.put("166", "Morongo Band of Mission Indians, California");
    tribeCodes.put("167", "Muckleshoot Indian Tribe");
    tribeCodes.put("168", "The Muscogee (Creek) Nation");
    tribeCodes.put("169", "Narragansett Indian Tribe");
    tribeCodes.put("170", "Navajo Nation, Arizona, New Mexico, & Utah");
    tribeCodes.put("171", "Nez Perce Tribe");
    tribeCodes.put("172", "Nisqually Indian Tribe of the Nisqually Reservatio");
    tribeCodes.put("173", "Nooksack Indian Tribe");
    tribeCodes.put(
        "174", "Northern Cheyenne Tribe of the Northern Cheyenne Indian Reservation, Montana");
    tribeCodes.put("175", "Northfork Rancheria of Mono Indians of California");
    tribeCodes.put("176", "Northwestern Band of the Shoshone Nation");
    tribeCodes.put("177", "Oglala Sioux Tribe");
    tribeCodes.put("178", "Omaha Tribe of Nebraska");
    tribeCodes.put("179", "Oneida Indian Nation");
    tribeCodes.put("180", "Oneida Nation");
    tribeCodes.put("181", "Onondaga Nation");
    tribeCodes.put("182", "The Osage Nation");
    tribeCodes.put("184", "Otoe-Missouria Tribe of Indians, Oklahoma");
    tribeCodes.put("183", "Ottawa Tribe of Oklahoma");
    tribeCodes.put(
        "185",
        "Paiute Indian Tribe of Utah (Cedar Band of Paiutes, Kanosh Band of Paiutes, Koosharem Band of Paiutes, Indian Peaks Band of Paiutes, and Shivwits Band of Paiutes)");
    tribeCodes.put("186", "Bishop Paiute Tribe");
    tribeCodes.put("188", "Lone Pine Paiute-Shoshone Tribe");
    tribeCodes.put("187", "Paiute-Shoshone Tribe of the Fallon Reservation and Colony, Nevada");
    tribeCodes.put("189", "Pala Band of Mission Indians");
    tribeCodes.put("190", "Pascua Yaqui Tribe of Arizona");
    tribeCodes.put("191", "Paskenta Band of Nomlaki Indians of California");
    tribeCodes.put("192", "Passamaquoddy Tribe");
    tribeCodes.put(
        "193",
        "Pauma Band of Luiseno Mission Indians of the Pauma & Yuima Reservation, California");
    tribeCodes.put("194", "Pawnee Nation of Oklahoma");
    tribeCodes.put("195", "Pechanga Band of Indians");
    tribeCodes.put("196", "Penobscot Nation");
    tribeCodes.put("197", "Peoria Tribe of Indians of Oklahoma");
    tribeCodes.put("198", "Picayune Rancheria of Chukchansi Indians of California");
    tribeCodes.put("199", "Pinoleville Pomo Nation, California");
    tribeCodes.put(
        "200",
        "Pit River Tribe, California (includes XL Ranch, Big Bend, Likely, Lookout, Montgomery Creek, and Roaring Creek Rancherias)");
    tribeCodes.put("201", "Poarch Band of Creek Indians");
    tribeCodes.put("202", "Pokagon Band of Potawatomi Indians, Michigan and Indiana");
    tribeCodes.put("203", "Ponca Tribe of Indians of Oklahoma");
    tribeCodes.put("204", "Ponca Tribe of Nebraska");
    tribeCodes.put("205", "Port Gamble S'Klallam Tribe");
    tribeCodes.put("206", "Potter Valley Tribe, California");
    tribeCodes.put("207", "Prairie Band Potawatomi Nation");
    tribeCodes.put("208", "Prairie Island Indian Community in the State of Minnesota");
    tribeCodes.put("209", "Pueblo of Acoma, New Mexico");
    tribeCodes.put("210", "Pueblo of Cochiti, New Mexico");
    tribeCodes.put("212", "Pueblo of Isleta, New Mexico");
    tribeCodes.put("211", "Pueblo of Jemez, New Mexico");
    tribeCodes.put("213", "Pueblo of Laguna, New Mexico");
    tribeCodes.put("214", "Pueblo of Nambe, New Mexico");
    tribeCodes.put("215", "Pueblo of Picuris, New Mexico");
    tribeCodes.put("216", "Pueblo of Pojoaque, New Mexico");
    tribeCodes.put("217", "Pueblo of San Felipe, New Mexico");
    tribeCodes.put("219", "Pueblo of San Ildefonso, New Mexico");
    tribeCodes.put("218", "Ohkay Owingeh, New Mexico");
    tribeCodes.put("220", "Pueblo of Sandia, New Mexico");
    tribeCodes.put("221", "Pueblo of Santa Ana, New Mexico");
    tribeCodes.put("222", "Pueblo of Santa Clara, New Mexico");
    tribeCodes.put("223", "Santo Domingo Pueblo");
    tribeCodes.put("224", "Pueblo of Taos, New Mexico");
    tribeCodes.put("225", "Pueblo of Tesuque, New Mexico");
    tribeCodes.put("226", "Pueblo of Zia, New Mexico");
    tribeCodes.put("227", "Puyallup Tribe of the Puyallup Reservation");
    tribeCodes.put("228", "Pyramid Lake Paiute Tribe of the Pyramid Lake Reservation, Nevada");
    tribeCodes.put("229", "Quapaw Nation");
    tribeCodes.put(
        "230", "Quartz Valley Indian Community of the Quartz Valley Reservation of California");
    tribeCodes.put(
        "231", "Quechan Tribe of the Fort Yuma Indian Reservation, California & Arizona");
    tribeCodes.put("232", "Quileute Tribe of the Quileute Reservation");
    tribeCodes.put("233", "Quinault Indian Nation");
    tribeCodes.put("234", "Ramona Band of Cahuilla, California");
    tribeCodes.put("235", "Red Cliff Band of Lake Superior Chippewa Indians of Wisconsin");
    tribeCodes.put("236", "Red Lake Band of Chippewa Indians, Minnesota");
    tribeCodes.put("237", "Redding Rancheria, California");
    tribeCodes.put(
        "238",
        "Redwood Valley or Little River Band of Pomo Indians of the Redwood Valley Rancheria California");
    tribeCodes.put("239", "Reno-Sparks Indian Colony, Nevada");
    tribeCodes.put("240", "Resighini Rancheria, California");
    tribeCodes.put(
        "241", "Rincon Band of Luiseno Mission Indians of Rincon Reservation, California");
    tribeCodes.put("242", "Robinson Rancheria");
    tribeCodes.put("243", "Rosebud Sioux Tribe of the Rosebud Indian Reservation, South Dakota");
    tribeCodes.put("244", "Round Valley Indian Tribes, Round Valley Reservation, California");
    tribeCodes.put("245", "Yocha Dehe Wintun Nation, California");
    tribeCodes.put("247", "Sac & Fox Nation of Missouri in Kansas and Nebraska");
    tribeCodes.put("248", "Sac & Fox Nation, Oklahoma");
    tribeCodes.put("246", "Sac & Fox Tribe of the Mississippi in Iowa");
    tribeCodes.put("249", "Saginaw Chippewa Indian Tribe of Michigan");
    tribeCodes.put(
        "250", "Salt River Pima-Maricopa Indian Community of the Salt River Reservation, Arizona");
    tribeCodes.put("251", "Samish Indian Nation");
    tribeCodes.put("252", "San Carlos Apache Tribe of the San Carlos Reservation, Arizona");
    tribeCodes.put("253", "San Juan Southern Paiute Tribe of Arizona");
    tribeCodes.put("254", "Yuhaaviatam of San Manuel Nation");
    tribeCodes.put("255", "San Pasqual Band of Diegueno Mission Indians of California");
    tribeCodes.put("257", "Santa Rosa Band of Cahuilla Indians, California");
    tribeCodes.put("256", "Santa Rosa Indian Community of the Santa Rosa Rancheria, California");
    tribeCodes.put(
        "258",
        "Santa Ynez Band of Chumash Mission Indians of the Santa Ynez Reservation, California");
    tribeCodes.put("259", "Iipay Nation of Santa Ysabel, California");
    tribeCodes.put("260", "Santee Sioux Nation, Nebraska");
    tribeCodes.put("261", "Sauk-Suiattle Indian Tribe");
    tribeCodes.put("262", "Sault Ste. Marie Tribe of Chippewa Indians, Michigan");
    tribeCodes.put("263", "Scotts Valley Band of Pomo Indians of California");
    tribeCodes.put("264", "The Seminole Nation of Oklahoma");
    tribeCodes.put("265", "Seminole Tribe of Florida");
    tribeCodes.put("266", "Seneca Nation of Indians");
    tribeCodes.put("267", "Seneca-Cayuga Nation");
    tribeCodes.put("268", "Shakopee Mdewakanton Sioux Community of Minnesota");
    tribeCodes.put("269", "Shawnee Tribe");
    tribeCodes.put("270", "Sherwood Valley Rancheria of Pomo Indians of California");
    tribeCodes.put(
        "271",
        "Shingle Springs Band of Miwok Indians, Shingle Springs Rancheria (Verona Tract), California");
    tribeCodes.put("272", "Shoalwater Bay Indian Tribe of the Shoalwater Bay Indian Reservation");
    tribeCodes.put("273", "Eastern Shoshone Tribe of the Wind River Reservation, Wyoming");
    tribeCodes.put("274", "Shoshone-Bannock Tribes of the Fort Hall Reservation");
    tribeCodes.put("275", "Shoshone-Paiute Tribes of the Duck Valley Reservation, Nevada");
    tribeCodes.put("276", "Sisseton-Wahpeton Oyate of the Lake Traverse Reservation, South Dakota");
    tribeCodes.put("277", "Skokomish Indian Tribe");
    tribeCodes.put("278", "Skull Valley Band of Goshute Indians of Utah");
    tribeCodes.put("279", "Tolowa Dee-ni' Nation");
    tribeCodes.put("280", "Snoqualmie Indian Tribe");
    tribeCodes.put("281", "Soboba Band of Luiseno Indians, California");
    tribeCodes.put("282", "Sokaogon Chippewa Community, Wisconsin");
    tribeCodes.put("283", "Southern Ute Indian Tribe of the Southern Ute Reservation, Colorado");
    tribeCodes.put("284", "Spirit Lake Tribe, North Dakota");
    tribeCodes.put("285", "Spokane Tribe of the Spokane Reservation");
    tribeCodes.put("286", "Squaxin Island Tribe of the Squaxin Island Reservation");
    tribeCodes.put("287", "St. Croix Chippewa Indians of Wisconsin");
    tribeCodes.put("288", "Saint Regis Mohawk Tribe");
    tribeCodes.put("289", "Standing Rock Sioux Tribe of North & South Dakota");
    tribeCodes.put("291", "Stillaguamish Tribe of Indians of Washington");
    tribeCodes.put("290", "Stockbridge Munsee Community, Wisconsin");
    tribeCodes.put("292", "Summit Lake Paiute Tribe of Nevada");
    tribeCodes.put("293", "Suquamish Indian Tribe of the Port Madison Reservation");
    tribeCodes.put("294", "Susanville Indian Rancheria, California");
    tribeCodes.put("295", "Swinomish Indian Tribal Community");
    tribeCodes.put("296", "Sycuan Band of the Kumeyaay Nation");
    tribeCodes.put("297", "Wiyot Tribe, California");
    tribeCodes.put("298", "Table Mountain Rancheria");
    tribeCodes.put(
        "299",
        "Te-Moak Tribe of Western Shoshone Indians of Nevada (Four constituent bands: Battle Mountain Band; Elko Band; South Fork Band; and Wells Band)");
    tribeCodes.put("300", "Thlopthlocco Tribal Town");
    tribeCodes.put("301", "Three Affiliated Tribes of the Fort Berthold Reservation, North Dakota");
    tribeCodes.put("302", "Tohono O'odham Nation of Arizona");
    tribeCodes.put("303", "Tonawanda Band of Seneca");
    tribeCodes.put("304", "Tonkawa Tribe of Indians of Oklahoma");
    tribeCodes.put("305", "Tonto Apache Tribe of Arizona");
    tribeCodes.put("306", "Torres Martinez Desert Cahuilla Indians, California");
    tribeCodes.put("308", "Tulalip Tribes of Washington");
    tribeCodes.put("307", "Tule River Indian Tribe of the Tule River Reservation, California");
    tribeCodes.put("309", "Tunica-Biloxi Indian Tribe");
    tribeCodes.put(
        "310", "Tuolumne Band of Me-Wuk Indians of the Tuolumne Rancheria of California");
    tribeCodes.put("311", "Turtle Mountain Band of Chippewa Indians of North Dakota");
    tribeCodes.put("312", "Tuscarora Nation");
    tribeCodes.put("313", "Twenty-Nine Palms Band of Mission Indians of California");
    tribeCodes.put("314", "United Auburn Indian Community of the Auburn Rancheria of California");
    tribeCodes.put("315", "United Keetoowah Band of Cherokee Indians in Oklahoma");
    tribeCodes.put("316", "Habematolel Pomo of Upper Lake, California");
    tribeCodes.put("317", "Upper Sioux Community, Minnesota");
    tribeCodes.put("318", "Upper Skagit Indian Tribe");
    tribeCodes.put("319", "Ute Indian Tribe of the Uintah & Ouray Reservation, Utah");
    tribeCodes.put("320", "Ute Mountain Ute Tribe");
    tribeCodes.put(
        "321", "Utu Utu Gwaitu Paiute Tribe of the Benton Paiute Reservation, California");
    tribeCodes.put("34", "Viejas (Baron Long) Group of Capitan Grande Band o");
    tribeCodes.put("322", "Walker River Paiute Tribe of the Walker River Reservation, Nevada");
    tribeCodes.put("323", "Wampanoag Tribe of Gay Head (Aquinnah)");
    tribeCodes.put(
        "324",
        "Washoe Tribe of Nevada & California (Carson Colony, Dresslerville Colony, Woodfords Community, Stewart Community, & Washoe Ranches)");
    tribeCodes.put("325", "White Mountain Apache Tribe of the Fort Apache Reservation, Arizona");
    tribeCodes.put(
        "326", "Wichita and Affiliated Tribes (Wichita, Keechi, Waco, & Tawakonie), Oklahoma");
    tribeCodes.put("327", "Winnebago Tribe of Nebraska");
    tribeCodes.put("328", "Winnemucca Indian Colony of Nevada");
    tribeCodes.put("329", "Wyandotte Nation");
    tribeCodes.put("330", "Yankton Sioux Tribe of South Dakota");
    tribeCodes.put("331", "Yavapai-Apache Nation of the Camp Verde Indian Reservation, Arizona");
    tribeCodes.put("332", "Yavapai-Prescott Indian Tribe");
    tribeCodes.put(
        "333", "Yerington Paiute Tribe of the Yerington Colony & Campbell Ranch, Nevada");
    tribeCodes.put("334", "Yomba Shoshone Tribe of the Yomba Reservation, Nevada");
    tribeCodes.put("335", "Ysleta del Sur Pueblo");
    tribeCodes.put("336", "Yurok Tribe of the Yurok Reservation, California");
    tribeCodes.put("337", "Zuni Tribe of the Zuni Reservation, New Mexico");
    tribeCodes.put("338", "Native Village of Afognak");
    tribeCodes.put("339", "Agdaagux Tribe of King Cove");
    tribeCodes.put("340", "Native Village of Akhiok");
    tribeCodes.put("341", "Akiachak Native Community");
    tribeCodes.put("342", "Akiak Native Community");
    tribeCodes.put("343", "Native Village of Akutan");
    tribeCodes.put("344", "Village of Alakanuk");
    tribeCodes.put("345", "Alatna Village");
    tribeCodes.put("346", "Native Village of Aleknagik");
    tribeCodes.put("347", "Algaaciq Native Village (St. Mary's)");
    tribeCodes.put("348", "Allakaket Village");
    tribeCodes.put("349", "Native Village of Ambler");
    tribeCodes.put("350", "Village of Anaktuvuk Pass");
    tribeCodes.put("351", "Yupiit of Andreafski");
    tribeCodes.put("352", "Angoon Community Association");
    tribeCodes.put("353", "Village of Aniak");
    tribeCodes.put("354", "Anvik Village");
    tribeCodes.put("355", "Arctic Village");
    tribeCodes.put("356", "Asa'carsarmiut Tribe");
    tribeCodes.put("357", "Native Village of Atka");
    tribeCodes.put("358", "Village of Atmautluak");
    tribeCodes.put("359", "Native Village of Atqasuk");
    tribeCodes.put("360", "Native Village of Barrow Inupiat Traditional Government");
    tribeCodes.put("361", "Beaver Village");
    tribeCodes.put("362", "Native Village of Belkofski");
    tribeCodes.put("363", "Village of Bill Moore's Slough");
    tribeCodes.put("364", "Birch Creek Tribe");
    tribeCodes.put("365", "Native Village of Brevig Mission");
    tribeCodes.put("366", "Native Village of Buckland");
    tribeCodes.put("367", "Native Village of Cantwell");
    tribeCodes.put("368", "Native Village of Chenega (aka Chanega)");
    tribeCodes.put("369", "Chalkyitsik Village");
    tribeCodes.put("370", "Village of Chefornak");
    tribeCodes.put("371", "Chevak Native Village");
    tribeCodes.put("372", "Chickaloon Native Village");
    tribeCodes.put("373", "Chignik Bay Tribal Council");
    tribeCodes.put("374", "Native Village of Chignik Lagoon");
    tribeCodes.put("375", "Chignik Lake Village");
    tribeCodes.put("376", "Chilkat Indian Village (Klukwan)");
    tribeCodes.put("377", "Chilkoot Indian Association (Haines)");
    tribeCodes.put("378", "Chinik Eskimo Community (Golovin)");
    tribeCodes.put("379", "Cheesh-Na Tribe");
    tribeCodes.put("380", "Native Village of Chitina");
    tribeCodes.put("381", "Native Village of Chuathbaluk (Russian Mission, Kuskokwim)");
    tribeCodes.put("382", "Chuloonawick Native Village");
    tribeCodes.put("383", "Circle Native Community");
    tribeCodes.put("384", "Village of Clarks Point");
    tribeCodes.put("385", "Native Village of Council");
    tribeCodes.put("386", "Craig Tribal Association");
    tribeCodes.put("387", "Village of Crooked Creek");
    tribeCodes.put("388", "Curyung Tribal Council");
    tribeCodes.put("389", "Native Village of Deering");
    tribeCodes.put("390", "Native Village of Diomede (aka Inalik)");
    tribeCodes.put("391", "Village of Dot Lake");
    tribeCodes.put("392", "Douglas Indian Association");
    tribeCodes.put("393", "Native Village of Eagle");
    tribeCodes.put("394", "Native Village of Eek");
    tribeCodes.put("395", "Egegik Village");
    tribeCodes.put("396", "Eklutna Native Village");
    tribeCodes.put("397", "Native Village of Ekuk");
    tribeCodes.put("398", "Native Village of Ekwok");
    tribeCodes.put("399", "Native Village of Elim");
    tribeCodes.put("400", "Emmonak Village");
    tribeCodes.put("401", "Evansville Village (aka Bettles Field)");
    tribeCodes.put("402", "Native Village of Eyak (Cordova)");
    tribeCodes.put("403", "Native Village of False Pass");
    tribeCodes.put("404", "Native Village of Fort Yukon");
    tribeCodes.put("405", "Native Village of Gakona");
    tribeCodes.put("406", "Galena Village (aka Louden Village)");
    tribeCodes.put("407", "Native Village of Gambell");
    tribeCodes.put("408", "Native Village of Georgetown");
    tribeCodes.put("409", "Native Village of Goodnews Bay");
    tribeCodes.put("410", "Organized Village of Grayling (aka Holikachuk)");
    tribeCodes.put("411", "Gulkana Village Council");
    tribeCodes.put("412", "Native Village of Hamilton");
    tribeCodes.put("413", "Healy Lake Village");
    tribeCodes.put("414", "Holy Cross Tribe");
    tribeCodes.put("415", "Hoonah Indian Association");
    tribeCodes.put("416", "Native Village of Hooper Bay");
    tribeCodes.put("417", "Hughes Village");
    tribeCodes.put("418", "Huslia Village");
    tribeCodes.put("419", "Hydaburg Cooperative Association");
    tribeCodes.put("420", "Igiugig Village");
    tribeCodes.put("421", "Village of Iliamna");
    tribeCodes.put("422", "Inupiat Community of the Arctic Slope");
    tribeCodes.put("423", "Iqugmiut Traditional Council");
    tribeCodes.put("424", "Ivanof Bay Tribe");
    tribeCodes.put("425", "Kaguyak Village");
    tribeCodes.put("426", "Organized Village of Kake");
    tribeCodes.put("427", "Kaktovik Village (aka Barter Island)");
    tribeCodes.put("428", "Village of Kalskag");
    tribeCodes.put("429", "Village of Kaltag");
    tribeCodes.put("430", "Native Village of Kanatak");
    tribeCodes.put("431", "Native Village of Karluk");
    tribeCodes.put("432", "Organized Village of Kasaan");
    tribeCodes.put("433", "Kasigluk Traditional Elders Council");
    tribeCodes.put("434", "Kenaitze Indian Tribe");
    tribeCodes.put("435", "Ketchikan Indian Community");
    tribeCodes.put("436", "Native Village of Kiana");
    tribeCodes.put("437", "King Island Native Community");
    tribeCodes.put("438", "King Salmon Tribe");
    tribeCodes.put("439", "Native Village of Kipnuk");
    tribeCodes.put("440", "Native Village of Kivalina");
    tribeCodes.put("441", "Klawock Cooperative Association");
    tribeCodes.put("442", "Native Village of Kluti Kaah (aka Copper Center)");
    tribeCodes.put("443", "Knik Tribe");
    tribeCodes.put("444", "Native Village of Kobuk");
    tribeCodes.put("445", "Kokhanok Village");
    tribeCodes.put("446", "Native Village of Kongiganak");
    tribeCodes.put("447", "Village of Kotlik");
    tribeCodes.put("448", "Native Village of Kotzebue");
    tribeCodes.put("449", "Native Village of Koyuk");
    tribeCodes.put("450", "Koyukuk Native Village");
    tribeCodes.put("451", "Organized Village of Kwethluk");
    tribeCodes.put("452", "Native Village of Kwigillingok");
    tribeCodes.put("453", "Native Village of Kwinhagak (aka Quinhagak)");
    tribeCodes.put("454", "Native Village of Larsen Bay");
    tribeCodes.put("455", "Levelock Village");
    tribeCodes.put("456", "Tangirnaq Native Village");
    tribeCodes.put("457", "Lime Village");
    tribeCodes.put("458", "Village of Lower Kalskag");
    tribeCodes.put("459", "Manley Hot Springs Village");
    tribeCodes.put("460", "Manokotak Village");
    tribeCodes.put("461", "Native Village of Marshall (aka Fortuna Ledge)");
    tribeCodes.put("462", "Native Village of Mary's Igloo");
    tribeCodes.put("463", "McGrath Native Village");
    tribeCodes.put("464", "Native Village of Mekoryuk");
    tribeCodes.put("465", "Mentasta Traditional Council");
    tribeCodes.put("466", "Metlakatla Indian Community, Annette Island Reserve");
    tribeCodes.put("467", "Native Village of Minto");
    tribeCodes.put("468", "Naknek Native Village");
    tribeCodes.put("469", "Native Village of Nanwalek (aka English Bay)");
    tribeCodes.put("470", "Native Village of Napaimute");
    tribeCodes.put("471", "Native Village of Napakiak");
    tribeCodes.put("472", "Native Village of Napaskiak");
    tribeCodes.put("473", "Native Village of Nelson Lagoon");
    tribeCodes.put("474", "Nenana Native Association");
    tribeCodes.put("475", "New Koliganek Village Council");
    tribeCodes.put("476", "New Stuyahok Village");
    tribeCodes.put("477", "Newhalen Village");
    tribeCodes.put("478", "Newtok Village");
    tribeCodes.put("479", "Native Village of Nightmute");
    tribeCodes.put("480", "Nikolai Village");
    tribeCodes.put("481", "Native Village of Nikolski");
    tribeCodes.put("482", "Ninilchik Village");
    tribeCodes.put("483", "Native Village of Noatak");
    tribeCodes.put("484", "Nome Eskimo Community");
    tribeCodes.put("485", "Nondalton Village");
    tribeCodes.put("486", "Noorvik Native Community");
    tribeCodes.put("487", "Northway Village");
    tribeCodes.put("488", "Native Village of Nuiqsut (aka Nooiksut)");
    tribeCodes.put("489", "Nulato Village");
    tribeCodes.put("490", "Nunakauyarmiut Tribe");
    tribeCodes.put("491", "Native Village of Nunapitchuk");
    tribeCodes.put("492", "Village of Ohogamiut");
    tribeCodes.put("493", "Alutiiq Tribe of Old Harbor");
    tribeCodes.put("494", "Orutsararmiut Traditional Native Council");
    tribeCodes.put("495", "Oscarville Traditional Village");
    tribeCodes.put("496", "Native Village of Ouzinkie");
    tribeCodes.put("497", "Native Village of Paimiut");
    tribeCodes.put("498", "Pauloff Harbor Village");
    tribeCodes.put("499", "Pedro Bay Village");
    tribeCodes.put("500", "Native Village of Perryville");
    tribeCodes.put("501", "Petersburg Indian Association");
    tribeCodes.put("502", "Native Village of Pilot Point");
    tribeCodes.put("503", "Pilot Station Traditional Village");
    tribeCodes.put("504", "Pitka's Point Traditional Council");
    tribeCodes.put("505", "Platinum Traditional Village");
    tribeCodes.put("506", "Native Village of Point Hope");
    tribeCodes.put("507", "Native Village of Point Lay");
    tribeCodes.put("508", "Native Village of Port Graham");
    tribeCodes.put("509", "Native Village of Port Heiden");
    tribeCodes.put("510", "Native Village of Port Lions");
    tribeCodes.put("511", "Portage Creek Village (aka Ohgsenakale)");
    tribeCodes.put(
        "512",
        "Pribilof Islands Aleut Communities of St. Paul & St. George Islands (Saint George Island and Saint Paul Island)");
    tribeCodes.put("513", "Qagan Tayagungin Tribe of Sand Point");
    tribeCodes.put("514", "Qawalangin Tribe of Unalaska");
    tribeCodes.put("515", "Rampart Village");
    tribeCodes.put("516", "Village of Red Devil");
    tribeCodes.put("517", "Native Village of Ruby");
    tribeCodes.put("518", "Saint George Island");
    tribeCodes.put("519", "Native Village of Saint Michael");
    tribeCodes.put("520", "Saint Paul Island");
    tribeCodes.put("521", "Salamatof Tribe");
    tribeCodes.put("522", "Native Village of Savoonga");
    tribeCodes.put("523", "Organized Village of Saxman");
    tribeCodes.put("524", "Native Village of Scammon Bay");
    tribeCodes.put("525", "Native Village of Selawik");
    tribeCodes.put("526", "Seldovia Village Tribe");
    tribeCodes.put("527", "Shageluk Native Village");
    tribeCodes.put("528", "Native Village of Shaktoolik");
    tribeCodes.put("529", "Native Village of Nunam Iqua");
    tribeCodes.put("530", "Native Village of Shishmaref");
    tribeCodes.put("531", "Sun'aq Tribe of Kodiak");
    tribeCodes.put("532", "Native Village of Shungnak");
    tribeCodes.put("533", "Sitka Tribe of Alaska");
    tribeCodes.put("534", "Skagway Village");
    tribeCodes.put("535", "Village of Sleetmute");
    tribeCodes.put("536", "Village of Solomon");
    tribeCodes.put("537", "South Naknek Village");
    tribeCodes.put("538", "Stebbins Community Association");
    tribeCodes.put("539", "Native Village of Stevens");
    tribeCodes.put("540", "Village of Stony River");
    tribeCodes.put("541", "Takotna Village");
    tribeCodes.put("542", "Native Village of Tanacross");
    tribeCodes.put("543", "Native Village of Tanana");
    tribeCodes.put("544", "Native Village of Tatitlek");
    tribeCodes.put("545", "Native Village of Tazlina");
    tribeCodes.put("546", "Telida Village");
    tribeCodes.put("547", "Native Village of Teller");
    tribeCodes.put("548", "Native Village of Tetlin");
    tribeCodes.put("549", "Central Council of the Tlingit & Haida Indian Tribes");
    tribeCodes.put("550", "Traditional Village of Togiak");
    tribeCodes.put("551", "Tuluksak Native Community");
    tribeCodes.put("552", "Native Village of Tuntutuliak");
    tribeCodes.put("553", "Native Village of Tununak");
    tribeCodes.put("554", "Twin Hills Village");
    tribeCodes.put("555", "Native Village of Tyonek");
    tribeCodes.put("556", "Ugashik Village");
    tribeCodes.put("557", "Umkumiut Native Village");
    tribeCodes.put("558", "Native Village of Unalakleet");
    tribeCodes.put("559", "Native Village of Unga");
    tribeCodes.put("560", "Village of Venetie");
    tribeCodes.put(
        "561",
        "Native Village of Venetie Tribal Government (Arctic Village and Village of Venetie)");
    tribeCodes.put("562", "Village of Wainwright");
    tribeCodes.put("563", "Native Village of Wales");
    tribeCodes.put("564", "Native Village of White Mountain");
    tribeCodes.put("565", "Wrangell Cooperative Association");
    tribeCodes.put("566", "Yakutat Tlingit Tribe");
    tribeCodes.put("567", "Chickahominy Indian Tribe");
    tribeCodes.put("568", "Chickahominy Indian Tribe—Eastern Division");
    tribeCodes.put("569", "Monacan Indian Nation");
    tribeCodes.put("570", "Nansemond Indian Nation");
    tribeCodes.put("571", "Rappahannock Tribe, Inc.");
    tribeCodes.put("572", "Upper Mattaponi Tribe");
    tribeCodes.put("573", "Cowlitz Indian Tribe");
    tribeCodes.put("574", "Little Shell Tribe of Chippewa Indians of Montana");
    tribeCodes.put("575", "Mashpee Wampanoag Tribe");
    tribeCodes.put("576", "Pamunkey Indian Tribe");
    tribeCodes.put("577", "Shinnecock Indian Nation");
    tribeCodes.put("578", "Wilton Rancheria, California");
    tribeCodes.put("579", "Tejon Indian Tribe");
    return tribeCodes;
  }

  public static final Map<String, String> raceMap = new HashMap<>();
  private static final String NATIVE_CODE = "1002-5";
  private static final String ASIAN_CODE = "2028-9";
  private static final String BLACK_CODE = "2054-5";
  private static final String PACIFIC_CODE = "2076-8";
  private static final String WHITE_CODE = "2106-3";
  private static final String OTHER_CODE = "2131-1";

  static {
    raceMap.put("native", NATIVE_CODE);
    raceMap.put(NATIVE_CODE, "native");
    raceMap.put("american indian or alaska native", NATIVE_CODE);
    raceMap.put("asian", ASIAN_CODE);
    raceMap.put(ASIAN_CODE, "asian");
    raceMap.put("black", BLACK_CODE);
    raceMap.put(BLACK_CODE, "black");
    raceMap.put("black or african american", BLACK_CODE);
    raceMap.put("pacific", PACIFIC_CODE);
    raceMap.put(PACIFIC_CODE, "pacific");
    raceMap.put("native hawaiian or other pacific islander", PACIFIC_CODE);
    raceMap.put("white", WHITE_CODE);
    raceMap.put(WHITE_CODE, "white");
    raceMap.put("other", OTHER_CODE);
    raceMap.put(OTHER_CODE, "other");
    raceMap.put("unknown", MappingConstants.UNK_CODE);
    raceMap.put("unk", MappingConstants.UNK_CODE);
    raceMap.put("refused", MappingConstants.ASKED_BUT_UNKNOWN_CODE); // Asked, but unknown
    raceMap.put("ask, but unknown", MappingConstants.ASKED_BUT_UNKNOWN_CODE); // Asked, but unknown
    raceMap.put("asku", MappingConstants.ASKED_BUT_UNKNOWN_CODE); // Asked, but unknown
  }

  private static final List<String> hispanic = List.of("H", "Hispanic or Latino");
  private static final List<String> not_hispanic = List.of("N", "Not Hispanic or Latino");
  public static final Map<String, List<String>> ETHNICITY_MAP =
      Map.of(
          "hispanic", hispanic,
          "hispanic or latino", hispanic,
          "2135-2", hispanic,
          "not_hispanic", not_hispanic,
          "not hispanic or latino", not_hispanic,
          "2186-5", not_hispanic,
          "refused", List.of("U", "unknown"));

  public static final String HOSPITAL_LITERAL = "hospital";
  public static final String HOSPITAL_SNOMED = "22232009";
  public static final String HOSPITAL_SHIP_LITERAL = "hospital ship";
  public static final String HOSPITAL_SHIP_SNOMED = "2081004";
  public static final String LONG_TERM_HOSPITAL_LITERAL = "long term care hospital";
  public static final String LONG_TERM_HOSPITAL_SNOMED = "32074000";
  public static final String SECURE_HOSPITAL_LITERAL = "secure hospital";
  public static final String SECURE_HOSPITAL_SNOMED = "224929004";
  public static final String NURSING_HOME_LITERAL = "nursing home";
  public static final String NURSING_HOME_SNOMED = "42665001";
  public static final String RETIREMENT_HOME_LITERAL = "retirement home";
  public static final String RETIREMENT_HOME_SNOMED = "30629002";
  public static final String ORPHANAGE_LITERAL = "orphanage";
  public static final String ORPHANAGE_SNOMED = "74056004";
  public static final String PRISON_BASED_CARE_LITERAL = "prison-based care site";
  public static final String PRISON_BASED_CARE_SNOMED = "722173008";
  public static final String SUBSTANCE_ABUSE_TREATMENT_CENTER_LITERAL =
      "substance abuse treatment center";
  public static final String SUBSTANCE_ABUSE_TREATMENT_CENTER_SNOMED = "20078004";
  public static final String BOARDING_HOUSE_LITERAL = "boarding house";
  public static final String BOARDING_HOUSE_SNOMED = "257573002";
  public static final String MILITARY_ACCOMMODATION_LITERAL = "military accommodation";
  public static final String MILITARY_ACCOMMODATION_SNOMED = "224683003";
  public static final String HOSPICE_LITERAL = "hospice";
  public static final String HOSPICE_SNOMED = "284546000";
  public static final String HOSTEL_LITERAL = "hostel";
  public static final String HOSTEL_SNOMED = "257628001";
  public static final String SHELTERED_HOUSING_LITERAL = "sheltered housing";
  public static final String SHELTERED_HOUSING_SNOMED = "310207003";
  public static final String PENAL_INSTITUTION_LITERAL = "penal institution";
  public static final String PENAL_INSTITUTION_SNOMED = "57656006";
  public static final String RELIGIOUS_RESIDENCE_LITERAL = "religious institutional residence";
  public static final String RELIGIOUS_RESIDENCE_SNOMED = "285113009";
  public static final String WORK_ENVIRONMENT_LITERAL = "work (environment)";
  public static final String WORK_ENVIRONMENT_SNOMED = "285141008";
  public static final String HOMELESS_LITERAL = "homeless";
  public static final String HOMELESS_SNOMED = "32911000";

  public static final Map<String, String> getResidenceTypeMap() {
    Map<String, String> residenceTypeMap = new HashMap<>();
    residenceTypeMap.put(HOSPITAL_SNOMED, HOSPITAL_LITERAL);
    residenceTypeMap.put(HOSPITAL_LITERAL, HOSPITAL_SNOMED);
    residenceTypeMap.put(HOSPITAL_SHIP_SNOMED, HOSPITAL_SHIP_LITERAL);
    residenceTypeMap.put(HOSPITAL_SHIP_LITERAL, HOSPITAL_SHIP_SNOMED);
    residenceTypeMap.put(LONG_TERM_HOSPITAL_SNOMED, LONG_TERM_HOSPITAL_LITERAL);
    residenceTypeMap.put(LONG_TERM_HOSPITAL_LITERAL, LONG_TERM_HOSPITAL_SNOMED);
    residenceTypeMap.put(SECURE_HOSPITAL_SNOMED, SECURE_HOSPITAL_LITERAL);
    residenceTypeMap.put(SECURE_HOSPITAL_LITERAL, SECURE_HOSPITAL_SNOMED);
    residenceTypeMap.put(NURSING_HOME_SNOMED, NURSING_HOME_LITERAL);
    residenceTypeMap.put(NURSING_HOME_LITERAL, NURSING_HOME_SNOMED);
    residenceTypeMap.put(RETIREMENT_HOME_SNOMED, RETIREMENT_HOME_LITERAL);
    residenceTypeMap.put(RETIREMENT_HOME_LITERAL, RETIREMENT_HOME_SNOMED);
    residenceTypeMap.put(ORPHANAGE_SNOMED, ORPHANAGE_LITERAL);
    residenceTypeMap.put(ORPHANAGE_LITERAL, ORPHANAGE_SNOMED);
    residenceTypeMap.put(PRISON_BASED_CARE_SNOMED, PRISON_BASED_CARE_LITERAL);
    residenceTypeMap.put(PRISON_BASED_CARE_LITERAL, PRISON_BASED_CARE_SNOMED);
    residenceTypeMap.put(
        SUBSTANCE_ABUSE_TREATMENT_CENTER_SNOMED, SUBSTANCE_ABUSE_TREATMENT_CENTER_LITERAL);
    residenceTypeMap.put(
        SUBSTANCE_ABUSE_TREATMENT_CENTER_LITERAL, SUBSTANCE_ABUSE_TREATMENT_CENTER_SNOMED);
    residenceTypeMap.put(BOARDING_HOUSE_SNOMED, BOARDING_HOUSE_LITERAL);
    residenceTypeMap.put(BOARDING_HOUSE_LITERAL, BOARDING_HOUSE_SNOMED);
    residenceTypeMap.put(MILITARY_ACCOMMODATION_SNOMED, MILITARY_ACCOMMODATION_LITERAL);
    residenceTypeMap.put(MILITARY_ACCOMMODATION_LITERAL, MILITARY_ACCOMMODATION_SNOMED);
    residenceTypeMap.put(HOSPICE_SNOMED, HOSPICE_LITERAL);
    residenceTypeMap.put(HOSPICE_LITERAL, HOSPICE_SNOMED);
    residenceTypeMap.put(HOSTEL_SNOMED, HOSTEL_LITERAL);
    residenceTypeMap.put(HOSTEL_LITERAL, HOSTEL_SNOMED);
    residenceTypeMap.put(SHELTERED_HOUSING_SNOMED, SHELTERED_HOUSING_LITERAL);
    residenceTypeMap.put(SHELTERED_HOUSING_LITERAL, SHELTERED_HOUSING_SNOMED);
    residenceTypeMap.put(PENAL_INSTITUTION_SNOMED, PENAL_INSTITUTION_LITERAL);
    residenceTypeMap.put(PENAL_INSTITUTION_LITERAL, PENAL_INSTITUTION_SNOMED);
    residenceTypeMap.put(RELIGIOUS_RESIDENCE_SNOMED, RELIGIOUS_RESIDENCE_LITERAL);
    residenceTypeMap.put(RELIGIOUS_RESIDENCE_LITERAL, RELIGIOUS_RESIDENCE_SNOMED);
    residenceTypeMap.put(WORK_ENVIRONMENT_SNOMED, WORK_ENVIRONMENT_LITERAL);
    residenceTypeMap.put(WORK_ENVIRONMENT_LITERAL, WORK_ENVIRONMENT_SNOMED);
    residenceTypeMap.put(HOMELESS_SNOMED, HOMELESS_LITERAL);
    residenceTypeMap.put(HOMELESS_LITERAL, HOMELESS_SNOMED);
    return residenceTypeMap;
  }

  private static final String PREGNANT_SNOMED = "77386006";
  private static final String NOT_PREGNANT_SNOMED = "60001007";
  private static final String PREGNANT_UNKNOWN_SNOMED = "102874004";
  public static final Map<String, String> pregnancyStatusSnomedMap =
      Map.of(
          "YES".toLowerCase(), PREGNANT_SNOMED,
          "Y".toLowerCase(), PREGNANT_SNOMED,
          "NO".toLowerCase(), NOT_PREGNANT_SNOMED,
          "N".toLowerCase(), NOT_PREGNANT_SNOMED,
          "UNK".toLowerCase(), PREGNANT_UNKNOWN_SNOMED,
          "U".toLowerCase(), PREGNANT_UNKNOWN_SNOMED);

  public static final Map<String, String> pregnancyStatusDisplayMap =
      Map.of(
          PREGNANT_SNOMED, "Pregnant",
          NOT_PREGNANT_SNOMED, "Not pregnant",
          PREGNANT_UNKNOWN_SNOMED, "Unknown");

  public static final Map<String, String> genderIdentitySnomedSet =
      Map.of(
          FEMALE, "446141000124107",
          MALE, "446151000124109",
          NON_BINARY, "446131000124102",
          TRANS_MAN, "446151000124109",
          TRANS_WOMAN, "446141000124107",
          OTHER, MappingConstants.UNK_CODE,
          REFUSED, "asked-declined");

  public static final Map<String, String> genderIdentityDisplaySet =
      Map.of(
          FEMALE, "Female gender identity",
          MALE, "Male gender identity",
          NON_BINARY, "Non-binary gender identity",
          TRANS_MAN, "Male gender identity",
          TRANS_WOMAN, "Female gender identity",
          OTHER, "Non-binary gender identity",
          REFUSED, "Asked But Declined");
}
