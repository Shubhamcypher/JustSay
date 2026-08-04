import { useNavigate } from "react-router-dom";
import { Home, Search, Share2 } from "lucide-react";
import NavItem from "./NavItem";
// import NavItem from "./NavItem";

const navItems = [
  { label: "Home", icon: Home },
  { label: "Search", icon: Search },
  { label: "Shared", icon: Share2 },
];

type NavLabel = (typeof navItems)[number]["label"];

interface SidebarNavProps {
  collapsed: boolean;
  active: NavLabel;
  setActive: React.Dispatch<React.SetStateAction<NavLabel>>;
}

export default function SidebarNav({
  collapsed,
  active,
  setActive,
}: SidebarNavProps) {
  const navigate = useNavigate();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <NavItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          collapsed={collapsed}
          active={active === item.label}
          onClick={() => {
            setActive(item.label);
            if (item.label === "Home") navigate("/");
          }}
        />
      ))}
    </nav>
  );
}