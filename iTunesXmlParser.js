function iTunesXmlParser(air, console){
	//Create a hierarchichal structure by parsing file paths in iTunes XML
    this.air = air;
    this.tree = [];
    this.paths = [];
    this.console = console;
    this.xmlDoc = null;
    this.xmlLocationNodes = [];
}

iTunesXmlParser.prototype.getPaths = function(){
    return this.paths.concat([]);
};

iTunesXmlParser.prototype.fixPaths = function(pathMap, itunesFile){

    for(var x=0;x<this.xmlLocationNodes.length;x++){
        var location = this.xmlLocationNodes[x];
        var current = String(location.firstChild.nodeValue);
        if('undefined' !== typeof pathMap[current]){
            location.firstChild.nodeValue = pathMap[current];
        }
    }

    //serialize xml to new location
    var serializer = new XMLSerializer();
    var xml = serializer.serializeToString(this.xmlDoc);

    var stream = new this.air.FileStream();
    stream.open(itunesFile, this.air.FileMode.WRITE);
    stream.writeUTFBytes(xml);
    stream.close();
};

iTunesXmlParser.prototype.parse = function(iTunesFile, callback){

    function getItunesXmlString(xmlFile){
        var stream = new this.air.FileStream();
        stream.open(xmlFile, this.air.FileMode.READ);
        var xml = stream.readUTFBytes(stream.bytesAvailable);
        stream.close();

        this.xmlDoc = new DOMParser().parseFromString(xml, "text/xml");
        return this.xmlDoc;
    }

    function processLocations(xml){
        var keys = xml.getElementsByTagName("key");
        var len = keys.length;
        var locations = [];
        for(var x=0;x<len;x++){
            var val = String(keys[x].firstChild.nodeValue).toLowerCase();
            if(val === 'location'){
                locations.push(keys[x]);
            }
        }

        for(var y=0;y<locations.length;y++){
            var location = locations[y].nextSibling;
            if(location && location.nodeName === 'string'){
                this.addToTreeData(String(location.firstChild.nodeValue));
                this.xmlLocationNodes.push(location);
            }
        }
    }

    var xmlDoc = getItunesXmlString.apply(this, [iTunesFile]);
    processLocations.apply(this, [xmlDoc]);
    if('function' === typeof callback){
        callback(this.tree);
    }
};

iTunesXmlParser.prototype.addToTreeData = function(path){
    function getNodeFromList(list, nodeName){
        for(var x=0;x<list.length;x++){
            if(String(list[x].label) === String(nodeName)){
                return list[x];
            }
        }
        var node = {label: String(nodeName)};
        list.push(node);
        return node;
    }

    function addChildToNode(nodeList, arrSegments){
        var node = {};
        if(arrSegments.length === 1){ //leaf
            node = getNodeFromList.apply(this, [nodeList, arrSegments.splice(0,1)]);
            return;
        } else if(arrSegments.length > 1){ //branch
            node = getNodeFromList.apply(this,  [nodeList, arrSegments.splice(0,1)]);
            if('undefined' === typeof node.children){
                node.children = [];
            }
        }

        if(arrSegments.length === 0){
            return;
        }

        addChildToNode.apply(this, [node.children, arrSegments]);
    }

    if(path.substr(0, 17)!== 'file://localhost/'){
        return false;
    }
    var fixedPath;
    if(path.indexOf(":", 7)>=0){
        fixedPath = decodeURIComponent(path.substr(17));
    }else{
        fixedPath = decodeURIComponent(path.substr(16));
    }

    var file = new this.air.File();
    file.nativePath = fixedPath;
    if(!file.exists){
        return false;
    }
    this.paths.push(path);

    //create a tree representation of the path
    var segments = decodeURIComponent(path.substr(7)).split('/');
    addChildToNode.apply(this,  [this.tree, segments]);
};
