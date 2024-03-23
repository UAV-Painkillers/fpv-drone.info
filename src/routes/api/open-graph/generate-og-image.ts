import ngrok from "@ngrok/ngrok";

interface Params {
  title: string;
  subtitle: string;
  originUrl: URL;
  svgTemplateFileName: string;
}
export async function generateOgImage(params: Params): Promise<Blob> {
  const { title, subtitle, originUrl, svgTemplateFileName } = params;

  const ogImageGeneratorEndpoint = process.env.OG_IMAGE_GENERATOR_ENDPOINT;
  if (!ogImageGeneratorEndpoint) {
    throw new Error("OG_IMAGE_GENERATOR_ENDPOINT is not set");
  }

  let svgTemplateUrl = `${originUrl.origin}/${svgTemplateFileName}`;
  let listener: ngrok.Listener | undefined;
  if (process.env.OG_IMAGE_USE_PROXY) {
    listener = await ngrok.forward({
      addr: originUrl.port,
      authtoken_from_env: true,
    });

    svgTemplateUrl = `${listener.url()}/${svgTemplateFileName}`;
  }

  const ogImageGeneratorImageUrl = new URL(ogImageGeneratorEndpoint);
  ogImageGeneratorImageUrl.searchParams.append("svgUrl", svgTemplateUrl);
  ogImageGeneratorImageUrl.searchParams.append("title", title);
  ogImageGeneratorImageUrl.searchParams.append("subtitle", subtitle);

  const authUser = process.env.OG_IMAGE_GENERATOR_USER;
  const authPassword = process.env.OG_IMAGE_GENERATOR_PASSWORD;

  const basicAuthHeader = authUser
    ? `Basic ${Buffer.from(`${authUser}:${authPassword}`).toString("base64")}`
    : undefined;

  const response = await fetch(ogImageGeneratorImageUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: basicAuthHeader as string,
    },
  });

  if (listener) {
    await listener.close();
  }

  if (!response.ok) {
    throw new Error(`Failed to generate OG image: ${response.statusText}`);
  }

  return await response.blob()
}
