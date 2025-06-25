(function () {
  // 如果脚本已在运行，先模拟按下 Esc 键来清除上一次的状态
  if (document.getElementById("mainonly")) {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    return; // 退出，避免重复执行
  }

  var currentElement = document.body;
  var markBy = null; // 'id' or 'class'

  // 初始化，标记 body 元素
  if (currentElement.id) {
    markBy = "class";
    currentElement.classList.add("mainonly");
  } else {
    markBy = "id";
    currentElement.id = "mainonly";
  }

  // 注入高亮边框的样式
  let highlightStyle = document.head.appendChild(document.createElement("style"));
  highlightStyle.textContent = `
    #mainonly { outline: 2px solid red; }
    .mainonly { outline: 2px solid red; }
  `;

  // 创建并显示操作指南
  let guideDiv = document.body.appendChild(document.createElement("div"));
  guideDiv.className = "mainonly-guide";
  guideDiv.innerHTML = `
    <p>正在选择元素。按 <kbd>Esc</kbd> 键取消选择。向下滚动，或按下 <kbd>=</kbd>/<kbd>.</kbd> 键缩小选区。向上滚动，或按下 <kbd>-</kbd>/<kbd>,</kbd> 键扩大选区。</p>
    <p>Selecting element. Press <kbd>Esc</kbd> to cancel selection. Scroll down, or press <kbd>=</kbd>/<kbd>.</kbd> to shrink the selection. Scroll up, or press <kbd>-</kbd>/<kbd>,</kbd>, to expand the selection.</p>
  `;

  // 指南的样式
  let guideStyle = document.head.appendChild(document.createElement("style"));
  guideStyle.textContent = `
    .mainonly-guide {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      padding: 1rem;
      font-size: 1rem;
      font-family: sans-serif;
      text-align: center;
      color: white;
      background-color: rgba(0, 0, 0, 0.7);
      border-radius: 0.5em;
      z-index: 2147483647;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    }
    .mainonly-guide kbd {
      display: inline-block;
      padding: 0.1em 0.3em;
      font-size: 0.9em;
      line-height: 1;
      color: #24292e;
      vertical-align: middle;
      background-color: #fafbfc;
      border: 1px solid #d1d5da;
      border-radius: 3px;
      box-shadow: inset 0 -1px 0 #d1d5da;
    }
  `;

  // 更新当前选中的元素
  function updateSelection(newElement) {
    if (newElement instanceof HTMLElement) {
      // 移除旧元素的标记
      if (markBy === "id") {
        currentElement.removeAttribute("id");
      } else {
        currentElement.classList.remove("mainonly");
      }
      
      currentElement = newElement;

      // 为新元素添加标记
      if (currentElement.id) {
        markBy = "class";
        currentElement.classList.add("mainonly");
      } else {
        markBy = "id";
        currentElement.id = "mainonly";
      }
    }
  }

  // 鼠标悬停时更新选择
  function handleMouseOver(event) {
    updateSelection(event.target);
  }

  // 点击时最终确定选择
  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation(); // 阻止事件冒泡

    // 给所有父元素添加一个临时 class
    (function addParentClass() {
      for (var el = currentElement; el && el.parentElement; el = el.parentElement) {
        el.parentElement.classList.add("mainonly_parents");
      }
    })();

    // 注入最终样式，隐藏其它所有元素
    if (markBy === "id") {
      highlightStyle.textContent = `
        * { visibility: hidden !important; }
        #mainonly, #mainonly *, .mainonly_parents { visibility: visible !important; }
        .mainonly_parents { display: block !important; }
      `;
    } else {
      highlightStyle.textContent = `
        * { visibility: hidden !important; }
        .mainonly, .mainonly *, .mainonly_parents { visibility: visible !important; }
        .mainonly_parents { display: block !important; }
      `;
    }

    cleanupListeners();
    cleanupUI();
  }

  // 移除指南UI
  function cleanupUI() {
    guideDiv.remove();
    guideStyle.remove();
  }
  
  // 移除所有事件监听器
  function cleanupListeners() {
    document.removeEventListener("mouseover", handleMouseOver);
    document.removeEventListener("click", handleClick, true); // 使用捕获模式
    document.removeEventListener("wheel", handleWheel, { passive: false });
    document.removeEventListener("keydown", handleKeyDown);
  }

  // 处理键盘事件
  function handleKeyDown(event) {
    if (event.key === "Escape") {
      highlightStyle.remove();
      document.querySelectorAll(".mainonly_parents").forEach(el => el.classList.remove("mainonly_parents"));
      if (markBy === "id") {
        currentElement.removeAttribute("id");
      } else {
        currentElement.classList.remove("mainonly");
      }
      cleanupListeners();
      cleanupUI();
    } else if (event.key === "," || event.key === "-") {
      if (currentElement.parentElement) updateSelection(currentElement.parentElement);
    } else if (event.key === "." || event.key === "=") {
      const hoveredElements = currentElement.querySelectorAll(":hover");
      const lastHovered = hoveredElements[hoveredElements.length - 1];
      if (lastHovered && currentElement.contains(lastHovered)) {
          updateSelection(lastHovered);
      }
    }
  }

  // 处理滚轮事件
  function handleWheel(event) {
    event.preventDefault();
    if (event.deltaY < 0) { // 向上滚
      if (currentElement.parentElement) updateSelection(currentElement.parentElement);
    } else { // 向下滚
      const hoveredElements = currentElement.querySelectorAll(":hover");
      const lastHovered = hoveredElements[hoveredElements.length - 1];
       if (lastHovered && currentElement.contains(lastHovered)) {
          updateSelection(lastHovered);
      }
    }
  }

  // 绑定初始事件监听器
  document.addEventListener("mouseover", handleMouseOver);
  // 使用捕获模式来确保我们的 click 事件先于页面上其他的 click 事件执行
  document.addEventListener("click", handleClick, { capture: true, once: true });
  document.addEventListener("wheel", handleWheel, { passive: false });
  document.addEventListener("keydown", handleKeyDown);

})();
