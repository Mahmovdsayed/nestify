import { fileTypeFromBuffer } from "file-type";
import { writeFile } from "node:fs/promises";
import { allowedExtensions } from "../utils/allowedExtensions";
import type { Context, MiddlewareHandler } from "hono";

interface FileUploadOptions {
  extensions?: string[];
  maxSize?: number; 
  multiple?: boolean;
  optional?: boolean; 
}

const isValidFileType = async (
  file: File,
  extensions: string[],
): Promise<{ valid: boolean; detectedType?: string }> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return {
        valid: ext ? extensions.includes(ext) : false,
        detectedType: ext,
      };
    }

    return {
      valid: extensions.includes(fileType.ext),
      detectedType: fileType.ext,
    };
  } catch (error) {
    return { valid: false };
  }
};

const isValidFileSize = (file: File, maxSize?: number): boolean => {
  if (!maxSize) return true;
  return file.size <= maxSize;
};

export const fileUpload = (
  options: FileUploadOptions = {},
): MiddlewareHandler => {
  const {
    extensions = allowedExtensions.image,
    maxSize,
    multiple = false,
    optional = false,
  } = options;

  return async (c: Context, next) => {
    try {
      const body = await c.req.parseBody({ all: true });
      const filesMap: Record<string, File | File[]> = {};
      const allFiles: File[] = [];
      const errors: string[] = [];

      for (const [key, value] of Object.entries(body)) {
        if (value instanceof File) {
          allFiles.push(value);
          if (multiple) {
            if (!filesMap[key]) {
              filesMap[key] = [];
            }
            (filesMap[key] as File[]).push(value);
          } else {
            filesMap[key] = value;
          }
        } else if (Array.isArray(value)) {
          for (const item of value) {
            if (item instanceof File) {
              allFiles.push(item);
              if (!filesMap[key]) {
                filesMap[key] = [];
              }
              (filesMap[key] as File[]).push(item);
            }
          }
        }
      }

      if (allFiles.length === 0) {
        if (optional) {
          c.set("files", null);
          c.set("filesMap", null);
          await next();
          return;
        }
        return c.json(
          {
            success: false,
            message: "No file uploaded",
          },
        );
      }

      if (!multiple && allFiles.length > 1) {
        return c.json(
          {
            success: false,
            message: "Multiple files not allowed",
          },
        );
      }

      // Validate each file
      for (const file of allFiles) {
        const typeCheck = await isValidFileType(file, extensions);

        if (!typeCheck.valid) {
          errors.push(
            `File "${file.name}" has invalid format. ${
              typeCheck.detectedType
                ? `Detected: ${typeCheck.detectedType}.`
                : ""
            } Allowed: ${extensions.join(", ")}`,
          );
        }

        if (!isValidFileSize(file, maxSize)) {
          errors.push(
            `File "${file.name}" exceeds maximum size of ${maxSize} bytes`,
          );
        }
      }

      if (errors.length > 0) {
        return c.json(
          {
            success: false,
            message: "File validation failed",
            errors,
          },
          
        );
      }

      c.set("files", multiple ? allFiles : allFiles[0]);
      c.set("filesMap", filesMap);
      await next();
    } catch (error) {
      return c.json(
        {
          success: false,
          message: "Failed to process file upload",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      );
    }
  };
};

export const fileToBuffer = async (file: File): Promise<Buffer> => {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export const saveFileToDisk = async (
  file: File,
  path: string,
): Promise<void> => {
  const buffer = await fileToBuffer(file);
  await writeFile(path, buffer);
};
