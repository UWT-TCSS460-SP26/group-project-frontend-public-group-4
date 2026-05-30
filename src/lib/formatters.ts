export function formatDateAndYear(dateString?: string | null) {
  let releaseYear = "";
  let formattedDate = "";

  if (dateString) {
    releaseYear = dateString.split("-")[0];
    const [y, m, d] = dateString.split("-");

    if (y && m && d) {
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      formattedDate = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } else {
      formattedDate = dateString;
    }
  }

  return { releaseYear, formattedDate };
}
