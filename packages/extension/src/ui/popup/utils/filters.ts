import moment from "moment";

export const replaceWithEllipsis = (
  value: string,
  keepLeft: number,
  keepRight: number
): string => {
  if (!value) return "";
  value = value.toString();
  return (
    value.substring(0, keepLeft) +
    "..." +
    value.substring(value.length - keepRight, value.length)
  );
};
export const currencyFormat = (value: number, currency: string): string => {
  if (typeof value !== "number") {
    return value;
  }
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });
  return formatter.format(value);
};
export const formatDuration = (
  duration: moment.Duration,
  date: number
): string => {
  if (duration.days() < 0) return moment(date).fromNow();

  const isoString = moment.duration(duration.asMilliseconds()).toISOString();
  const [, , h = "", , m = "", , s = ""] =
    isoString.match(/T((\d+)H)?((\d+)M)?(([\d]+)(\.(\d+))?S)?/) ?? [];

  if (duration.hours() < 0)
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`;

  return `${m.padStart(2, "0")}:${s.padStart(2, "0")}`;
};
