// 当扩展首次安装、更新或 Chrome 浏览器更新时运行
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "mainonly-focus",
    title: "只显示选定元素 (Focus Mode)",
    contexts: ["page", "selection", "link", "image"] // 在页面、选中的文本等处都显示
  });
});

// 监听所有右键菜单的点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // 确保是我们创建的菜单项被点击了
  if (info.menuItemId === "mainonly-focus") {
    // 在当前标签页中执行 content.js
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  }
});
