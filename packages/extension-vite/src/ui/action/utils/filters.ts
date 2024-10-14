import moment from "moment";
import {
  formatFiatValue,
  formatFloatingPointValue,
} from "@/libs/utils/number-formatter";
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
export { formatFiatValue, formatFloatingPointValue };
