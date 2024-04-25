interface Params {
  title: string;
  subtitle: string;
  originUrl: URL;
  svgTemplateFileName: string;
}

interface GeneratorConnectionDetails {
  endpoint: string;
  username: string;
  password: string;
}

export async function generateOgImage(
  params: Params,
  generatorConnectionDetails: GeneratorConnectionDetails,
): Promise<Blob> {
  const { title, subtitle, originUrl, svgTemplateFileName } = params;

  const svgTemplateUrl = `${originUrl.origin}/${svgTemplateFileName}`;

  const ogImageGeneratorImageUrl = new URL(generatorConnectionDetails.endpoint);
  ogImageGeneratorImageUrl.searchParams.append("svgUrl", svgTemplateUrl);
  ogImageGeneratorImageUrl.searchParams.append("title", title);
  ogImageGeneratorImageUrl.searchParams.append("subtitle", subtitle);

  const basicAuthHeader = `Basic ${Buffer.from(`${generatorConnectionDetails.username}:${generatorConnectionDetails.password}`).toString("base64")}`;

  const response = await fetch(ogImageGeneratorImageUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: basicAuthHeader as string,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to generate OG image (${ogImageGeneratorImageUrl}): ${response.statusText}`);
  }

  return await response.blob();
}
