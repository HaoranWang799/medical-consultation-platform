const zhDateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const zhTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTimeCN(date: Date): string {
  return zhDateTimeFormatter.format(date).replace("/", "-").replace("/", "-");
}

export function formatTimeCN(date: Date): string {
  return zhTimeFormatter.format(date);
}
