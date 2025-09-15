export const loadTest = () => {
  console.log("Script starter...");
  let start = Date.now();
  while (Date.now() - start < 2000) {
    // simulerer 2 sekunders blokering
  }
  console.log("Script færdig");
};
