"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

const ThemeToggler = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      aria-label="theme toggler"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="group flex items-center cursor-pointer justify-center"
    >
      <span>
        <Image
          src={"/images/icon/white-sun-icon.svg"}
          alt="sun-icon"
          width={20}
          height={20}
          className="hidden dark:block"
        />
        <Image
          src={"/images/icon/white-moon-icon.svg"}
          alt="moon-icon"
          width={20}
          height={20}
          className="block dark:hidden"
        />
      </span>
    </button>
  );
};

export default ThemeToggler;
