import { createTheme } from "@mui/material";
import React from 'react'

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const useThemes = () => {
  const [mode, setMode] = React.useState<"light" | "dark">("light");
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );
  const auth_theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#ffffff",
      },
    },
  });
  const main_theme = createTheme({
    palette: {
      mode: mode,
      primary: {
        main: "#ffffff",
      },
      secondary: {
        main: "#707371",
      },
    },
  });
  
  return {
    setMode: colorMode,
    auth_theme,
    main_theme,
    ColorModeContext
  }
}

export default useThemes
  
