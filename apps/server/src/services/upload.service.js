export function toAttachmentPayload(file) {
  return {
    url: `/uploads/${file.filename}`,
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  };
}
