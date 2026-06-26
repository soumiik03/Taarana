(async () => {
  const inngest = await import("inngest");
  console.log("Exports from inngest:", Object.keys(inngest));
})();
