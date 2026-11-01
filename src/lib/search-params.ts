type Param = string | string[] | undefined;

/** First value of a search param. */
export function one(value: Param): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** "?loc=downtown" or "" — appended to links so the location filter sticks. */
export function locQuery(loc: string | undefined) {
  return loc ? `?loc=${encodeURIComponent(loc)}` : "";
}
