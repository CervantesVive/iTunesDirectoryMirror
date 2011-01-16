function initApp(air, parser, console, tree) {

    //handle file browse
    (function (){

        var consoleElm = document.getElementById('console');
        var selection = document.getElementById('selection');

        var btnBrowse = document.getElementById('browse');
        btnBrowse.addEventListener('click', doBrowse);

        var filters = [
            new air.FileFilter('iTunes XML', '*iTunes*.xml')
        ];

        var file = (function filecheck() {
            var os = air.Capabilities.os.toLowerCase();
            var file = new air.File();
            if(os.indexOf("mac os ")>=0){
                file.nativePath = air.File.userDirectory.nativePath + "/Music/iTunes";
            }else if(os.indexOf("windows ")>=0){
                var paths = [
                    air.File.userDirectory.nativePath + "\\My Documents\\My Music\\iTunes",	//XP
                    air.File.userDirectory.nativePath + "\\Music\\iTunes",	//Vista
                    air.File.userDirectory.nativePath + "\\My Music\\iTunes",	//W7
                    air.File.userDirectory.nativePath	//default
                ];
                for(var x=0;x<paths.length;x++){
                    file.nativePath = air.File.userDirectory.nativePath + "\\My Documents\\My Music\\iTunes";
                    if(file.exists) break;
                }
            }
            return file;
        })();

        function doBrowse() {
            file.addEventListener(air.Event.SELECT, doSelect);
            file.browseForOpen( 'Select iTunes XML', filters );
        }

        function doSelect() {
            file.removeEventListener(air.Event.SELECT, doSelect);
            btnBrowse.removeEventListener('click', doBrowse);

            selection.className = 'ui-state-hidden';
            consoleElm.className = '';
            parser.parse(file, function (data){
                document.getElementById('createLocation').className = '';
                document.getElementById('treeContainer').className = '';

                tree.renderFromData(data);
            });
        }
    })();

    //handle copy location select
    (function(){
        var directory = air.File.documentsDirectory;

        var btnCreateLocation = document.getElementById('createLocation');
        btnCreateLocation.addEventListener('click', function(){
            directory.addEventListener(air.Event.SELECT, doSelectDirectory);
            directory.browseForDirectory('Select Destination');
        });

        function doSelectDirectory(event){
            var directory = event.target;
            var paths = parser.getPaths();
            var sourceFile = air.File.applicationDirectory.resolvePath('sample.mp3');
            for(var x=0;x<paths.length;x++){
                var subPath = decodeURIComponent(paths[x].substr(17).replace(':', 'Drive'));
                var destinationFile = directory.resolvePath(subPath);
                sourceFile.copyTo(destinationFile, false);
            }

            //TDO: map the given paths into the chosen directory....
            ///..../tmp/localhost/c:/My Documents/Music/iTunes Music/
        }

    })();


}
