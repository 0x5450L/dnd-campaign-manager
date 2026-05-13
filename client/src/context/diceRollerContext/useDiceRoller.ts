import { useContext } from "react";
import { DiceRollerContext } from "./DiceRollerContext";

export const useDiceRoller = () => {
  const ctx = useContext(DiceRollerContext);
  if (!ctx) {
    throw new Error("useDiceRoller must be used inside <DiceRollerProvider>");
  }
  return ctx;
};
