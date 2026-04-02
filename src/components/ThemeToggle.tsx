"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 dark:border-white/5 p-1 rounded-full shadow-2xl">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-full transition-all ${
          theme === "light" 
            ? "bg-amber-500 text-white shadow-lg scale-110" 
            : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5"
        }`}
        aria-label="Light mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-full transition-all ${
          theme === "dark" 
            ? "bg-amber-500 text-white shadow-lg scale-110" 
            : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5"
        }`}
        aria-label="Dark mode"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-full transition-all ${
          theme === "system" 
            ? "bg-amber-500 text-white shadow-lg scale-110" 
            : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5"
        }`}
        aria-label="System mode"
      >
        <Monitor size={16} />
      </button>
    </div>
  );
}

// "use client";

// import * as React from "react";
// import { Moon, Sun, Monitor } from "lucide-react";
// import { useTheme } from "next-themes";

// export function ThemeToggle() {
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = React.useState(false);
//   const [isHovered, setIsHovered] = React.useState(false);

//   React.useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   const themes = [
//     { id: "light", icon: Sun, label: "Light" },
//     { id: "dark", icon: Moon, label: "Dark" },
//     { id: "system", icon: Monitor, label: "System" },
//   ];

//   // Reorder so the active theme is the right-most (always visible) icon
//   const sortedThemes = [...themes].sort((a, b) => {
//     if (a.id === theme) return 1;
//     if (b.id === theme) return -1;
//     return 0;
//   });

//   const handleSelect = (newTheme: string) => {
//     setTheme(newTheme);
//     // Force the drawer shut immediately after selection
//     setIsHovered(false);
//   };

//   return (
//     <div className="fixed top-4 right-4 z-50 flex justify-end">
//       <div
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//         style={{
//           maxWidth: isHovered ? "160px" : "42px",
//         }}
//         className={`
//           flex items-center gap-1 overflow-hidden transition-all duration-300 ease-in-out
//           bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/10 p-1 rounded-full shadow-2xl
//         `}
//       >
//         {sortedThemes.map(({ id, icon: Icon, label }) => {
//           const isActive = theme === id;
//           return (
//             <button
//               key={id}
//               type="button"
//               onClick={() => handleSelect(id)}
//               className={`
//                 p-2 rounded-full transition-all shrink-0
//                 ${isActive 
//                   ? "bg-amber-500 text-white shadow-lg scale-90" 
//                   : "text-neutral-500 hover:text-neutral-200 hover:bg-white/10"
//                 }
//                 ${!isActive && !isHovered ? "opacity-0 pointer-events-none" : "opacity-100"}
//               `}
//               aria-label={label}
//             >
//               <Icon size={18} />
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
