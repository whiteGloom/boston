window.onload = scripts;

function scripts() {
  const nodes = [];
  const ground = document.getElementById('canvas');
  let activeNode = null;
  let fileToExport = null;

  init();

  function init() {
    createHeader(nodes.length, 'Some article');
    createParagraph(nodes.length, 'Was there not one way to grasp the sky?');

    updateExportableContent();
    initSaveSystem();
  }

  function initSaveSystem() {
    const loadFromFileInput = document.getElementById('loadFromFileInput');
    loadFromFileInput.value = '';
    loadFromFileInput.addEventListener('change', onLoadFromFileInputUpdate);

    const loadFromFileButton = document.getElementById('loadFromFileButton');
    loadFromFileButton.addEventListener('click', onLoadFromFileButtonClick);

    updateLoadFromButton();
  }

  function updateExportableContent() {
    if (fileToExport) {
      URL.revokeObjectURL(fileToExport);
    }

    let encodedText = '';

    nodes.forEach((node) => {
      let nodeTag;
      const nodeHtmlTagName = node.tagName;
      switch (nodeHtmlTagName) {
        case 'P': nodeTag = 'bstntagname=p_'; break;
        case 'H1': nodeTag = 'bstntagname=h1_'; break;
        case 'H2': nodeTag = 'bstntagname=h2_'; break;
        case 'H3': nodeTag = 'bstntagname=h3_'; break;
        case 'H4': nodeTag = 'bstntagname=h4_'; break;
        case 'H5': nodeTag = 'bstntagname=h5_'; break;
        case 'H6': nodeTag = 'bstntagname=h6_'; break;
        default: nodeTag = '';
      }

      encodedText += `${nodeTag}${node.textContent}`;
    });

    fileToExport = new File([encodedText], 'exported.txt', { type: "text/plain" });

    updateSaveToFileButton();
  }

  function updateSaveToFileButton() {
    const linker = document.getElementById("export");
    linker.setAttribute('href', URL.createObjectURL(fileToExport));
    linker.download = fileToExport.name;
  }

  function updateLoadFromButton() {
    const fileInput = document.getElementById('loadFromFileInput');
    const loadFromFileButton = document.getElementById('loadFromFileButton');

    if (!fileInput.files.length) {
      loadFromFileButton.classList.add('_blocked');
    } else {
      loadFromFileButton.classList.remove('_blocked');
    }
  }

  function onLoadFromFileInputUpdate() {
    updateLoadFromButton();
  }

  function onLoadFromFileButtonClick(e) {
    e.preventDefault();

    const input = document.getElementById('loadFromFileInput');
    const files = input.files;

    if (!files.length) {
      return;
    }

    const file = files[0];
    const reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function() {
      parseLoadFromFileResult(reader.result);
    };
  }

  function parseLoadFromFileResult(response) {
    let parsedBlocks = [];
    let remainingText = response;

    let indexOfTag = remainingText.indexOf('bstntagname=');
    parseBlocks();

    function parseBlocks() {
      let blockValue;
      const tagValue = remainingText.slice(12, remainingText.indexOf('_'));

      remainingText = remainingText.slice(remainingText.indexOf('_') + 1);
      indexOfTag = remainingText.indexOf('bstntagname=');
      if (indexOfTag > -1) {
        blockValue = remainingText.slice(0, indexOfTag);
        remainingText = remainingText.slice(indexOfTag);
        parsedBlocks.push([tagValue, blockValue]);
        parseBlocks();
      } else {
        blockValue = remainingText;
        parsedBlocks.push([tagValue, blockValue]);
        handleParsedTags();
      }
    }

    function handleParsedTags() {
      deleteAllNodes(true);

      parsedBlocks.forEach((block) => {
        switch (block[0]) {
          case 'p':
            createParagraph(undefined, block[1], true)
            break;
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            createHeader(undefined, block[1], block[0][1], true)
            break;
        }
      });

      render();
    }
  }

  function addNode(node, position, disableRender) {
    nodes.splice(position, 0, node);

    node.addEventListener('focus', onNodeFocus);
    node.addEventListener('blur', onNodeBlur);

    if (!disableRender) {
      render();
    }
  }

  function deleteAllNodes(disableRender) {
    const snapshot = [...nodes];
    snapshot.forEach((node) => {
      deleteNode(node, disableRender);
    })
  }

  function deleteNode(node, disableRender) {
    if (activeNode === nodes) {
      activeNode = null;
    }

    nodes.splice(nodes.indexOf(node), 1);

    node.removeEventListener('focus', onNodeFocus);
    node.removeEventListener('blur', onNodeBlur);

    if (!disableRender) {
      render();
    }
  }

  function createHeader(position, text, size, disableRender) {
    const node = document.createElement(`h${size || 1}`);

    node.innerHTML = text || '';
    node.setAttribute('contenteditable', 'true');

    addNode(node, position || nodes.length, disableRender);
  }

  function createParagraph(position, text, disableRender) {
    const node = document.createElement('p');

    node.innerHTML = text || '';
    node.setAttribute('contenteditable', 'true');

    addNode(node, position || nodes.length, disableRender);
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

      updateExportableContent();
    });
  }
}
