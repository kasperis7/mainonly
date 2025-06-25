// 当扩展首次安装时创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "mainonly-focus",
    title: "只显示选定元素 (Focus Mode)",
    contexts: ["page", "selection", "link", "image"]
  });
});

// 监听右键菜单的点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "mainonly-focus") {
    // 这是 Manifest V2 的脚本注入方式
    // 它与 V3 的 chrome.scripting.executeScript() 语法不同
    chrome.tabs.executeScript(tab.id, {
      file: "content.js"
    });
  }
});
