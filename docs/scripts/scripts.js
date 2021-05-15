window.onload = scripts;

function scripts() {
  const nodes = [];
  const ground = document.getElementById('main');
  let activeNode = null;

  init();

  function init() {
    createHeader(nodes.length, 'Some article');
    createParagraph(nodes.length, 'Was there not one way to grasp the sky?');
  }

  function addNode(node, position) {
    nodes.splice(position, 0, node);

    node.addEventListener('focus', onNodeFocus);
    node.addEventListener('blur', onNodeBlur);

    render();
  }

  function deleteNode(node) {
    if (activeNode === nodes) {
      activeNode = null;
    }

    nodes.splice(nodes.indexOf(node), 1);

    node.removeEventListener('focus', onNodeFocus);
    node.removeEventListener('blur', onNodeBlur);

    render();
  }

  function createHeader(position, text, size) {
    const node = document.createElement(`h${size || 1}`);

    node.innerHTML = text || '';
    node.setAttribute('contenteditable', 'true');

    addNode(node, position || nodes.length);
  }

  function createParagraph(position, text) {
    const node = document.createElement('p');

    node.innerHTML = text || '';
    node.setAttribute('contenteditable', 'true');

    addNode(node, position || nodes.length);
  }

  function render() {
    ground.innerHTML = '';

    for (let i = 0; i < nodes.length; i += 1) {
      ground.appendChild(nodes[i]);
    }

    checkHighlighting();
  }

  function unbindActiveNodeEvents() {
    activeNode.removeEventListener('keydown', onNodeKeydown);
  }

  function bindActiveNodeEvents() {
    activeNode.addEventListener('keydown', onNodeKeydown);
  }

  function setActiveNode(node) {
    if (activeNode) {
      unbindActiveNodeEvents();
    }

    activeNode = node;

    if (activeNode) {
      bindActiveNodeEvents();
    }
  }

  function onNodeFocus(e) {
    setActiveNode(e.target);
  }

  function onNodeBlur() {
    setActiveNode(null);
  }

  function onNodeKeydown(e) {
    if (e.key === 'Backspace' && !activeNode.textContent.length) {
      e.preventDefault();

      const oldPosition = nodes.indexOf(activeNode);

      deleteNode(activeNode);
      if (!nodes.length) {
        createParagraph()
      }

      const newActiveNode = nodes[!oldPosition ? 0 : oldPosition - 1];
      newActiveNode.focus();

      const range = document.createRange();
      const sel = window.getSelection();

      range.selectNodeContents(newActiveNode)
      range.collapse(false);

      sel.removeAllRanges();
      sel.addRange(range);
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      if (!activeNode.textContent.length) {
        const oldPosition = nodes.indexOf(activeNode);

        deleteNode(activeNode);
        createHeader(oldPosition);

        nodes[oldPosition].focus();
      } else {
        createParagraph(nodes.indexOf(activeNode) + 1);
        nodes[nodes.indexOf(activeNode) + 1].focus();
      }
    }

    checkHighlighting();
  }

  function checkHighlighting() {
    requestAnimationFrame(() => {
      if (nodes.length === 1 && !nodes[0].textContent.length) {
        ground.classList.add('_highlight-lines');
      } else {
        ground.classList.remove('_highlight-lines');
      }
    })
  }
}
