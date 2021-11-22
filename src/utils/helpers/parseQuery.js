const parseQuery = (target) => {
  if (typeof target !== "string") next(); // Careful: this is undefined
  switch (target.toLowerCase()) {
    case "null":
      return null;
    case "true":
      return true;
    case "false":
      return false;
    // case "date":
    // return new Date();
    default:
      if (!isNaN(Number(target))) return Number(target);
      return target;
  }
};

export { parseQuery };
