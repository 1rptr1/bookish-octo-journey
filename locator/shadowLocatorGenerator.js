import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const xpathRef = fs.readFileSync(
  path.join(__dirname, "../reference/xpath-failsafe-reference.txt"),
  "utf8"
);

export function fallbackLocator(element) {
  if (element.id) return `//*[@id='${element.id}']`;

  if (element.label)
    return `//label[normalize-space()='${element.label}']/following::${element.tag}[1]`;

  if (element.class)
    return `//${element.tag}[contains(@class,'${element.class.split(" ")[0]}')]`;

  return `//${element.tag}`;
}

export function generateShadowLocator(selection) {
  const css = selection?.css;
  const shadowPath = selection?.shadowPath || [];

  if (!css) {
    return {
      type: 'unknown',
      confidence: 0
    };
  }

  if (!shadowPath.length) {
    const isId = css.startsWith('#');
    const xpath = isId
      ? `//*[@id=\"${css.slice(1)}\"]`
      : `//${selection.tag || '*'}[contains(@class,\"\")]`;

    return {
      type: 'dom',
      css,
      xpath,
      confidence: isId ? 95 : 80
    };
  }

  const hosts = shadowPath.map(h => (h.id ? `#${h.id}` : h.tag));

  const playwright =
    hosts.reduce((acc, h) => `${acc}.locator(\"${h}\")`, 'page') +
    `.locator(\"${css}\")`;

  const selenide =
    hosts.reduce((acc, h) => `shadowFind(${acc}, \"${h}\")`, '$("body")') +
    `, \"${css}\")`;

  return {
    type: 'shadow',
    shadowHosts: hosts,
    innerSelector: css,
    playwright,
    selenide,
    confidence: 92
  };
}
