export function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function truncate(value, length = 140) {
  if (!value || value.length <= length) {
    return value;
  }

  return `${value.slice(0, length)}...`;
}
