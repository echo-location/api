import { parseQuery } from "../utils/helpers/parseQuery";
const validateParams = (validation) => {
  return (req, res, next) => {
    // check all queries
    for (let param of validation) {
      // confirm matching query
      if (isPresent(req.query, param)) {
        let reqParam = req.query[param.param_key];

        // confirm matching query type
        if (!getType(reqParam, param)) {
          return res.status(400).send({
            status: 400,
            result:
              `Uh oh! Your parameter ${param.param_key} is of type ` +
              `${typeof parseQuery(reqParam)} but it should be ${param.type}.`,
          });
        } else {
          if (!runValidators(reqParam, param)) {
            return res.status(400).send({
              status: 400,
              result: `Uh oh! Our validation test(s) failed for ${param.param_key}.`,
            });
          }
        }
      } else if (param.required) {
        return res.status(400).send({
          status: 400,
          result: `Uh oh! You're missing a parameter: ${param.param_key}.`,
        });
      }
    }
    next();
  };
};

const isPresent = (param, obj) => {
  return Object.keys(param).includes(obj.param_key);
};

const getType = (param, obj) => {
  return typeof parseQuery(param) === obj.type;
};

const runValidators = (param, obj) => {
  for (let validator of obj.validator_functions)
    if (!validator(param)) return false;
  return true;
};

export { validateParams };
