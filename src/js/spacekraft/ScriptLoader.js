const ScriptLoader = function () {
    function _add(basepath,urls,loadingManager) {
        var promises = [];
        if(urls && urls.length>0){
            for(var i in urls){
                
                (function(url){
                    var promise = new Promise(function(resolve, reject) {
                        loadingManager && urls && loadingManager.itemStart(url);
                        var script = document.createElement('script');
                        script.src = url;
            
                        script.addEventListener('load', function() {
                            loadingManager && loadingManager.itemEnd(url);
                            console.log("Loaded: "+url);
                            resolve(url);
                        }, false);
            
                        script.addEventListener('error', function() {
                            console.log("Error: "+url);
                            loadingManager && loadingManager.itemEnd(url);
                            reject(url);
                        }, false);
            
                        document.body.appendChild(script);
                    });
            
                    promises.push(promise);
            })(basepath+urls[i]);
            }
        }
        return promises;
    }

    this.load = function(basepath,urls,loadingManager) {

        var promise = null;
        basepath = !basepath?"":basepath;
        if(urls && urls.length>0){
            for(var i in urls){
                (function(basepath,item){
                    if(promise){
                        promise = promise.then(function(){
                            console.log('loaded');
                            return Promise.all(_add(basepath,item,loadingManager)); 
                        });
                    }else{
                        promise = Promise.all(_add(basepath,item,loadingManager));
                    }
                })(basepath,urls[i]);
            }
        }
        console.log(promise);
        // loadingManager && urls && loadingManager.itemsStart(urls.length);
        // var promises = _add(urls,loadingManager);
        // console.log(promises);
        return promise;
    };
}

export default ScriptLoader;