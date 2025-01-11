const formatYear = (isoDate: string): string => {
  return new Date(isoDate)
    .toLocaleString("en-US", { timeZone: "America/New_York", year: "numeric" })
    .toString();
};

export default formatYear;
