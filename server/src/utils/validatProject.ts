export function validateProject(files: Record<string, any>) {
    let score = 0;
  
    const content = Object.values(files).map(f => f.content).join("\n");
  
    if (content.includes("useState")) score++;
    if (content.includes("Routes")) score++;
    if (content.includes("context")) score++;
    if (content.includes("loading")) score++;
    if (content.includes("error")) score++;
  
    return score >= 3; // threshold
  }