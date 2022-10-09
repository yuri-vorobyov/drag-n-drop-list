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
  draggedData.element.style.left = draggedData.left + "px";
  draggedData.element.style.top = draggedData.top + "px";
}

function dragStop(event) {
  window.removeEventListener("mousemove", dragging);
  draggedData.element.style.removeProperty("left");
  draggedData.element.style.removeProperty("top");
  draggedData.element.classList.remove("grabbed");
}
