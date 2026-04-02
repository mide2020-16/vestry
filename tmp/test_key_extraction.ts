const extractKey = (url: string) => {
  if (!url) return null;
  const parts = url.split("/");
  return parts[parts.length - 1]; // Correct for https://utfs.io/f/<key>
};

const testUrls = [
  "https://utfs.io/f/abcd-1234-5678",
  "https://utfs.io/f/xyz-987-654.glb",
  "",
  null,
];

testUrls.forEach(url => {
  console.log(`URL: ${url} -> Key: ${extractKey(url as string)}`);
});
