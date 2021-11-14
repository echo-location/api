const parseQuery = (target) => {
  if (typeof target !== "string") next();
  switch (target.toLowerCase()) {
    case "null":
      return null;
    case "true":
      return true;
    case "false":
      return false;
    default:
      if (!isNaN(Number(target))) return Number(target);
      return target;
  }
};

export { parseQuery };
