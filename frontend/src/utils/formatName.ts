// Capitalize full name (shubham kumar → Shubham Kumar)
export const formatName = (name?: string | null): string => {
    if (!name) return "";
  
    return name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  // Get first name (shubham kumar → Shubham)
  export const getFirstName = (name?: string | null): string => {
    if (!name) return "";
  
    const first = name.trim().split(/\s+/)[0];
    return formatName(first);
  };
  
  // Get last name (shubham kumar → Kumar)
  export const getLastName = (name?: string | null): string => {
    if (!name) return "";
  
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) return "";
  
    return formatName(parts[parts.length - 1]);
  };
  
  // Get initials (shubham kumar → SK)
  export const getInitials = (name?: string | null): string => {
    if (!name) return "";
  
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2); // limit to 2 letters
  };