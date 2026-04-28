// vote.js
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ ALL 47 COUNTIES IN KENYA
const counties = [
  "Nairobi",
  "Mombasa",
  "Kiambu",
  "Nakuru",
  "Uasin Gishu",
  "Kisumu",
  "Kakamega",
  "Machakos",
  "Meru",
  "Nyeri",

  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",

  "Kericho",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Makueni",
  "Mandera",

  "Marsabit",
  "Migori",
  "Murang'a",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Samburu",
  "Siaya",
  "Taita Taveta",

  "Tana River",
  "Tharaka Nithi",
  "Trans Nzoia",
  "Turkana",
  "Vihiga",
  "Wajir",
  "West Pokot"
];

// ✅ DATA STRUCTURE
const data = {
  president: [
    {name: "William Ruto", party: "UDA", region: "Uasin Gishu", img: "https://nairobileo.co.ke/storage/uploads/2024/07/deta-1720771190-1721395261.jpeg"},
    {name: "Raila Odinga", party: "ODM", region: "Siaya", img: "https://tse4.mm.bing.net/th/id/OIP.9lj3fFyy3RxTP7FTFYaGpAHaJ4?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"},
    {name: "George Wajackoyah", party: "Roots Party", region: "Western", img: "https://kenyanmoves.co.ke/wp-content/uploads/2022/06/@Nation.jpg"},
    {name: "David Mwaure", party: "Agano Party", region: "Central", img: "https://nnmedia.nation.africa/uploads/2022/07/David-Mwaure.jpg"}
  ],

  governor: {

  "Uasin Gishu": [
    { name: "Jonathan Bii", party: "UDA", region: "Uasin Gishu", status: "winner", img: "https://tse3.mm.bing.net/th/id/OIP.D-yS76XtYb3pXIpXNRDC2QHaE7?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "Zedekiah Bundotich (Buzeki)", party: "Independent", region: "Uasin Gishu" , img: "https://tse1.mm.bing.net/th/id/OIP.jdXBMcWCGJGugpHjctsJlAHaDt?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "Dr. Mishra Kiprop", party: "Independent" , img: "https://i.pinimg.com/736x/02/84/72/028472cb4cf1766e62ec21db8a03cc32.jpg" }
  ],

  "Nairobi": [
    { name: "Johnson Sakaja", party: "UDA", status: "winner" , img: "https://www.c40.org/wp-content/uploads/2023/06/H.E-PROFILE-PIC-1.jpeg" },
    { name: "Polycarp Igathe", party: "Jubilee" , img: "https://biznakenya.com/wp-content/uploads/2020/03/Polycarp-Igathe-Biography-1.jpg" },
    { name: "Agnes Kagure", party: "Independent" , img: "https://cdn.tuko.co.ke/images/1200x675/d25de904fb196570.jpeg?v=1" },
    { name: "Margaret Wanjiru", party: "UDP" , img: "https://tse2.mm.bing.net/th/id/OIP.5ovavbE-CqTm3fG5Y-ih6wHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "Richard Ngatia", party: "Independent" , img: "https://cdn.thekenyatimes.com/uploads/2023/11/Richard-Ngatia-e1700034702621.jpg" }
  ],

  "Mombasa": [
    { name: "Abdulswamad Nassir", party: "ODM", status: "winner" , img: ""},
    { name: "Hassan Omar", party: "UDA" , img: ""},
    { name: "Saidi Ali", party: "Independent" , img: ""}
  ],

  "Kiambu": [
    { name: "Kimani Wamatangi", party: "UDA", status: "winner" , img: ""},
    { name: "William Kabogo", party: "Tujibebe Wakenya" , img: ""},
    { name: "Judy Mugo", party: "Independent" , img: ""}
  ],

  "Nakuru": [
    { name: "Susan Kihika", party: "UDA", status: "winner" , img: ""},
    { name: "Lee Kinyanjui", party: "Jubilee" , img: ""},
    { name: "Karanja Mburu", party: "Independent" , img: ""}
  ],

  "Kisumu": [
    { name: "Anyang' Nyong'o", party: "ODM", status: "winner" , img: ""},
    { name: "Jacktone Ong'ieng", party: "Independent" , img: ""},
    { name: "Moses Otieno", party: "UDA" , img: ""}
  ],

  "Kakamega": [
    { name: "Fernandes Barasa", party: "ODM", status: "winner" , img: ""},
    { name: "Cleophas Malala", party: "UDA" , img: ""},
    { name: "Wycliffe Oparanya (ally influence)", party: "ODM" , img: ""}
  ],

  "Machakos": [
    { name: "Wavinya Ndeti", party: "Wiper", status: "winner" , img: ""},
    { name: "Nzioka Waita", party: "Chama Cha Uzalendo" , img: ""},
    { name: "Augustine Kanoti", party: "Independent" , img: ""}
  ],

  "Meru": [
    { name: "Kawira Mwangaza", party: "Independent", status: "winner" , img: ""},
    { name: "Kiraitu Murungi", party: "DEP" , img: ""},
    { name: "Isaac Mutuma", party: "UDA" , img: ""}
  ],

  "Nyeri": [
    { name: "Mutahi Kahiga", party: "UDA", status: "winner" , img: ""},
    { name: "Ephraim Maina", party: "DP" , img: ""},
    { name: "Patrick Njiru", party: "Independent" , img: ""}
  ],

  "Turkana": [
    { name: "Jeremiah Lomorukai", party: "ODM", status: "winner" , img: ""},
    { name: "John Lodepe", party: "UDA" , img: ""},
    { name: "Ekidor Locholia", party: "Independent" , img: ""}
  ],

  "Baringo": [
    { name: "Benjamin Cheboi", party: "UDA", status: "winner" , img: ""},
    { name: "Stanley Kiptis", party: "Independent" , img: ""},
    { name: "Kipruto Arap Kirui", party: "UDA" , img: ""}
  ],

  "Bomet": [
    { name: "Hillary Barchok", party: "UDA", status: "winner" , img: ""},
    { name: "Isaac Ruto", party: "Chama Cha Mashinani" , img: ""},
    { name: "Kibet Serem", party: "Independent" , img: ""}
  ],

  "Bungoma": [
    { name: "Ken Lusaka", party: "Ford Kenya", status: "winner" , img: ""},
    { name: "Wycliffe Wangamati", party: "DAP-K" , img: ""},
    { name: "Joseph Nyongesa", party: "UDA" , img: ""}
  ],

  "Busia": [
    { name: "Paul Otuoma", party: "ODM", status: "winner" , img: ""},
    { name: "Sospeter Ojaamong", party: "ODM" , img: ""},
    { name: "Amukowa Anangwe", party: "UDA" , img: ""}
  ],

  "Elgeyo Marakwet": [
    { name: "Wisley Rotich", party: "UDA", status: "winner" , img: ""},
    { name: "Alex Tolgos", party: "Independent" , img: ""}
  ],

  "Embu": [
    { name: "Cecily Mbarire", party: "UDA", status: "winner" , img: ""},
    { name: "Martin Wambora", party: "Jubilee" , img: ""},
    { name: "Njagi Kairu", party: "Independent" , img: ""}
  ],

  "Garissa": [
    { name: "Nathif Jama", party: "ODM", status: "winner" , img: ""},
    { name: "Ali Korane", party: "UDA" , img: ""},
    { name: "Abdi Omar", party: "Independent" , img: ""}
  ],

  "Homa Bay": [
    { name: "Gladys Wanga", party: "ODM", status: "winner" , img: ""},
    { name: "Evans Kidero", party: "ODM" , img: ""},
    { name: "Nicholas Konyango", party: "UDA" , img: ""}
  ],

  "Isiolo": [
    { name: "Abdi Ibrahim Guyo", party: "UDA", status: "winner" , img: ""},
    { name: "Mohamed Kuti", party: "Independent" , img: ""}
  ],

  "Kajiado": [
    { name: "Joseph Ole Lenku", party: "ODM", status: "winner" , img: ""},
    { name: "David Nkedianye", party: "Wiper" , img: ""},
    { name: "Katoo Ole Metito", party: "UDA" , img: ""}
  ],

  "Kericho": [
    { name: "Eric Mutai", party: "UDA", status: "winner" , img: ""},
    { name: "Paul Sang", party: "Independent" , img: ""},
    { name: "Hillary Kibet", party: "UDA" , img: ""}
  ],

  "Kilifi": [
    { name: "Gideon Mung'aro", party: "ODM", status: "winner" , img: ""},
    { name: "Amason Kingi", party: "PAA" , img: ""},
    { name: "Boy Juma Boy", party: "Independent" , img: ""}
  ],

  "Kirinyaga": [
    { name: "Anne Waiguru", party: "UDA", status: "winner" , img: ""},
    { name: "James Gichuhi", party: "UDA" , img: ""},
    { name: "Purity Ngirici", party: "Independent" , img: ""}
  ],

  "Kisii": [
    { name: "Simba Arati", party: "ODM", status: "winner" , img: ""},
    { name: "Josephat Nyakweba", party: "UDA" , img: ""},
    { name: "Chris Obure", party: "ODM" , img: ""}
  ],

  "Kitui": [
    { name: "Julius Malombe", party: "Wiper", status: "winner" , img: ""},
    { name: "Charity Ngilu", party: "Narc" , img: ""},
    { name: "Muthama Kimanzi", party: "UDA" , img: ""}
  ],

  "Kwale": [
    { name: "Fatuma Achani", party: "UDA", status: "winner" , img: ""},
    { name: "Salim Mvurya", party: "UDA" , img: ""},
    { name: "Zani Abdalla", party: "ODM" , img: ""}
  ],

  "Laikipia": [
    { name: "Joshua Irungu", party: "UDA", status: "winner" , img: ""},
    { name: "Ndiritu Muriithi", party: "Jubilee" , img: ""}
  ],

  "Lamu": [
    { name: "Issa Timamy", party: "ANC", status: "winner" , img: ""},
    { name: "Fahim Twaha", party: "UDA" , img: ""}
  ],

  "Makueni": [
    { name: "Mutula Kilonzo Jr", party: "Wiper", status: "winner" , img: ""},
    { name: "Kivutha Kibwana", party: "Muungano" , img: ""},
    { name: "Hassan Joho ally candidate", party: "ODM" , img: ""}
  ],

  "Mandera": [
    { name: "Mohamed Adan Khalif", party: "UDA", status: "winner" , img: ""},
    { name: "Ali Roba", party: "UDA" , img: ""}
  ],

  "Marsabit": [
    { name: "Mohamud Mohamed Ali", party: "UDA", status: "winner" , img: ""},
    { name: "Mohamed Kuti", party: "Independent" , img: ""}
  ],

  "Migori": [
    { name: "Ochilo Ayacko", party: "ODM", status: "winner" , img: ""},
    { name: "Okoth Obado", party: "ODM" , img: ""},
    { name: "Isaac Odhiambo", party: "UDA" , img: ""}
  ],

  "Murang'a": [
    { name: "Irungu Kang'ata", party: "UDA", status: "winner" , img: ""},
    { name: "Mwangi wa Iria", party: "Independent" , img: ""}
  ],

  "Nandi": [
    { name: "Stephen Sang", party: "UDA", status: "winner" , img: ""},
    { name: "Henry Kosgey", party: "ODM" , img: ""}
  ],

  "Narok": [
    { name: "Patrick Ole Ntutu", party: "UDA", status: "winner" , img: ""},
    { name: "Samuel Tunai", party: "UDA" , img: ""}
  ],

  "Nyamira": [
    { name: "Amos Nyaribo", party: "UDA", status: "winner" , img: ""},
    { name: "John Nyagarama (political influence)", party: "ODM" , img: ""}
  ],

  "Nyandarua": [
    { name: "Moses Kiarie Badilisha", party: "UDA", status: "winner" , img: ""},
    { name: "Francis Kimemia", party: "Jubilee" , img: ""}
  ],

  "Samburu": [
    { name: "Jonathan Lelelit", party: "UDA", status: "winner" , img: ""},
    { name: "Moses Lenolkulal", party: "Independent" , img: ""}
  ],

  "Siaya": [
    { name: "James Orengo", party: "ODM", status: "winner" , img: ""},
    { name: "William Oduol", party: "ODM" , img: ""}
  ],

  "Taita Taveta": [
    { name: "Andrew Mwadime", party: "ODM", status: "winner" , img: ""},
    { name: "Granton Samboja", party: "Independent" , img: ""}
  ],

  "Tana River": [
    { name: "Dhadho Godhana", party: "ODM", status: "winner" , img: ""},
    { name: "Major Abdullahi", party: "UDA" , img: ""}
  ],

  "Tharaka Nithi": [
    { name: "Muthomi Njuki", party: "UDA", status: "winner" , img: ""},
    { name: "Gichobe Ithuku", party: "Jubilee" , img: ""}
  ],

  "Trans Nzoia": [
    { name: "George Natembeya", party: "DAP-K", status: "winner" , img: ""},
    { name: "Patrick Khaemba", party: "Ford Kenya" , img: ""}
  ],

  "Vihiga": [
    { name: "Wilber Ottichilo", party: "ODM", status: "winner" , img: ""},
    { name: "Dr. Edgar Busiega", party: "UDA" , img: ""}
  ],

  "Wajir": [
    { name: "Ahmed Abdullahi Mohamed", party: "UDA", status: "winner" , img: ""},
    { name: "Mohamed Abdi Mohamud", party: "ODM" , img: ""}
  ],

  "West Pokot": [
    { name: "Simon Kachapin", party: "UDA", status: "winner" , img: ""},
    { name: "John Lonyangapuo", party: "KANU" , img: ""}
  ]

},

  senator: {

  "Uasin Gishu": [
    { name: "Jackson Mandago", party: "UDA", status: "winner", img: "https://tse1.explicit.bing.net/th/id/OIP.FepjycC0DRTR3ivVg9IwiQHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "Robert Arap Kemei", party: "Independent" , img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgbsGscyiD1w31UubBUkflW5UNKujyCeLbqR_dzoVBIcAnnYdKZKd5-2-7SqURVK70aYH11Vq_neDq8-RS7Yg5deUU3l1KWXgtESKck7KLUCu3lbqFbKT3ZBsNtIs85-rOmYXxCfOk5vJr1jnSEhxwlBxwuoiLlnA4WhbXbJ_ZfPqWsyDqmTYwC60Yohak/s16000-rw/500707754_678880444966941_3984998077855616749_n.jpg" },
    { name: "Isaac Ruto ally", party: "Independent" , img: "https://images.hivisasa.com/1200/JALdjKawf7IMG_20200103_094220.jpg" }
  ],

  "Nairobi": [
    { name: "Edwin Sifuna", party: "ODM", status: "winner" , img: "https://tse3.mm.bing.net/th/id/OIP.IcsHqBJVE2GOuvz8rRK-WwAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "Paul Mwangi", party: "UDA" , img: "https://tse1.mm.bing.net/th/id/OIP.hXhB8WaO6eXUE-ys-gWPYwHaJC?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "John Kiarie", party: "UDA" , img: "https://tse1.mm.bing.net/th/id/OIP.1HUJcWwX_NAmk8AtU9eaowHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" }
  ],

  "Mombasa": [
    { name: "Mohamed Faki", party: "ODM", status: "winner" ,},
    { name: "Hamisi Mwaguya", party: "UDA" },
    { name: "Anwar Loitiptip", party: "Independent" },
    { name: "Ali Mwinyi", party: "Independent" }
  ],

  "Kiambu": [
    { name: "Karungo Thang'wa", party: "UDA", status: "winner" },
    { name: "Machel Waikenda", party: "ODM" },
    { name: "John Njuguna", party: "Independent" }
  ],

  "Nakuru": [
    { name: "Tabitha Karanja", party: "UDA", status: "winner" },
    { name: "Samuel Tunoi", party: "Jubilee" },
    { name: "Susan Kihika ally candidate", party: "UDA" }
  ],

  "Kisumu": [
    { name: "Tom Ojienda", party: "ODM", status: "winner" },
    { name: "Fred Outa", party: "ODM" },
    { name: "Peter Anyang', Jr candidate", party: "UDA" }
  ],

  "Kakamega": [
    { name: "Bonny Khalwale", party: "UDA", status: "winner" },
    { name: "Cleophas Malala", party: "UDA" },
    { name: "Brian Lishenga", party: "UDA" }
  ],

  "Machakos": [
    { name: "Agnes Kavindu", party: "Wiper", status: "winner" },
    { name: "Urbanus Ngengele", party: "UDA" },
    { name: "Nicholas Mutua", party: "Independent" }
  ],

  "Meru": [
    { name: "Kathuri Murungi", party: "UDA", status: "winner" },
    { name: "Isaac Mutuma", party: "UDA" },
    { name: "Peter Munya ally candidate", party: "PNU" }
  ],

  "Nyeri": [
    { name: "Wahome Wamatinga", party: "UDA", status: "winner" },
    { name: "James Kanyotu", party: "Jubilee" },
    { name: "Patrick Njuguna", party: "Independent" }
  ],

  "Baringo": [
    { name: "William Cheptumo", party: "UDA", status: "winner" },
    { name: "Gideon Moi", party: "KANU" },
    { name: "Jackson Koskei", party: "Independent" }
  ],

  "Bomet": [
    { name: "Christopher Lang'at", party: "UDA", status: "winner" },
    { name: "Wilfred Lesan", party: "Independent" },
    { name: "Isaac Ruto ally", party: "CCM" }
  ],

  "Bungoma": [
    { name: "David Wakoli", party: "Ford Kenya", status: "winner" },
    { name: "Wafula Wamunyinyi", party: "DAP-K" },
    { name: "John Makali", party: "UDA" }
  ],

  "Busia": [
    { name: "Okiya Omtatah", party: "Independent", status: "winner" },
    { name: "Ababu Namwamba", party: "ODM" },
    { name: "Stephen Manoti", party: "UDA" }
  ],

  "Elgeyo Marakwet": [
    { name: "William Kisang", party: "UDA", status: "winner" },
    { name: "Alois Bett", party: "Independent" },
  ],

  "Embu": [
    { name: "Alexander Mundigi", party: "UDA", status: "winner" },
    { name: "Martin Wambora ally", party: "Jubilee" },
  ],

  "Garissa": [
    { name: "Abdi Hassan", party: "UDA", status: "winner" },
    { name: "Mohamed Abdi", party: "ODM" },
  ],

  "Homa Bay": [
    { name: "Moses Kajwang", party: "ODM", status: "winner" },
    { name: "Fred Rabongo", party: "ODM" },
  ],

  "Isiolo": [
    { name: "Fatuma Dullo", party: "UDA", status: "winner" },
  ],

  "Kajiado": [
    { name: "Samuel Seki", party: "UDA", status: "winner" },
    { name: "Ledama Olekina ally", party: "ODM" },
  ],

"Kericho": [
  { name: "Aaron Cheruiyot", party: "UDA", status: "winner" },
  { name: "Jack Langat", party: "Party X", status: "contested" },
  { name: "Mercy Chebet", party: "Party Y", status: "contested" }
],

  "Kilifi": [
    { name: "Stewart Madzayo", party: "ODM", status: "winner" },
    { name: "candidate 2", party: "ODM" },
    { name: "candidate 3", party: "UDA" }
  ],

  "Kirinyaga": [
    { name: "James Murango", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "UDA" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Kisii": [
    { name: "Richard Onyonka", party: "Ford Kenya", status: "winner" },
    { name: "candidate 2", party: "ODM" },
    { name: "candidate 3", party: "UDA" }
  ],

  "Kitui": [
    { name: "Eunice Malombe", party: "Wiper", status: "winner" },
    { name: "candidate 2", party: "ODM" },
    { name: "candidate 3", party: "UDA" }
  ],

  "Kwale": [
    { name: "Issa Juma Boy", party: "ODM", status: "winner" },
    { name: "candidate 2", party: "UDA" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Laikipia": [
    { name: "John Kinyua", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "Jubilee" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Lamu": [
    { name: "Joseph Githuku", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "ODM" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Makueni": [
    { name: "Daniel Maanzo", party: "Wiper", status: "winner" },
    { name: "candidate 2", party: "ODM" },
    { name: "candidate 3", party: "UDA" }
  ],

  "Mandera": [
    { name: "Ali Roba", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "ODM" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Marsabit": [
    { name: "Mohamed Chute", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "Independent" },
    { name: "candidate 3", party: "ODM" }
  ],

  "Migori": [
    { name: "Okong'o Omogeni", party: "ODM", status: "winner" },
    { name: "candidate 2", party: "UDA" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Murang'a": [
    { name: "Joe Nyutu", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "Jubilee" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Nandi": [
    { name: "Samuell Phoghis", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "ODM" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Narok": [
    { name: "Ledama Olekina", party: "ODM", status: "winner" },
    { name: "candidate 2", party: "UDA" },
    { name: "candidate 3", party: "KANU" }
  ],

  "Nyamira": [
    { name: "Okong'o Mogeni", party: "ODM", status: "winner" },
    { name: "candidate 2", party: "UDA" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Nyandarua": [
    { name: "John Methu", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "Jubilee" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Samburu": [
    { name: "Steve Lelegwe", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "Independent" },
    { name: "candidate 3", party: "KANU" }
  ],

  "Siaya": [
    { name: "James Orengo influence", party: "ODM", status: "winner" },
    { name: "candidate 2", party: "UDA" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Taita Taveta": [
    { name: "Jones Mwaruma", party: "ODM", status: "winner" },
    { name: "candidate 2", party: "UDA" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Tana River": [
    { name: "Danson Mungatana", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "ODM" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Tharaka Nithi": [
    { name: "Kithure Kindiki", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "Jubilee" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Trans Nzoia": [
    { name: "Allan Chesang", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "DAP-K" },
    { name: "candidate 3", party: "Ford Kenya" }
  ],

  "Turkana": [
    { name: "James Lomenen", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "ODM" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Vihiga": [
    { name: "Godfrey Osotsi", party: "ODM", status: "winner" },
    { name: "candidate 2", party: "UDA" },
    { name: "candidate 3", party: "Independent" }
  ],

  "Wajir": [
    { name: "Abdullahi Sheikh", party: "UDA", status: "winner" },
    { name: "candidate 2", party: "ODM" },
    { name: "candidate 3", party: "Independent" }
  ],

  "West Pokot": [
    { name: "William Kamket", party: "KANU", status: "winner" },
    { name: "candidate 2", party: "UDA" },
    { name: "candidate 3", party: "Independent" }
  ]

},

  mp: {

  "Nairobi": [
    { name: "Babu Owino", party: "ODM", region: "Embakasi East" , img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhGqNmo3u9hbsLTQ7GyfWDNcBe3PI3EfO3d5jS49DuauRpV0zPnyYBP1eDX_9OdNYkfBHeUegaGzNF5Bs1OOQmvviaXUQkWIpCuMJSiaRGpKYsyiDOhPOPBKo2YwAaAnrENnYJLQg1vG6hw997TirkOHG8z1zQL_CyNKZn9bd0zwMO-ahOQZAiKi1qAki4/s3840/1002216518.jpg" },
    { name: "Ronald Karauri", party: "Independent", region: "Kasarani" , img: "https://tse3.mm.bing.net/th/id/OIP.VQZlNYxHH56i_OhDjfPgBwHaJQ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" }
  ],

  "Mombasa": [
    { name: "Omar Mwinyi", party: "ODM", region: "Changamwe" , img: "https://tse3.mm.bing.net/th/id/OIP.X4hww9HufnU0_1cW6AnIrAHaET?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "Rashid Bedzimba Juma", party: "ODM", region: "Kisauni" , img: "https://tse2.mm.bing.net/th/id/OIP.4TIvdeWrWjQosjfsOW04DwHaHk?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" }
  ],

  "Kiambu": [
    { name: "George Koimburi", party: "UDA", region: "Juja" },
    { name: "Mary Wamaua", party: "UDA", region: "Maragua" },
    { name: "Peter Gitau", party: "Jubilee", region: "Ruiru" }
  ],

  "Nakuru": [
    { name: "Samuel Arama", party: "UDA", region: "Nakuru Town West" },
    { name: "David Gikaria", party: "UDA", region: "Nakuru East" },
    { name: "Irene Njoki", party: "Jubilee", region: "Bahati" }
  ],

  "Uasin Gishu": [
    { name: "Oscar Sudi", party: "UDA", region: "Kapseret" },
    { name: "Gladys Boss Shollei", party: "UDA", region: "Tarbela" },
    { name: "Kesses MP", party: "UDA", region: "Kesses" }
  ],

  "Kisumu": [
    { name: "Shakeel Shabbir", party: "Independent", region: "Kisumu East" },
    { name: "Rozaah Buyu", party: "ODM", region: "Kisumu West" },
    { name: "Peter Anyang' Nyong'o ally", party: "ODM", region: "Kisumu Central" }
  ],

  "Kakamega": [
    { name: "Tindi Mwale", party: "ODM", region: "Butere" },
    { name: "Didmus Barasa", party: "UDA", region: "Kimilili" },
    { name: "Fernandes Barasa ally", party: "ODM", region: "Shinyalu" }
  ],

  "Machakos": [
    { name: "Robert Mbui", party: "Wiper", region: "Kathiani" },
    { name: "Victor Munyaka", party: "UDA", region: "Machakos Town" },
    { name: "Caleb Mule", party: "MCCP", region: "Mwala" }
  ],

  "Meru": [
    { name: "John Mwirigi", party: "UDA", region: "Igembe South" },
    { name: "Rahim Dawood", party: "Independent", region: "Imenti North" },
    { name: "Moses Kirima", party: "UDA", region: "Central Imenti" }
  ],

  "Nyeri": [
    { name: "John Kaguchia", party: "UDA", region: "Mukurweini" },
    { name: "Wambugu Ngunjiri", party: "UDA", region: "Nyeri Town" },
    { name: "Patrick Munene", party: "UDA", region: "Othaya" }
  ],

"Baringo": [
  { name: "William Kamket", party: "KANU", region: "Tiaty" },
  { name: "Joshua Kandie", party: "UDA", region: "Baringo Central" }
],

"Bomet": [
  { name: "Nelson Koech", party: "UDA", region: "Belgut" },
  { name: "Beatrice Kemei", party: "UDA", region: "Kericho Women Rep ally zone" }
],

"Bungoma": [
  { name: "John Waluke", party: "Ford Kenya", region: "Sirisia" },
  { name: "Didmus Barasa", party: "UDA", region: "Kimilili" },
  { name: "Wafula Wamunyinyi", party: "DAP-K", region: "Kanduyi" }
],

"Busia": [
  { name: "Raphael Wanjala", party: "ODM", region: "Budalangi" },
  { name: "Oundo Mudenyo", party: "ODM", region: "Funyula" }
],

"Elgeyo Marakwet": [
  { name: "Gideon Kimaiyo", party: "UDA", region: "Keiyo South" },
  { name: "Timothy Toroitich", party: "UDA", region: "Marakwet West" }
],

"Embu": [
  { name: "Gitonga Mukunji", party: "UDA", region: "Manyatta" },
  { name: "Eric Muchangi", party: "UDA", region: "Runyenjes" }
],

"Garissa": [
  { name: "Aden Duale", party: "UDA", region: "Garissa Township" },
  { name: "Mohamed Dekow", party: "ODM", region: "Garissa County" }
],

"Homa Bay": [
  { name: "Peter Kaluma", party: "ODM", region: "Homa Bay Town" },
  { name: "Millie Odhiambo", party: "ODM", region: "Suba North" }
],

"Isiolo": [
  { name: "Joseph Samal", party: "UDA", region: "Isiolo North" },
  { name: "Abdi Koropu", party: "Independent", region: "Isiolo South" }
],

"Kajiado": [
  { name: "Katoo Ole Metito", party: "ODM", region: "Kajiado South" },
  { name: "George Sunkuyia", party: "UDA", region: "Kajiado West" }
],

"Kericho": [
  { name: "Beatrice Kemei", party: "UDA", region: "Kericho Women Rep" },
  { name: "Nelson Koech", party: "UDA", region: "Belgut" }
],

"Kilifi": [
  { name: "Owen Baya", party: "UDA", region: "Kilifi North" },
  { name: "Aisha Jumwa", party: "UDA", region: "Malindi" }
],

"Kirinyaga": [
  { name: "Jane Njeri Maina", party: "UDA", region: "Kirinyaga Women Rep" },
  { name: "George Kariuki", party: "UDA", region: "Ndia" }
],

"Kisii": [
  { name: "Sylvanus Osoro", party: "UDA", region: "South Mugirango" },
  { name: "Richard Onyonka ally MP", party: "Ford Kenya", region: "Kisii County" }
],

"Kitui": [
  { name: "Makali Mulu", party: "Wiper", region: "Kitui Central" },
  { name: "Edith Nyenze", party: "Wiper", region: "Kitui West" }
],

"Kwale": [
  { name: "Issa Boy Juma", party: "ODM", region: "Matuga" },
  { name: "Kassim Tandaza", party: "ODM", region: "Matuga" }
],

"Laikipia": [
  { name: "Jane Kagiri", party: "UDA", region: "Laikipia Women Rep" },
  { name: "Mwangi Kiunjuri", party: "TSP", region: "Laikipia East" }
],

"Lamu": [
  { name: "Ruweida Obo", party: "PAA", region: "Lamu Women Rep" },
  { name: "Stanley Muthama", party: "UDA", region: "Lamu West" }
],

"Makueni": [
  { name: "Daniel Maanzo", party: "Wiper", region: "Makueni" },
  { name: "Rose Museo", party: "Wiper", region: "Makueni Women Rep" }
],

"Mandera": [
  { name: "Adan Haji Ali", party: "JP", region: "Mandera West" },
  { name: "Ali Roba ally MP", party: "UDA", region: "Mandera East" }
],

"Marsabit": [
  { name: "Naomi Waqo", party: "UDA", region: "Marsabit Women Rep" },
  { name: "Qalicha Wario", party: "Independent", region: "Marsabit North" }
],

"Migori": [
  { name: "Tom Odege", party: "ODM", region: "Nyatike" },
  { name: "Fatuma Mohamed", party: "ODM", region: "Migori Women Rep" }
],

"Murang'a": [
  { name: "Ndindi Nyoro", party: "UDA", region: "Kiharu" },
  { name: "Sabina Chege", party: "Jubilee", region: "Murang'a Women Rep" }
],

"Nandi": [
  { name: "Bernard Kitur", party: "UDA", region: "Nandi Hills" },
  { name: "Cynthia Muge", party: "UDA", region: "Nandi Women Rep" }
],

"Narok": [
  { name: "Johanna Ng’eno", party: "UDA", region: "Emurua Dikirr" },
  { name: "Rebecca Tonkei", party: "UDA", region: "Narok Women Rep" }
],

"Nyamira": [
  { name: "Jerusha Momanyi", party: "UDA", region: "Nyamira Women Rep" },
  { name: "Stephen Mogaka", party: "ODM", region: "West Mugirango" }
],

"Nyandarua": [
  { name: "Faith Gitau", party: "UDA", region: "Nyandarua Women Rep" },
  { name: "George Gachagua", party: "UDA", region: "Ndaragwa" }
],

"Samburu": [
  { name: "Naisula Lesuuda", party: "KANU", region: "Samburu West" },
  { name: "Pauline Lenguris", party: "UDA", region: "Samburu Women Rep" }
],

"Siaya": [
  { name: "James Orengo ally MP", party: "ODM", region: "Siaya" },
  { name: "Christine Ombaka", party: "ODM", region: "Siaya Women Rep" }
],

"Taita Taveta": [
  { name: "Danson Mwashako", party: "Wiper", region: "Wundanyi" },
  { name: "Lydia Haika", party: "ODM", region: "Taita Taveta Women Rep" }
],

"Tana River": [
  { name: "Ali Wario", party: "ODM", region: "Garsen" },
  { name: "Rehema Hassan", party: "UDA", region: "Tana River Women Rep" }
],

"Tharaka Nithi": [
  { name: "Patrick Munene", party: "UDA", region: "Chuka/Igambang’ombe" },
  { name: "Susan Ngugi", party: "UDA", region: "Women Rep" }
],

"Trans Nzoia": [
  { name: "Ferdinand Wanyonyi", party: "FORD-K", region: "Kwanza" },
  { name: "Lilian Siyoi", party: "UDA", region: "Women Rep" }
],

"Turkana": [
  { name: "John Lodepe", party: "ODM", region: "Turkana Central" },
  { name: "Cecilia Ngitit", party: "ODM", region: "Turkana Women Rep" }
],

"Vihiga": [
  { name: "Ernest Kagesi", party: "ANC", region: "Vihiga" },
  { name: "Beatrice Adagala", party: "ANC", region: "Vihiga Women Rep" }
],

"Wajir": [
  { name: "Fatuma Abdi Jehow", party: "ODM", region: "Wajir Women Rep" },
  { name: "Ahmed Kolosh", party: "UDA", region: "Wajir West" }
],

"West Pokot": [
  { name: "Rael Aleutum", party: "UDA", region: "Women Rep" },
  { name: "Samuel Moroto", party: "KUP", region: "Kapenguria" }
]
},

  womenrep: {

  "Nairobi": [
    { name: "Esther Passaris", party: "ODM", region: "Nairobi" , img: "https://worldjusticeproject.org/sites/default/files/styles/max_740_width/public/images/bio/2022/esther-Photo.jpg?itok=SIFTbFBR" },
    { name: "Millicent Omanga", party: "UDA", region: "Nairobi" , img: "https://tse1.mm.bing.net/th/id/OIP.cPdaFxkILtJxAYmQfFyMWwHaE6?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" }
  ],

  "Mombasa": [
    { name: "Zamzam Mohammed", party: "ODM", region: "Mombasa" , img: "https://cdn.tuko.co.ke/images/1120/68c734d3f5b57702.jpeg?v=1" },
    { name: "Asha Hussein", party: "UDA", region: "Mombasa" , img: "https://cdn.standardmedia.co.ke/images/tuesday/kfeips6whcnq5b1f6bc9c3558.jpg" }
  ],

  "Kiambu": [
    { name: "Ann Wamuratha", party: "UDA", region: "Kiambu" },
    { name: "Gathoni Wamuchomba", party: "UDA", region: "Kiambu" }
  ],

  "Nakuru": [
    { name: "Liza Chelule", party: "UDA", region: "Nakuru" },
    { name: "Susan Kihika ally", party: "UDA", region: "Nakuru" }
  ],

  "Uasin Gishu": [
    { name: "Gladys Shollei", party: "UDA", region: "Uasin Gishu" },
    { name: "Zipporah Kering", party: "ODM", region: "Uasin Gishu" }
  ],

  "Kisumu": [
    { name: "Ruth Odinga", party: "ODM", region: "Kisumu" },
    { name: "Ruth Odinga challenger", party: "UDA", region: "Kisumu" }
  ],

  "Kakamega": [
    { name: "Elsie Muhanda", party: "ODM", region: "Kakamega" },
    { name: "Naomi Shiyonga", party: "Independent", region: "Kakamega" }
  ],

  "Machakos": [
    { name: "Joyce Kamene", party: "UDA", region: "Machakos" },
    { name: "Wavinya Ndeti ally", party: "Wiper", region: "Machakos" }
  ],

  "Meru": [
    { name: "Elizabeth Karambu", party: "UDA", region: "Meru" },
    { name: "Kawira Mwangaza ally", party: "Independent", region: "Meru" }
  ],

  "Nyeri": [
    { name: "Rahab Mukami", party: "UDA", region: "Nyeri" },
    { name: "Ann Njoroge", party: "Jubilee", region: "Nyeri" }
  ],

  "Baringo": [
    { name: "Florence Jematia", party: "UDA", region: "Baringo" },
    { name: "Grace Cheserek", party: "KANU", region: "Baringo" }
  ],

  "Bomet": [
    { name: "Linah Jebii Kilimo", party: "UDA", region: "Bomet" },
    { name: "Beatrice Kones", party: "Independent", region: "Bomet" }
  ],

  "Bungoma": [
    { name: "Catherine Wambilianga", party: "Ford Kenya", region: "Bungoma" },
    { name: "Jackline Makokha", party: "UDA", region: "Bungoma" }
  ],

  "Busia": [
    { name: "Catherine Omanyo", party: "ODM", region: "Busia" },
    { name: "Florence Mutua", party: "UDA", region: "Busia" }
  ],

  "Elgeyo Marakwet": [
    { name: "Caroline Ng’elechei", party: "UDA", region: "Elgeyo Marakwet" },
    { name: "Hellen Sambu", party: "Independent", region: "Elgeyo Marakwet" }
  ],

  "Embu": [
    { name: "Pamela Njoki", party: "UDA", region: "Embu" },
    { name: "Cecily Mbarire ally", party: "UDA", region: "Embu" }
  ],

  "Garissa": [
    { name: "Amina Udgoon", party: "UDA", region: "Garissa" },
    { name: "Hodan Mohamed", party: "ODM", region: "Garissa" }
  ],

  "Homa Bay": [
    { name: "Gladys Wanga", party: "ODM", region: "Homa Bay" },
    { name: "Anne Ouko", party: "UDA", region: "Homa Bay" }
  ],

  "Isiolo": [
    { name: "Rehema Jaldesa", party: "UDA", region: "Isiolo" },
    { name: "Fatuma Dida", party: "Independent", region: "Isiolo" }
  ],

  "Kajiado": [
    { name: "Janet Marania", party: "UDA", region: "Kajiado" },
    { name: "Janet Teyiaa", party: "ODM", region: "Kajiado" }
  ],

  "Kericho": [
    { name: "Beatrice Kemei", party: "UDA", region: "Kericho" },
    { name: "Lucy Chebet", party: "ODM", region: "Kericho" }
  ],

  "Kilifi": [
    { name: "Gertrude Mbeyu", party: "ODM", region: "Kilifi" },
    { name: "Aisha Jumwa ally", party: "UDA", region: "Kilifi" }
  ],

  "Kirinyaga": [
    { name: "Jane Njeri Maina", party: "UDA", region: "Kirinyaga" },
    { name: "Purity Ngirici", party: "Independent", region: "Kirinyaga" }
  ],

  "Kisii": [
    { name: "Doris Donya", party: "UDA", region: "Kisii" },
    { name: "Janet Ong'era", party: "ODM", region: "Kisii" }
  ],

  "Kitui": [
    { name: "Irene Kasalu", party: "Wiper", region: "Kitui" },
    { name: "Charity Ngilu ally", party: "Wiper", region: "Kitui" }
  ],

  "Kwale": [
    { name: "Fatuma Masito", party: "ODM", region: "Kwale" },
    { name: "Zuleikha Hassan", party: "UDA", region: "Kwale" }
  ],

  "Laikipia": [
    { name: "Jane Kagiri", party: "UDA", region: "Laikipia" },
    { name: "Cate Waruguru", party: "UDA", region: "Laikipia" }
  ],

  "Lamu": [
    { name: "Ruweida Obo", party: "PAA", region: "Lamu" },
    { name: "Fatuma Twaha", party: "ODM", region: "Lamu" }
  ],

  "Makueni": [
    { name: "Rose Museo", party: "Wiper", region: "Makueni" },
    { name: "Susan Kiamba", party: "UDA", region: "Makueni" }
  ],

  "Mandera": [
    { name: "Ummul Kheir Kassim", party: "UDA", region: "Mandera" },
    { name: "Fathia Abdullahi", party: "ODM", region: "Mandera" }
  ],

  "Marsabit": [
    { name: "Naomi Waqo", party: "UDA", region: "Marsabit" },
    { name: "Fatuma Ali", party: "ODM", region: "Marsabit" }
  ],

  "Migori": [
    { name: "Fatuma Mohamed", party: "ODM", region: "Migori" },
    { name: "Mary Akinyi", party: "UDA", region: "Migori" }
  ],

  "Murang'a": [
    { name: "Betty Maina", party: "UDA", region: "Murang'a" },
    { name: "Sabina Chege", party: "Jubilee", region: "Murang'a" }
  ],

  "Nandi": [
    { name: "Cynthia Muge", party: "UDA", region: "Nandi" },
    { name: "Tecla Chebet", party: "Independent", region: "Nandi" }
  ],

  "Narok": [
    { name: "Rebecca Tonkei", party: "UDA", region: "Narok" },
    { name: "Soipan Tuya ally", party: "UDA", region: "Narok" }
  ],

  "Nyamira": [
    { name: "Jerusha Momanyi", party: "UDA", region: "Nyamira" },
    { name: "Alice Chae", party: "ODM", region: "Nyamira" }
  ],

  "Nyandarua": [
    { name: "Faith Gitau", party: "UDA", region: "Nyandarua" },
    { name: "Jane Wanjiku", party: "Jubilee", region: "Nyandarua" }
  ],

  "Samburu": [
    { name: "Pauline Lenguris", party: "UDA", region: "Samburu" },
    { name: "Naisula Lesuuda", party: "KANU", region: "Samburu" }
  ],

  "Siaya": [
    { name: "Christine Ombaka", party: "ODM", region: "Siaya" },
    { name: "Caroline Oduol", party: "UDA", region: "Siaya" }
  ],

  "Taita Taveta": [
    { name: "Lydia Haika", party: "ODM", region: "Taita Taveta" },
    { name: "Joyce Lay", party: "UDA", region: "Taita Taveta" }
  ],

  "Tana River": [
    { name: "Rehema Hassan", party: "UDA", region: "Tana River" },
    { name: "Fatuma Ali", party: "ODM", region: "Tana River" }
  ],

  "Tharaka Nithi": [
    { name: "Susan Ngugi", party: "UDA", region: "Tharaka Nithi" },
    { name: "Beatrice Nkatha", party: "Jubilee", region: "Tharaka Nithi" }
  ],

  "Trans Nzoia": [
    { name: "Lilian Siyoi", party: "UDA", region: "Trans Nzoia" },
    { name: "Janet Nangabo", party: "FORD-K", region: "Trans Nzoia" }
  ],

  "Turkana": [
    { name: "Cecilia Ngitit", party: "ODM", region: "Turkana" },
    { name: "Joyce Emanikor", party: "UDA", region: "Turkana" }
  ],

  "Vihiga": [
    { name: "Beatrice Adagala", party: "ANC", region: "Vihiga" },
    { name: "Dorcas Kedogo", party: "ODM", region: "Vihiga" }
  ],

  "Wajir": [
    { name: "Fatuma Abdi Jehow", party: "ODM", region: "Wajir" },
    { name: "Halima Sheikh", party: "UDA", region: "Wajir" }
  ],

  "West Pokot": [
    { name: "Rael Aleutum", party: "UDA", region: "West Pokot" },
    { name: "Hellen Kapel", party: "KANU", region: "West Pokot" }
  ]

},

mca: {

  "Uasin Gishu": [
    { "name": "David Kiptoo Tarus", "party": "UDA", "region": "Kapkures", "img": "https://tse2.mm.bing.net/th/id/OIP.CHWE0m4WNlxaNoa_3WucQgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { "name": "Isaac Kirwa Kemboi", "party": "Independent", "region": "Kapsoya", "img": "https://tse2.mm.bing.net/th/id/OIP.CHWE0m4WNlxaNoa_3WucQgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { "name": "Jonathan Ng'etich", "party": "UDA", "region": "Kaptagat", "img": "https://tse2.mm.bing.net/th/id/OIP.CHWE0m4WNlxaNoa_3WucQgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" }
  ],

  "Nairobi": [
    { "name": "Mark Mugambi", "party": "UDA", "region": "Umoja I", "img": "https://tse2.mm.bing.net/th/id/OIP.CHWE0m4WNlxaNoa_3WucQgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { "name": "Robert Mbatia", "party": "ODM", "region": "Kariobangi South", "img": "https://tse2.mm.bing.net/th/id/OIP.CHWE0m4WNlxaNoa_3WucQgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { "name": "Moses Nyarangesi Ogeto", "party": "ODM", "region": "Kilimani", "img": "https://tse2.mm.bing.net/th/id/OIP.CHWE0m4WNlxaNoa_3WucQgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" }
  ],

  "Mombasa": [
    { "name": "Fadhili Makarani", "party": "ODM", "region": "Port Reitz", "img": "images/default.jpg" },
    { "name": "Leila Nyache", "party": "ODM", "region": "Kipevu", "img": "images/default.jpg" },
    { "name": "Twahir Mwachilo", "party": "ODM", "region": "Miritini", "img": "images/default.jpg" }
  ],

  "Kiambu": [
    { "name": "Godfrey Karuri", "party": "UDA", "region": "Township", "img": "images/default.jpg" },
    { "name": "Peter Mburu", "party": "UDA", "region": "Kiambaa", "img": "images/default.jpg" },
    { "name": "John Njenga", "party": "Independent", "region": "Ruiru", "img": "images/default.jpg" }
  ],

  "Nakuru": [
    { "name": "Bernard Langat", "party": "UDA", "region": "Mariashoni", "img": "images/default.jpg" },
    { "name": "Njuguna Mwaura", "party": "Independent", "region": "Elburgon", "img": "images/default.jpg" },
    { "name": "Peter Cheruiyot", "party": "UDA", "region": "Biashara", "img": "images/default.jpg" }
  ],

  "Kisumu": [
    { "name": "Benson Ambuti", "party": "ODM", "region": "Kajulu", "img": "images/default.jpg" },
    { "name": "Reuben Okoth", "party": "ODM", "region": "Kolwa East", "img": "images/default.jpg" },
    { "name": "Calvince Osewe", "party": "ODM", "region": "Market Milimani", "img": "images/default.jpg" }
  ],

  "Kakamega": [
    { "name": "Charles Ogachi", "party": "UDP", "region": "Mautuma", "img": "images/default.jpg" },
    { "name": "Grey Moi", "party": "UDP", "region": "Lugari", "img": "images/default.jpg" },
    { "name": "David Ndakwa", "party": "ODM", "region": "Shinyalu", "img": "images/default.jpg" }
  ],

  "Machakos": [
    { "name": "Dominic Maitha", "party": "WDM", "region": "Muthwani", "img": "images/default.jpg" },
    { "name": "Francis Kavyu", "party": "UDA", "region": "Kinanie", "img": "images/default.jpg" },
    { "name": "Paul Musembi", "party": "WDM", "region": "Mutituni", "img": "images/default.jpg" }
  ],

  "Meru": [
    { "name": "Caleb Mutethia", "party": "UDA", "region": "Municipality", "img": "images/default.jpg" },
    { "name": "Aurelio Murangiri", "party": "PNU", "region": "Tigania East", "img": "images/default.jpg" },
    { "name": "David Karithi", "party": "Independent", "region": "Igembe Central", "img": "images/default.jpg" }
  ],

  "Nyeri": [
    { "name": "Peter Kinyua", "party": "UDA", "region": "Rware", "img": "images/default.jpg" },
    { "name": "James Githinji", "party": "UDA", "region": "Kamakwa", "img": "images/default.jpg" },
    { "name": "David Mwangi", "party": "Independent", "region": "Chinga", "img": "images/default.jpg" }
  ],

    "Baringo": [
    { name: "Joseph Makilap", party: "UDA", ward: "Marigat", img: "images/default.jpg" },
    { name: "Charles Kiptoo", party: "KANU", ward: "Kabarnet", img: "images/default.jpg" }
  ],

  "Bomet": [
    { name: "Sammy Kirui", party: "UDA", ward: "Chepalungu", img: "images/default.jpg" },
    { name: "Benard Mutai", party: "Independent", ward: "Sotik", img: "images/default.jpg" },
    { name: "David Rotich", party: "UDA", ward: "Konoin", img: "images/default.jpg" }
  ],

  "Bungoma": [
    { name: "John Waluke", party: "FORD-K", ward: "Sirisia", img: "images/default.jpg" },
    { name: "Moses Wetangula ally", party: "FORD-K", ward: "Kanduyi", img: "images/default.jpg" }
  ],

  "Busia": [
    { name: "Geoffrey Ochieng", party: "ODM", ward: "Matayos", img: "images/default.jpg" },
    { name: "Peter Odoyo", party: "Independent", ward: "Nambale", img: "images/default.jpg" },
    { name: "Kevin Omondi", party: "ODM", ward: "Butula", img: "images/default.jpg" }
  ],

  "Embu": [
    { name: "Peter Muriuki", party: "UDA", ward: "Manyatta", img: "images/default.jpg" },
    { name: "Joseph Mwangi", party: "Jubilee", ward: "Runyenjes", img: "images/default.jpg" }
  ],

  "Garissa": [
    { name: "Abdi Ali", party: "UDA", ward: "Garissa Township", img: "images/default.jpg" },
    { name: "Mohamed Duale", party: "ODM", ward: "Ijara", img: "images/default.jpg" }
  ],

  "Kajiado": [
    { name: "Samuel Seki ally", party: "UDA", ward: "Kajiado Central", img: "images/default.jpg" },
    { name: "David Ole Nkedianye", party: "ODM", ward: "Kajiado West", img: "images/default.jpg" },
    { name: "Joseph Ole Lenku ally", party: "UDA", ward: "Kajiado North", img: "images/default.jpg" }
  ],

  "Kilifi": [
    { name: "Anthony Nzaka", party: "ODM", ward: "Malindi Town", img: "images/default.jpg" },
    { name: "Peter Mwarogo", party: "UDA", ward: "Kaloleni", img: "images/default.jpg" }
  ],

  "Mandera": [
    { name: "Ali Maalim", party: "UDA", ward: "Mandera East", img: "images/default.jpg" },
    { name: "Mohamed Noor", party: "ODM", ward: "Mandera South", img: "images/default.jpg" }
  ],

  "Narok": [
    { name: "Ole Sankok ally", party: "UDA", ward: "Narok Town", img: "images/default.jpg" },
    { name: "David Ole Kenta", party: "ODM", ward: "Narok East", img: "images/default.jpg" },
    { name: "Joseph Ole Parkishon", party: "Independent", ward: "Narok West", img: "images/default.jpg" }
  ],

  "Elgeyo Marakwet": [
    { name: "Alois Bett", party: "UDA", ward: "Keiyo North", img: "images/default.jpg" },
    { name: "William Kisang", party: "UDA", ward: "Marakwet West", img: "images/default.jpg" }
  ],

  "Homa Bay": [
    { name: "Peter Kaluma ally", party: "ODM", ward: "Homa Bay Town", img: "images/default.jpg" },
    { name: "Joseph Oyugi", party: "ODM", ward: "Rangwe", img: "images/default.jpg" },
    { name: "Brian Otieno", party: "UDA", ward: "Suba North", img: "images/default.jpg" }
  ],

  "Isiolo": [
    { name: "Fatuma Dida", party: "ODM", ward: "Isiolo North", img: "images/default.jpg" },
    { name: "Abdi Hassan", party: "UDA", ward: "Isiolo South", img: "images/default.jpg" }
  ],

  "Kericho": [
    { name: "Aaron Cheruiyot ally", party: "UDA", ward: "Sigowet", img: "images/default.jpg" },
    { name: "David Langat", party: "UDA", ward: "Bureti", img: "images/default.jpg" },
    { name: "Peter Kipyego", party: "Independent", ward: "Ainamoi", img: "images/default.jpg" }
  ],

  "Kirinyaga": [
    { name: "Purity Ngirici ally", party: "Independent", ward: "Kirinyaga Central", img: "images/default.jpg" },
    { name: "James Kamau", party: "UDA", ward: "Mwea", img: "images/default.jpg" }
  ],

  "Kitui": [
    { name: "Charity Ngilu ally", party: "Wiper", ward: "Kitui Central", img: "images/default.jpg" },
    { name: "Eunice Kasaini", party: "Wiper", ward: "Mwingi West", img: "images/default.jpg" },
    { name: "Peter Mutua", party: "UDA", ward: "Kitui East", img: "images/default.jpg" }
  ],

  "Kwale": [
    { name: "Zuleikha Hassan ally", party: "ODM", ward: "Matuga", img: "images/default.jpg" },
    { name: "Abdallah Mwinyi", party: "UDA", ward: "Msambweni", img: "images/default.jpg" }
  ],

  "Laikipia": [
    { name: "Cate Waruguru ally", party: "UDA", ward: "Laikipia West", img: "images/default.jpg" },
    { name: "Peter Mwangi", party: "Jubilee", ward: "Laikipia East", img: "images/default.jpg" },
    { name: "Samuel Kinyua", party: "Independent", ward: "Laikipia North", img: "images/default.jpg" }
  ],

  "Lamu": [
    { name: "Fatuma Twaha", party: "ODM", ward: "Lamu East", img: "images/default.jpg" },
    { name: "Abdalla Omar", party: "UDA", ward: "Lamu West", img: "images/default.jpg" }
  ],

  "Machakos": [
    { name: "Francis Kavyu ally", party: "UDA", ward: "Kathiani", img: "images/default.jpg" },
    { name: "Dominic Maitha", party: "WDM", ward: "Machakos Town", img: "images/default.jpg" },
    { name: "Paul Musembi", party: "WDM", ward: "Masinga", img: "images/default.jpg" }
  ],

    "Taita Taveta": [
    { name: "Jones Mwaruma", party: "ODM", region: "Wundanyi", img: "images/default.jpg" },
    { name: "Mary Njoroge", party: "UDA", region: "Mwatate", img: "images/default.jpg" }
  ],

  "Tana River": [
    { name: "Danson Mungatana", party: "UDA", region: "Garsen", img: "images/default.jpg" },
    { name: "Abdullahi Omar", party: "ODM", region: "Galole", img: "images/default.jpg" }
  ],

  "Tharaka Nithi": [
    { name: "Kithure Kindiki ally", party: "UDA", region: "Chuka", img: "images/default.jpg" },
    { name: "Peter Munya ally", party: "Jubilee", region: "Igambang'ombe", img: "images/default.jpg" }
  ],

  "Turkana": [
    { name: "James Lomenen", party: "UDA", region: "Turkana Central", img: "images/default.jpg" },
    { name: "Lochore Lokiru", party: "ODM", region: "Turkana South", img: "images/default.jpg" }
  ],

  "Vihiga": [
    { name: "Godfrey Osotsi", party: "ODM", region: "Sabatia", img: "images/default.jpg" },
    { name: "Beatrice Adagala", party: "ANC", region: "Emuhaya", img: "images/default.jpg" }
  ],

  "Wajir": [
    { name: "Abdullahi Sheikh", party: "UDA", region: "Wajir East", img: "images/default.jpg" },
    { name: "Mohamed Abdi", party: "ODM", region: "Wajir South", img: "images/default.jpg" }
  ],

  "West Pokot": [
    { name: "William Kamket", party: "KANU", region: "Kapenguria", img: "images/default.jpg" },
    { name: "Peter Lochakapong", party: "UDA", region: "Sigor", img: "images/default.jpg" }
  ],

  "Samburu": [
    { name: "Steve Lelegwe", party: "UDA", region: "Samburu East", img: "images/default.jpg" },
    { name: "Pauline Lenguris", party: "UDA", region: "Samburu West", img: "images/default.jpg" }
  ],

  "Isiolo": [
    { name: "Fatuma Dullo", party: "UDA", region: "Isiolo North", img: "images/default.jpg" },
    { name: "Abdi Hassan", party: "ODM", region: "Isiolo South", img: "images/default.jpg" }
  ],

  "Marsabit": [
    { name: "Mohamed Chute", party: "UDA", region: "North Horr", img: "images/default.jpg" },
    { name: "Naomi Waqo", party: "UDA", region: "Laisamis", img: "images/default.jpg" }
  ],

    "Makueni": [
    { name: "Daniel Maanzo", party: "Wiper", region: "Makueni Central", img: "images/default.jpg" },
    { name: "Rose Mutiso", party: "Wiper", region: "Kaiti", img: "images/default.jpg" },
    { name: "Peter Nzioka", party: "UDA", region: "Mbooni", img: "images/default.jpg" }
  ],

  "Migori": [
    { name: "John Kobado", party: "ODM", region: "Suna East", img: "images/default.jpg" },
    { name: "Mark Nyamita", party: "ODM", region: "Awendo", img: "images/default.jpg" },
    { name: "Peter Ochilo", party: "Independent", region: "Rongo", img: "images/default.jpg" }
  ],

  "Murang'a": [
    { name: "Irungu Kang'ata ally", party: "UDA", region: "Kangema", img: "images/default.jpg" },
    { name: "Peter Mwangi", party: "UDA", region: "Kiharu", img: "images/default.jpg" },
    { name: "John Wainaina", party: "Independent", region: "Mathioya", img: "images/default.jpg" }
  ],

  "Nandi": [
    { name: "Alfred Keter ally", party: "UDA", region: "Tinderet", img: "images/default.jpg" },
    { name: "David Kiplagat", party: "UDA", region: "Chesumei", img: "images/default.jpg" },
    { name: "Samuel Langat", party: "Independent", region: "Aldai", img: "images/default.jpg" }
  ],

  "Nyamira": [
    { name: "Jeremiah Mong'are", party: "UDA", region: "West Mugirango", img: "images/default.jpg" },
    { name: "Zebedeo Opore", party: "ODM", region: "Borabu", img: "images/default.jpg" },
    { name: "Peter Omwenga", party: "Independent", region: "Kitutu Masaba", img: "images/default.jpg" }
  ],

  "Nyandarua": [
    { name: "Faith Gitau ally", party: "UDA", region: "Ol Kalou", img: "images/default.jpg" },
    { name: "John Muiruri", party: "UDA", region: "Ndaragwa", img: "images/default.jpg" },
    { name: "Peter Kimani", party: "Independent", region: "Kinangop", img: "images/default.jpg" }
  ],

  "Siaya": [
    { name: "James Orengo ally", party: "ODM", region: "Ugenya", img: "images/default.jpg" },
    { name: "Oburu Odinga ally", party: "ODM", region: "Gem", img: "images/default.jpg" },
    { name: "Peter Owino", party: "Independent", region: "Bondo", img: "images/default.jpg" }
  ],

  "Trans Nzoia": [
    { name: "George Natembeya ally", party: "UDA", region: "Saboti", img: "images/default.jpg" },
    { name: "Michael Khaemba", party: "ODM", region: "Kiminini", img: "images/default.jpg" },
    { name: "Joseph Kiprop", party: "Independent", region: "Endebess", img: "images/default.jpg" }
  ]
}
};

let currentUser = null;
let currentPosition = "";
let currentCounty = "";

// 🔐 AUTH CHECK
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    // 🔥 Get user document from Firestore
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert("User data not found!");
      return;
    }

    // ✅ NOW currentUser has county
    currentUser = {
      uid: user.uid,
      ...docSnap.data()
    };

    console.log("Loaded user:", currentUser); // debug

  } catch (error) {
    console.error("Error loading user:", error);
  }
});

// 🟢 LOAD POSITION
window.loadCandidates = function(position) {
  currentPosition = position;

  document.getElementById("positions").style.display = "none";
  document.getElementById("candidates").classList.remove("hidden");

  const list = document.getElementById("candidateList");
  const filter = document.getElementById("filterSection");
  const title = document.getElementById("positionTitle");

  title.innerText = position.toUpperCase();
  list.innerHTML = "";
  filter.innerHTML = "";

  // 🔒 ENSURE USER IS LOADED
  if (!currentUser) {
    alert("User data still loading. Please wait...");
    return;
  }

  // PRESIDENT → NATIONAL
  if (position === "president") {
    renderCandidates(data.president);
    return;
  }

  // 🔥 AUTO-LOAD USER COUNTY ONLY
  const userCounty = currentUser.county;

  if (!userCounty) {
    alert("User county not found! Contact admin.");
    return;
  }

  filter.innerHTML = `<p>📍 Your County: <strong>${userCounty}</strong></p>`;

  loadCountyCandidates(position, userCounty);
};

// 🟢 LOAD COUNTY CANDIDATES
function loadCountyCandidates(position, county) {
  const list = document.getElementById("candidateList");

  if (!county || !data[position][county]) {
    list.innerHTML = "<p>No candidates available</p>";
    return;
  }

  renderCandidates(data[position][county]);
}

// 🟢 RENDER + ATTACH VOTE EVENTS
function renderCandidates(candidates) {
  const list = document.getElementById("candidateList");
  list.innerHTML = "";

  candidates.forEach(c => {
    list.innerHTML += `
      <div class="candidate-card">
        <img src="${c.img}" alt="Candidate">
        <h3>${c.name}</h3>
        <p>${c.party}</p>
        <p>${c.region}</p>

        <button 
          class="voteBtn" 
          data-candidate="${c.name}" 
          data-county="${c.region}">
          Vote
        </button>
      </div>
    `;
  });

  attachVoteEvents();
}

// 🟢 HANDLE VOTING
async function attachVoteEvents() {
  const voteButtons = document.querySelectorAll(".voteBtn");

  voteButtons.forEach(btn => {
    btn.addEventListener("click", async () => {

      const candidate = btn.dataset.candidate;

      try {
        // 🔒 Ensure user loaded
        if (!currentUser || !currentUser.county) {
          alert("User data not loaded. Please refresh.");
          return;
        }

        // ❌ CHECK IF ALREADY VOTED FOR THIS POSITION
        const q = query(
          collection(db, "votes"),
          where("userId", "==", currentUser.uid),
          where("position", "==", currentPosition)
        );

        const existing = await getDocs(q);

        if (!existing.empty) {
          alert("You already voted for this position!");
          return;
        }

        // ✅ SAVE VOTE
        await addDoc(collection(db, "votes"), {
          userId: currentUser.uid,
          position: currentPosition,
          county: currentPosition === "president"
            ? "National"
            : currentUser.county,
          candidate: candidate,
          createdAt: new Date()
        });

        const allVotesSnap = await getDocs(
          query(collection(db, "votes"), where("userId", "==", currentUser.uid))
        );

        // 🔁 Define required positions (IMPORTANT)
        const requiredPositions = ["president", "mp", "governor"]; // change to your system

        const votedPositions = new Set();
        allVotesSnap.forEach(doc => {
          votedPositions.add(doc.data().position);
        });

        const hasFinishedAllVotes =
          requiredPositions.every(pos => votedPositions.has(pos));

        // ✅ ONLY MARK USER AS VOTED WHEN COMPLETE
        if (hasFinishedAllVotes) {
          await updateDoc(doc(db, "users", currentUser.uid), {
            hasVoted: true
          });
        }

        alert(`✅ Vote for ${candidate} submitted!`);
        window.location.href = "dashboard.html";

      } catch (error) {
        console.error(error);
        alert("Error submitting vote: " + error.message);
      }
    });
  });
}


window.goBack = function () {

  const positions = document.getElementById("positions");
  const candidates = document.getElementById("candidates");

  // If user is viewing candidates → go back to positions
  if (!candidates.classList.contains("hidden")) {
    candidates.classList.add("hidden");
    positions.style.display = "block";

    // reset candidate view
    document.getElementById("candidateList").innerHTML = "";
    document.getElementById("positionTitle").innerText = "";
    document.getElementById("filterSection").innerHTML = "";

    currentPosition = "";
    return;
  }

  // Optional fallback (already at top level)
  positions.style.display = "block";
};