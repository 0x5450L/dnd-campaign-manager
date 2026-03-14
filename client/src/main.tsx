import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/authContext/AuthProvider";
import { SSEProvider } from "./context/SSEContext/SSEProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SSEProvider>
          <App />
        </SSEProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
