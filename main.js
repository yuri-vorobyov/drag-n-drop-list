const root = document.querySelector("ul");
let elements = Array.from(root.children);

/* container for the necessary data for drag'n'drop processing */
const draggedData = {
  // dragged element
  element: null,
  // previous values of MouseEvent.clientX and .clientY
  lastX: NaN,
  lastY: NaN,
  // CSS properties for the element being dragged
  left: NaN,
  top: NaN,
  // original bounding rect
  rectOriginal: null,
  // index of dragged element
  index: NaN,
};

elements.forEach((element) => {
  element.addEventListener("mousedown", (event) => {
    if (
      event.buttons === 1 &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.shiftKey
    )
      dragStart(event);
  });
});

function dragStart(event) {
  /* Initialization of dragging. Note that all the elements of `draggedData`
     container get initialized here. What this means is that later on we
     do not need to "clean up" container state after dragging is complete. */
  draggedData.element = event.target;
  draggedData.lastX = event.clientX;
  draggedData.lastY = event.clientY;
  draggedData.left = 0;
  draggedData.top = 0;
  draggedData.rectOriginal = draggedData.element.getBoundingClientRect();
  draggedData.index = elements.indexOf(draggedData.element);
  /* changing styling of dragged element */
  draggedData.element.classList.add("grabbed");
  /* and registering global `mousemove` and `mouseup` event handlers */
  window.addEventListener("mousemove", dragging);
  window.addEventListener("mouseup", dragStop, { once: true });
}

function dragging(event) {
  /* processing movement */
  draggedData.left += event.clientX - draggedData.lastX;
  draggedData.top += event.clientY - draggedData.lastY;
  draggedData.lastX = event.clientX;
  draggedData.lastY = event.clientY;

  /* need to find out if there is another item (or items) below the dragged one */
  const elementsBelow = elements
    .filter((element) => element !== draggedData.element)
    .filter((element) => pointInsideElement(event.x, event.y, element));

  if (elementsBelow.length > 0) {
    /* if there are such items --- need to make some swaps */
    if (elementsBelow.length === 1) {
      const belowElementIndex = elements.indexOf(elementsBelow[0]);
      swapChildren(root, draggedData.index, belowElementIndex);
      /* Need to calculate new CSS left and top for dragged element. The trickiest
       part of this --- is that "old" CSS left and top are still applied to the
       dragged element, so that before calculating new origin rect we need to
       remove this offset. */
      draggedData.element.style.left = "0px";
      draggedData.element.style.top = "0px";
      const rectNew = draggedData.element.getBoundingClientRect();
      draggedData.left += draggedData.rectOriginal.left - rectNew.left;
      draggedData.top += draggedData.rectOriginal.top - rectNew.top;
      /* and saving new origin rect */
      draggedData.rectOriginal = rectNew;
      /* index has changed as well */
      draggedData.index = belowElementIndex;
      /* and also array of children got messed up, so update it */
      elements = Array.from(root.children);
    } else {
      throw new Error("2 items below the dragged one!");
    }
  }

  /* applying new CSS left and top */
  draggedData.element.style.left = draggedData.left + "px";
  draggedData.element.style.top = draggedData.top + "px";
}

function pointInsideElement(x, y, element) {
  const rect = element.getBoundingClientRect();
  return !(x < rect.left || x > rect.right || y < rect.top || y > rect.bottom);
}

function swapChildren(parent, indexD, indexB) {
  if (indexD === indexB) {
    throw Error(`Attempt to swap ${indexD} with ${indexB}`);
  }

  if (indexD < indexB) {
    parent.children[indexB].after(parent.children[indexD]);
  } else {
    parent.children[indexB].before(parent.children[indexD]);
  }
}

function dragStop(event) {
  window.removeEventListener("mousemove", dragging);
  draggedData.element.classList.remove("grabbed");
  draggedData.element.classList.add("flying-back");
  draggedData.element.style.left = "0px";
  draggedData.element.style.top = "0px";
  draggedData.element.addEventListener(
    "transitionend",
    () => {
      draggedData.element.classList.remove("flying-back");
      draggedData.element.style.removeProperty("left");
      draggedData.element.style.removeProperty("top");
    },
    { once: true }
  );
}
