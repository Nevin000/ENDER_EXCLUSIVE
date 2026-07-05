import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { storage } from "@/firebase/config";

export const uploadImage = async (
  file: File
) => {
  const fileName =
    `${Date.now()}-${file.name}`;

  const storageRef = ref(
    storage,
    `products/${fileName}`
  );

  await uploadBytes(
    storageRef,
    file
  );

  return await getDownloadURL(
    storageRef
  );
};