export const formatRollExpression = (expression: string) =>
  expression.replace(
    /(\d*)d(\d+)(kh|kl)(\d+)/gi,
    (_match, _count, sides, kind, keep) =>
      `${keep}D${sides} ${kind.toLowerCase() === "kh" ? "adv" : "dis"}`,
  );
