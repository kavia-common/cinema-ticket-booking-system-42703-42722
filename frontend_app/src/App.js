import React, { useEffect, useState } from "react";
import "./App.css";
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "./auth/AuthContext";

// PUBLIC_INTERFACE
function App() {
  /** Root application - wraps routes with AuthProvider and includes theme toggle. */
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  );
}

export default App;
