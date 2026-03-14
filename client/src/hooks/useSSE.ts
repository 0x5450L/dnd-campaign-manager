  import { useContext } from "react";
  import { SSEContext } from "../context/SSEContext/SSEContext";

export const useSSE = () => {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error("useSSE must be used within SSEProvider");
  }
  return context;
};