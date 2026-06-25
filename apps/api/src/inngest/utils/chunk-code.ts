// Split a large patch into chunks of ~100 lines
// so we don't blow the context window in one shot
export function chunkDiff(
    files: { filename: string; patch: string }[],
    maxLinesPerChunk = 100
): { filename: string; chunk: string }[] {
    const result: { filename: string; chunk: string }[] = [];

    for (const file of files) {
        const lines = file.patch.split("\n");
        for (let i = 0; i < lines.length; i += maxLinesPerChunk) {
            const chunk = lines.slice(i, i + maxLinesPerChunk).join("\n");
            result.push({ filename: file.filename, chunk });
        }
    }

    return result;
}
