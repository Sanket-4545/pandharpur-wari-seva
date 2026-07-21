export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const shifts = [
  { value: "morning", labelKey: "register_page.shift_morning" },
  { value: "afternoon", labelKey: "register_page.shift_afternoon" },
  { value: "evening", labelKey: "register_page.shift_evening" },
  { value: "night", labelKey: "register_page.shift_night" }
];

export const languages = [
  { value: "marathi", labelKey: "register_page.lang_marathi" },
  { value: "hindi", labelKey: "register_page.lang_hindi" },
  { value: "english", labelKey: "register_page.lang_english" },
  { value: "kannada", labelKey: "register_page.lang_kannada" },
  { value: "telugu", labelKey: "register_page.lang_telugu" }
];

export const skills = [
  { value: "first_aid", labelKey: "register_page.skill_first_aid" },
  { value: "crowd_mgmt", labelKey: "register_page.skill_crowd_mgmt" },
  { value: "translation", labelKey: "register_page.skill_translation" },
  { value: "logistics", labelKey: "register_page.skill_logistics" },
  { value: "it_support", labelKey: "register_page.skill_it_support" }
];

export const volunteersList = [
  {
    id: "VOL-2026-101",
    name: "Rahul Deshmukh",
    email: "rahul.desh@gmail.com",
    phone: "98765 01234",
    gender: "Male",
    age: 21,
    city: "Pune",
    college: "COEP Technological University",
    nssUnit: "NSS-UNIT-01",
    bloodGroup: "O+",
    emergencyPhone: "98765 00001",
    skills: ["first_aid", "crowd_mgmt"],
    languages: ["marathi", "english"],
    shift: "morning",
    status: "approved"
  },
  {
    id: "VOL-2026-102",
    name: "Priyanka Jadhav",
    email: "priyanka.j@coep.edu",
    phone: "91234 56789",
    gender: "Female",
    age: 20,
    city: "Satara",
    college: "YS College of Engineering",
    nssUnit: "NSS-UNIT-04",
    bloodGroup: "B+",
    emergencyPhone: "91234 56000",
    skills: ["translation", "logistics"],
    languages: ["marathi", "hindi"],
    shift: "afternoon",
    status: "approved"
  },
  {
    id: "VOL-2026-103",
    name: "Amit Shinde",
    email: "amit.s@gmail.com",
    phone: "87654 32109",
    gender: "Male",
    age: 22,
    city: "Kolhapur",
    college: "KIT College of Engineering",
    nssUnit: "NSS-UNIT-09",
    bloodGroup: "A+",
    emergencyPhone: "87654 30000",
    skills: ["crowd_mgmt", "it_support"],
    languages: ["marathi", "english", "kannada"],
    shift: "evening",
    status: "pending"
  },
  {
    id: "VOL-2026-104",
    name: "Snehal Patil",
    email: "snehal.p@outlook.com",
    phone: "76543 21098",
    gender: "Female",
    age: 19,
    city: "Sangli",
    college: "Willingdon College Sangli",
    nssUnit: "NSS-UNIT-03",
    bloodGroup: "AB+",
    emergencyPhone: "76543 20000",
    skills: ["first_aid", "translation"],
    languages: ["marathi", "telugu"],
    shift: "night",
    status: "approved"
  },
  {
    id: "VOL-2026-105",
    name: "Vijay Kulkarni",
    email: "vijay.k@gmail.com",
    phone: "65432 10987",
    gender: "Male",
    age: 23,
    city: "Solapur",
    college: "Solapur University Campus",
    nssUnit: "NSS-UNIT-12",
    bloodGroup: "O-",
    emergencyPhone: "65432 10000",
    skills: ["logistics", "it_support"],
    languages: ["marathi", "hindi"],
    shift: "morning",
    status: "rejected"
  }
];

