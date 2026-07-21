import { 
  Users, 
  ShieldAlert, 
  Phone, 
  Mail,
  HeartPulse,
  UserCheck,
  UserMinus,
  Briefcase,
  HelpCircle,
  Utensils,
  Tent,
  Navigation,
  Shield
} from 'lucide-react';

export const navLinks = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/services', labelKey: 'nav.services' },
  { href: '/emergency-contacts', labelKey: 'nav.emergency_contacts' },
  { href: '/gallery', labelKey: 'nav.gallery' },
  { href: '/faq', labelKey: 'nav.faq' },
  { href: '/contact', labelKey: 'nav.contact' }
];

export const statistics = [
  {
    icon: Users,
    count: "500+",
    labelKey: "stats.volunteers",
    color: "text-primary"
  },
  {
    icon: HeartPulse,
    count: "50+",
    labelKey: "stats.camps",
    color: "text-red-600"
  },
  {
    icon: UserCheck,
    count: "10,000+",
    labelKey: "stats.assisted",
    color: "text-emerald-600"
  },
  {
    icon: ShieldAlert,
    count: "24/7",
    labelKey: "stats.support",
    color: "text-secondary"
  }
];

export const services = [
  {
    id: "emergency",
    icon: ShieldAlert,
    titleKey: "services.emergency_help",
    descKey: "services.emergency_help_desc",
    colorClass: "bg-red-50 text-red-600 border-red-100 hover:border-red-300"
  },
  {
    id: "missing",
    icon: UserMinus,
    titleKey: "services.missing_persons",
    descKey: "services.missing_persons_desc",
    colorClass: "bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300"
  },
  {
    id: "lost",
    icon: Briefcase,
    titleKey: "services.lost_found",
    descKey: "services.lost_found_desc",
    colorClass: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300"
  },
  {
    id: "medical",
    icon: HeartPulse,
    titleKey: "services.medical_assistance",
    descKey: "services.medical_assistance_desc",
    colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300"
  },
  {
    id: "volunteer",
    icon: Users,
    titleKey: "services.volunteer_support",
    descKey: "services.volunteer_support_desc",
    colorClass: "bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300"
  },
  {
    id: "info",
    icon: HelpCircle,
    titleKey: "services.info_center",
    descKey: "services.info_center_desc",
    colorClass: "bg-sky-50 text-sky-600 border-sky-100 hover:border-sky-300"
  },
  {
    id: "food_water",
    icon: Utensils,
    titleKey: "services.food_water",
    descKey: "services.food_water_desc",
    colorClass: "bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300"
  },
  {
    id: "rest_area",
    icon: Tent,
    titleKey: "services.rest_area",
    descKey: "services.rest_area_desc",
    colorClass: "bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300"
  },
  {
    id: "traffic",
    icon: Navigation,
    titleKey: "services.traffic_updates",
    descKey: "services.traffic_updates_desc",
    colorClass: "bg-teal-50 text-teal-600 border-teal-100 hover:border-teal-300"
  },
  {
    id: "police",
    icon: Shield,
    titleKey: "services.police_assistance",
    descKey: "services.police_assistance_desc",
    colorClass: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300"
  }
];

export const emergencyContacts = [
  {
    labelKey: "footer.police",
    value: "100 / 112",
    icon: ShieldAlert
  },
  {
    labelKey: "footer.medical",
    value: "108 / 102",
    icon: HeartPulse
  },
  {
    labelKey: "footer.nss_office",
    value: "+91 22 2202 4444",
    icon: Phone
  },
  {
    labelKey: "footer.email",
    value: "nss-seva@wariportal.org",
    icon: Mail
  }
];
