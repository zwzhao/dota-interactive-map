function MenuPanel(panelId, openId, closeId, fullscreen) {
    this.panelId = panelId;
    this.openId = openId;
    this.closeId = closeId;
    this.fullscreen = fullscreen;
    this.initialize();
}
MenuPanel.prototype.initialize = function () {
    this.panel = document.getElementById(this.panelId);
    this.openBtn = document.getElementById(this.openId);
    this.closeBtn = document.getElementById(this.closeId);
    
    this.openBtn.addEventListener("click", this.open.bind(this), false);
    this.closeHandler = this.close.bind(this);
    this.closeBtn.addEventListener("click", this.closeHandler, false);
}
MenuPanel.prototype.open = function (evt) {
    this.panel.classList.add('expand-horizontal');
    this.panel.classList.remove('collapsed-horizontal');
    this.openBtn.classList.add('collapsed-horizontal');
    this.openBtn.classList.remove('expand-horizontal');
    this.otherMenu.close(evt);
}
MenuPanel.prototype.close = function (evt) {
    this.panel.classList.remove('expand-horizontal');
    this.panel.classList.add('collapsed-horizontal');
    this.openBtn.classList.remove('collapsed-horizontal');
    this.openBtn.classList.add('expand-horizontal');
    console.log('menu close', evt);
}
MenuPanel.prototype.createMenuPanelItem = function (layerDef, handler, inputType, inputName) {
    var optionId = layerDef.id;
    
    var menuItem = document.createElement('div');
        menuItem.classList.add('menu-item');
        menuItem.classList.add(inputName || 'data-layer');
        
    var menuItemCb = document.createElement('input');
        menuItemCb.setAttribute("type", inputType || "checkbox");
        if (inputType == "radio") {
            optionId = layerDef.group + '-' + layerDef.id;
            menuItemCb.setAttribute("name", inputName);
            menuItemCb.setAttribute("value", optionId);
        }
        menuItemCb.id = 'option-' + optionId;
        menuItemCb.setAttribute("data-layer-id", optionId);
        menuItemCb.addEventListener("change", handler, false);
    menuItem.appendChild(menuItemCb);
    
    var menuItemLbl = document.createElement('label');
        menuItemLbl.classList.add('checkbox');
        menuItemLbl.setAttribute("for", menuItemCb.id);
        menuItemLbl.innerHTML = layerDef.name;
    menuItem.appendChild(menuItemLbl);
    return menuItem;
}

function MenuControl(InteractiveMap) {
    this.InteractiveMap = InteractiveMap;
    this.leftPanel = new MenuPanel("menu-left", "menu-left-open-btn", "menu-left-close-btn");
    this.rightPanel = new MenuPanel("menu-right", "menu-right-open-btn", "menu-right-close-btn");
    this.leftPanel.otherMenu = this.rightPanel;
    this.rightPanel.otherMenu = this.leftPanel;
}
MenuControl.prototype.initialize = function (layerToggleHandler, baseLayerToggleHandler) {
    this.InteractiveMap.layerDefs.forEach(function (layerDef) {
        var group = layerDef.group;
        var menu = document.querySelector('#' + group + '-menu');
        var menuItem = MenuPanel.prototype.createMenuPanelItem(layerDef, layerToggleHandler);
        menu.appendChild(menuItem);
    });

    this.InteractiveMap.baseLayerDefs.forEach(function (layerDef) {
        var group = layerDef.group;
        var menu = document.querySelector('#base-' + group + '-menu');
        var menuItem = MenuPanel.prototype.createMenuPanelItem(layerDef, baseLayerToggleHandler, 'radio', 'base-layer');
        menu.appendChild(menuItem);
    });
}

module.exports = MenuControl;