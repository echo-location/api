const isDateValid = (dateString) => {
  const dateStringRegex = /^\d{4}-\d\d-\d\d$/;
  if (dateStringRegex.test(dateString)) {
    let [year, month, day] = dateString.split('-');
    year = parseInt(year, 10);
    month = parseInt(month, 10);
    day = parseInt(day, 10);
    if (month > 0 && month < 13 && day > 0 && day < 32 && year >= 1969) { // UTC-N timezones' (eg PT) start year is in 1969
      // Make sure date is valid. eg. '2021-31-11' or Nov 31st is invalid
      // const date = new Date(dateString); // UTC but MDN discourages this parsing because it's inconsistent
      // const date = new Date(Date.UTC(year, month - 1, day)); // UTC
      const date = new Date(year, month - 1, day); // Local Time but at midnight so PT is
      if (date.getUTCDate() === day && date.getUTCMonth() === month - 1 && date.getUTCFullYear() === year) {
        return true;
      }
    }
  }
  return false;
};

export { isDateValid }; // module.exports = isDateValid;
