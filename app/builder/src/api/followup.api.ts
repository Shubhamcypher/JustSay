export async function followUpProject(
    payload: {
        followUpPrompt: string;
        originalPrompt: string;
        projectId: string;
        files: Record<string, any>;
    }
) {
    const response = await fetch(
        `http://${window.location.hostname}:5000/api/followup`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials:"include",
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        throw new Error("Follow-up request failed");
    }

    if (!response.body) {
        throw new Error("No response body");
    }

    return response.body.getReader();
}