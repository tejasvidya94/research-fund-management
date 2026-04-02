export const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Project_upload"); // EXACT name from screenshot

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/dz6djmeqr/auto/upload",
        {
            method: "POST",
            body: formData,
        }
    );

    if (!res.ok) {
        throw new Error("Upload failed");
    }

    const data = await res.json();

    return data.secure_url; // this is what you store
};