function saveOptions(e) {
  e.preventDefault();

  const blacklistItems = [];
  const whitelistItems = [];
  const blacklist = document.querySelector("#blacklist");
  const whitelist = document.querySelector("#whitelist");
  const blackItems = blacklist.querySelectorAll("li");
  const whiteItems = whitelist.querySelectorAll("li");

  blackItems.forEach((li) => {
    const textContent = li.firstChild.textContent.trim();
    blacklistItems.push(textContent);
  });

  whiteItems.forEach((li) => {
    const textContent = li.firstChild.textContent.trim();
    whitelistItems.push(textContent);
  });

  browser.storage.local.set({
    proxySettings: {
      type: document.querySelector("#type").value,
      host: document.querySelector("#host").value,
      port: document.querySelector("#port").value,
      username: document.querySelector("#username").value,
      password: document.querySelector("#password").value,
      proxyDNS: document.querySelector("#dns").checked,
    },
    skipLocal: document.querySelector("#skiplocal").checked,
    useBlacklist: document.querySelector("#black").checked,
    useWhitelist: document.querySelector("#white").checked,
    blacklist: blacklistItems,
    whitelist: whitelistItems,
  });
}

function restoreOptions(e) {
  function onGot(item) {
    document.querySelector("#host").value = item.proxySettings.host;
    document.querySelector("#port").value = item.proxySettings.port;
    document.querySelector(
      '#type [value="' + item.proxySettings.type + '"]',
    ).selected = true;
    document.querySelector("#username").value = item.proxySettings.username;
    document.querySelector("#password").value = item.proxySettings.password;
    document.querySelector("#dns").checked = item.proxySettings.proxyDNS;
    document.querySelector("#skiplocal").checked = item.skipLocal;
    document.querySelector("#black").checked = item.useBlacklist;
    document.querySelector("#white").checked = item.useWhitelist;

    if (item.blacklist && Array.isArray(item.blacklist)) {
      item.blacklist.forEach(function (itemText) {
        addBlacklistItem(itemText);
      });
    }

    if (item.whitelist && Array.isArray(item.whitelist)) {
      item.whitelist.forEach(function (itemText) {
        addWhitelistItem(itemText);
      });
    }

    typeChanged(e);
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var gettingItem = browser.storage.local.get({
    skipLocal: true,
    proxySettings: {
      type: "direct",
      host: "",
      port: 0,
      username: "",
      password: "",
      proxyDNS: false,
    },
    useBlacklist: true,
    useWhitelist: false,
    blacklist: [],
    whitelist: [],
  });

  gettingItem.then(onGot, onError);
}

function typeChanged(e) {
  var type = document.querySelector("#type").value;
  var dnsDisplay = "none";
  if (type == "socks" || type == "socks4") dnsDisplay = "table-row";
  else document.querySelector("#dns").checked = false;
  document.querySelector("#dnsrow").style.display = dnsDisplay;
  saveOptions(e);
}

function initBlacklist() {
  const inputField = document.getElementById("inputFieldBlack");
  const addButton = document.getElementById("addButtonBlack");

  function addItem(e) {
    const itemText = inputField.value.trim();

    if (itemText !== "") {
      if (isValidUrlPattern(itemText)) {
        addBlacklistItem(itemText);
        inputField.value = "";
        inputField.focus();
        saveOptions(e);
      } else {
        alert("Invalid URL");
      }
    }
  }

  addButton.addEventListener("click", (e) => {
    e.preventDefault();
    addItem(e);
  });

  inputField.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(e);
    }
  });
}

function initWhitelist() {
  const inputField = document.getElementById("inputFieldWhite");
  const addButton = document.getElementById("addButtonWhite");

  function addItem(e) {
    const itemText = inputField.value.trim();

    if (itemText !== "") {
      if (isValidUrlPattern(itemText)) {
        addWhitelistItem(itemText);
        inputField.value = "";
        inputField.focus();
        saveOptions(e);
      } else {
        alert("Invalid URL");
      }
    }
  }

  addButton.addEventListener("click", (e) => {
    e.preventDefault();
    addItem(e);
  });

  inputField.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(e);
    }
  });
}

function isValidUrlPattern(pattern) {
  return true;
  const urlPattern =
    /^(https?:\/\/)?([^\s\/:*]+|\*)(\.[^\s\/:*]+|\*)*(\/[^\s:*]*)*$/;
  return urlPattern.test(pattern);
}

function addBlacklistItem(itemText) {
  const blacklist = document.getElementById("blacklist");
  const listItems = blacklist.getElementsByTagName("li");

  for (let i = 0; i < listItems.length; i++) {
    if (listItems[i].firstChild.textContent.trim() === itemText) {
      alert("Already exists.");
      return;
    }
  }

  const li = document.createElement("li");
  li.textContent = itemText;

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.className = "removeButton";

  removeButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    blacklist.removeChild(li);
    saveOptions(e);
  });

  li.appendChild(removeButton);

  li.addEventListener("click", () => {
    document.getElementById("inputFieldBlack").value = itemText;
  });

  blacklist.appendChild(li);
}

function addWhitelistItem(itemText) {
  const whitelist = document.getElementById("whitelist");
  const listItems = whitelist.getElementsByTagName("li");

  for (let i = 0; i < listItems.length; i++) {
    if (listItems[i].firstChild.textContent.trim() === itemText) {
      alert("Already exists.");
      return;
    }
  }

  const li = document.createElement("li");
  li.textContent = itemText;

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.className = "removeButton";

  removeButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    whitelist.removeChild(li);
    saveOptions(e);
  });

  li.appendChild(removeButton);

  li.addEventListener("click", () => {
    document.getElementById("inputFieldWhite").value = itemText;
  });

  whitelist.appendChild(li);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.addEventListener("DOMContentLoaded", initBlacklist);
document.addEventListener("DOMContentLoaded", initWhitelist);
document.querySelector("#type").addEventListener("change", typeChanged);
document.querySelector("#host").addEventListener("blur", saveOptions);
document.querySelector("#port").addEventListener("blur", saveOptions);
document.querySelector("#port").addEventListener("change", saveOptions);
document.querySelector("#username").addEventListener("blur", saveOptions);
document.querySelector("#password").addEventListener("blur", saveOptions);
document.querySelector("#dns").addEventListener("change", saveOptions);
document.querySelector("#skiplocal").addEventListener("change", saveOptions);
document.querySelector("#white").addEventListener("change", saveOptions);
document.querySelector("#black").addEventListener("change", saveOptions);
