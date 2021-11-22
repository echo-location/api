import { parseQuery } from "../utils/helpers/parseQuery";
import { getType, runValidators } from "./validateParams";

const validateBody = (validation, minimumFields = 1) => {
  return (req, res, next) => {
    // check requests
    let fieldCount = 0;
    for (let field of validation) {
      // confirm matching field
      if (isPresent(req.body, field)) {
        let reqField = req.body[field.field_key];
        // confirm matching field type
        if (!getType(reqField, field)) {
          return res.status(400).send({
            status: 400,
            result:
              `Uh oh! Your field ${field.field_key} is of type ` +
              `${typeof parseQuery(reqField)} but it should be ${field.type}.`,
          });
        } else if (field.hasOwnProperty('validator_functions') && !runValidators(reqField, field)) {
          return res.status(400).send({
            status: 400,
            result: `Uh oh! Our validation test(s) failed for ${field.field_key}.`,
          });
        }
        fieldCount++;
      } else if (field.required) {
        return res.status(400).send({
          status: 400,
          result: `Uh oh! You're missing a field: ${field.field_key}.`,
        });
      }
    }
    if (fieldCount !== Object.keys(req.body).length) {
      console.log(fieldCount, Object.keys(req.body));
      return res.status(400).send({
        status: 400, result: `Unrecognized field was sent in request.`
      });
    }
    if (fieldCount < minimumFields) {
      return res.status(400).send({
        status: 400, result: `You're missing ${minimumFields - fieldCount} fields.`
      });
    }
    next();
  };
};

const isPresent = (body, obj) => {
  return body.hasOwnProperty(obj.field_key); // doesn't need to make array
};

export { validateBody };
