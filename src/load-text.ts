/** Load file as a string. */
export const loadText = async (url: string) => {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  return resp.text();
};
