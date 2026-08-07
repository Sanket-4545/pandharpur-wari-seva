import VolunteerAuthProvider from "@/components/VolunteerAuthProvider";

export const metadata = {
  title: "Volunteer Portal",
  description:
    "NSS Volunteer portal for the Pandharpur Wari pilgrimage seva operations.",
};

export default function VolunteerLayout({ children }) {
  return <VolunteerAuthProvider>{children}</VolunteerAuthProvider>;
}
