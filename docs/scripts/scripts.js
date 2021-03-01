window.onload = scripts;

function scripts() {
  var activeNode = null;
  var nodes = [];
  var ground = document.body.getElementsByClassName('main')[0];

  init();

  function init() {
    createHeader(nodes.length, 'Some article');
    createParagraph(nodes.length, 'Was there not one way to grasp the sky?');
  }

  function createNode(position, node, text) {
    nodes.splice(position, 0, node);

    node.innerHTML = text || '';

    node.setAttribute('contenteditable', 'true');
    node.addEventListener('focus', onNodeFocus);

    render();
  }

  function deleteNode(node) {
    if (activeNode === nodes) {
      activeNode = null;
    }

    nodes.splice(nodes.indexOf(node), 1);

    node.removeEventListener('focus', onNodeFocus);

    render();
  }

  function createHeader(position, text, size) {
    createNode(position, document.createElement(`h${size || 1}`), text);
  }

  function createParagraph(position, text) {
    createNode(position, document.createElement('p'), text);
  }

  function render() {
    ground.innerHTML = '';

    for (var i = 0; i < nodes.length; i += 1) {
      ground.appendChild(nodes[i]);
    }
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

    if (node) {
      bindActiveNodeEvents();
    }
  }

  function onNodeFocus(e) {
    setActiveNode(e.target);
  }

  function onNodeKeydown(e) {
    if (e.key === 'Backspace' && (!activeNode.childNodes.length || activeNode.childNodes[0].nodeType !== Node.TEXT_NODE) && nodes.length > 1) {
      e.preventDefault();
      var oldPosition = nodes.indexOf(activeNode);
      deleteNode(activeNode);
      nodes[!oldPosition ? 0 : oldPosition - 1].focus();
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      if (!activeNode.childNodes.length || activeNode.childNodes[0].nodeType !== Node.TEXT_NODE) {
        var oldPosition = nodes.indexOf(activeNode);
        deleteNode(activeNode);
        createHeader(oldPosition);
        nodes[oldPosition].focus();
      } else {
        createParagraph(nodes.indexOf(activeNode) + 1);
        nodes[nodes.indexOf(activeNode) + 1].focus();
      }
    }
  }
}
