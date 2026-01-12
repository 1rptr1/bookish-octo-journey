export function querySelectorAllDeep(root, selector) {
  const results = [];

  const visit = node => {
    if (!node) return;

    if (node.querySelectorAll) {
      results.push(...node.querySelectorAll(selector));
    }

    const treeWalker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    let current = treeWalker.currentNode;
    while (current) {
      if (current.shadowRoot) {
        visit(current.shadowRoot);
      }
      current = treeWalker.nextNode();
    }
  };

  visit(root);
  return results;
}
