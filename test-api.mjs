import fs from "fs";
try {
  const res = await fetch("http://localhost:3000/api/ai-model", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jobPosition: "full stack",
      jobDescription: "html css",
      duration: "2",
      type: "Technical"
    })
  });
  const text = await res.text();
  fs.writeFileSync("api-result.json", text);
} catch (e) {
  fs.writeFileSync("api-result.json", "Error: " + e.message);
}
