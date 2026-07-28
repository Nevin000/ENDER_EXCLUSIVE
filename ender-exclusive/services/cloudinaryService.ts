export const uploadMediaToCloudinary = async (
  file: File
): Promise<{ url: string; mediaType: "image" | "video" }> => {
  const isVideo =
    file.type.startsWith("video") || /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);
  const resourceType = isVideo ? "video" : "image";
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    }/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error(data.error?.message || `${resourceType} upload failed`);
  }

  return {
    url: data.secure_url,
    mediaType: isVideo ? "video" : "image",
  };
};

export const uploadImageToCloudinary = async (file: File) => {
  const result = await uploadMediaToCloudinary(file);
  return result.url;
};

