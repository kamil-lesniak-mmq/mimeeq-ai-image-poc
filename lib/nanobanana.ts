// lib/nanobanana.ts

interface NanobananaOptions {
  prompt: string;
  aspect_ratio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "9:21";
  output_type?: "url" | "base64";
  reference_images?: string[];
  negative_prompt?: string;
  num_images?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  seed?: number;
}

interface NanobananaResponse {
  images?: string[];
  error?: string;
  message?: string;
  id?: string;
  status?: string;
}

export async function generateImage(
  options: NanobananaOptions
): Promise<NanobananaResponse> {
  const {
    prompt,
    aspect_ratio = "1:1",
    output_type = "url",
    reference_images = [],
    negative_prompt,
    num_images = 1,
    guidance_scale = 7.5,
    num_inference_steps = 30,
    seed,
  } = options;

  // Validate environment variables
  if (!process.env.NANOBANANA_API_URL) {
    throw new Error("NANOBANANA_API_URL environment variable is not set");
  }

  if (!process.env.NANOBANANA_API_KEY) {
    throw new Error("NANOBANANA_API_KEY environment variable is not set");
  }

  try {
    const response = await fetch(process.env.NANOBANANA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NANOBANANA_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio,
        output_type,
        reference_images,
        negative_prompt,
        num_images,
        guidance_scale,
        num_inference_steps,
        ...(seed && { seed }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Nanobanana API error: ${response.status} - ${
          errorData.message || errorData.error || response.statusText
        }`
      );
    }

    const data: NanobananaResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("Failed to generate image: Unknown error");
  }
}

// Optional: Poll for async results if Nanobanana uses webhooks/polling
export async function getImageStatus(
  imageId: string
): Promise<NanobananaResponse> {
  if (!process.env.NANOBANANA_API_URL) {
    throw new Error("NANOBANANA_API_URL environment variable is not set");
  }

  if (!process.env.NANOBANANA_API_KEY) {
    throw new Error("NANOBANANA_API_KEY environment variable is not set");
  }

  try {
    const response = await fetch(
      `${process.env.NANOBANANA_API_URL}/${imageId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NANOBANANA_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get image status: ${error.message}`);
    }
    throw new Error("Failed to get image status: Unknown error");
  }
}