// Client-side utility functions for file handling
// These functions don't require LangChain and can run in the browser

// Supported file extensions for UI display
export function getSupportedFileExtensions(): string[] {
  return [".pdf", ".txt", ".csv", ".docx", ".doc"];
}

// Supported MIME types for file input
export function getSupportedMimeTypes(): string[] {
  return [
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];
}

// Utility function to check if file is supported
export function isFileSupported(file: File): boolean {
  const fileType = file.type;
  const extension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));

  // Check MIME type
  const supportedMimeTypes = getSupportedMimeTypes();
  if (supportedMimeTypes.includes(fileType)) {
    return true;
  }

  // Check file extension
  const supportedExtensions = getSupportedFileExtensions();
  return supportedExtensions.includes(extension);
}
