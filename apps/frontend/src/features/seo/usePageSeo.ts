import { useEffect } from "react";

function ensureMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }

  return element;
}

function ensureCanonicalLink() {
  let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  return element;
}

export function usePageSeo(input: {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
}) {
  useEffect(() => {
    document.title = input.title;

    const descriptionTag = ensureMeta('meta[name="description"]', {
      name: "description",
      content: input.description,
    });
    const robotsTag = ensureMeta('meta[name="robots"]', {
      name: "robots",
      content: input.robots ?? "index,follow",
    });
    const ogTitleTag = ensureMeta('meta[property="og:title"]', {
      property: "og:title",
      content: input.title,
    });
    const ogDescriptionTag = ensureMeta('meta[property="og:description"]', {
      property: "og:description",
      content: input.description,
    });
    const canonicalLink = ensureCanonicalLink();

    canonicalLink.href = new URL(input.canonicalPath, window.location.origin).toString();
    const canonicalHref = canonicalLink.href;

    ensureMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalHref,
    });

    return () => {
      descriptionTag.remove();
      robotsTag.remove();
      ogTitleTag.remove();
      ogDescriptionTag.remove();
      canonicalLink.remove();
      const ogUrlTag = document.head.querySelector('meta[property="og:url"]');
      ogUrlTag?.remove();
    };
  }, [input.canonicalPath, input.description, input.robots, input.title]);
}
