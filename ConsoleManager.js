function ConsoleManager(enclosure){
    var list = enclosure.getElementsByTagName('ol');
    if(list.length===0){
        this.list = document.createElement('ol');
        enclosure.appendChild(this.list);
    }else{
        this.list = list[0];
    }
}

ConsoleManager.prototype.logMessage = function(message){
    var entry = document.createElement('li');
    entry.innerHTML = message;
    this.list.appendChild(entry);
};