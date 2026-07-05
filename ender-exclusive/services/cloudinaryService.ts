export const uploadImageToCloudinary = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    }/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error("Image upload failed");
  }

  return data.secure_url;
};
