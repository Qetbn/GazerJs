/**
 * GazerJs storage manager
 */
if (typeof gazer === "undefined") {
    var gazer = {};
}

gazer.recorder.storageManager = {
    apiUrl: "/demo/api.php",
    lastItem: "",
    /**
     * Send whole data to server
     */
    sendData: function(data){
        /**
         * Remember last sent item
         */
        gazer.recorder.storageManager.lastItem = gazer.recorder.frames.length;
        /**
         * Send request to API
         */
        $.ajax({
            type: "POST",
            url: gazer.recorder.storageManager.apiUrl,
            data: {
                frames: JSON.stringify(gazer.recorder.frames)
            },
            success: gazer.recorder.storageManager.successCallback,
            error: gazer.recorder.storageManager.errorCallback
        });
        return true;
    },
    /**
     * If server recieved data
     */
    successCallback: function(){
        /**
         * Cut all items till lastItem
         */
        gazer.recorder.cutFrames(0,gazer.recorder.storageManager.lastItem);
        return true;
    },
    /**
     * If there's a problem
     */
     errorCallback: function() {
        return true;   
     }
};