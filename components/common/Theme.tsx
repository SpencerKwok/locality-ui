import { createContext } from "react";

export interface ThemeObject {
  color: {
    background: {
      light: string;
      dark: string;
    };
    hover: {
      light: string;
      dark: string;
    };
    text: {
      light: string;
      dark: string;
    };
  };
  size: {
    height: number;
    width: number;
  };
  scale: number;
  isMobile: boolean;
}

export const DefaultTheme: ThemeObject = {
  color: {
    background: {
      light: "#FBECCF",
      dark: "#F3D2C1",
    },
    hover: {
      light: "#EEEEEE",
      dark: "linear-gradient(0deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.28)), #112378;",
    },
    text: {
      light: "#FFFFFF",
      dark: "#112378",
    },
  },
  size: {
    height: 0,
    width: 0,
  },
  scale: 0,
  isMobile: false,
};

const ThemeContext = createContext<ThemeObject>(DefaultTheme);
export default ThemeContext;
