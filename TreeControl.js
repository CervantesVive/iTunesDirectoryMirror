function TreeControl(elm){
    this.elm = elm;
    this.tree = null;
}

TreeControl.prototype.renderFromData = function(data){
    this.tree = new YAHOO.widget.TreeView(this.elm, data);
    this.tree.render();
};