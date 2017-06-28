/**
 * Created by Pawan on 6/8/2016.
 */
mainApp.directive("editholdmusic", function ($filter,$uibModal,holdMusicBackendService) {

    return {
        restrict: "EAA",
        scope: {
            holdmusic: "=",
            'updateholdmusic': '&',
            'reloadpage':'&'
        },

        templateUrl: 'views/hold-music/partials/editHoldMusic.html',

        link: function (scope) {


            scope.showAlert = function (title,content,type) {

                new PNotify({
                    title: title,
                    text: content,
                    type: type,
                    styling: 'bootstrap3'
                });
            };



            scope.editMode = false;
            scope.fileList={};
            scope.getFileList = function () {
                holdMusicBackendService.getHoldMusicFiles().then(function (response) {

                    if(response.data.IsSuccess)
                    {
                        scope.fileList=response.data.Result;
                    }
                    else
                    {
                        console.log("Error in Listing music files "+response.data.Exception);
                    }

                }, function (error) {
                    console.log("Exception in Listing music files "+error);
                })
            };

            scope.editHoldMusic = function () {
                scope.editMode = !scope.editMode;
                scope.getFileList();
                console.log(scope.holdmusic);
            };

            scope.updateHoldMusicDetails = function () {

                if(scope.holdmusic.AnnouncementTime=="" || scope.holdmusic.AnnouncementTime==null)
                {
                    scope.holdmusic.AnnouncementTime=0;
                }
                holdMusicBackendService.updateHoldMusicFiles(scope.holdmusic).then(function (response) {
                    if(response.data.IsSuccess)
                    {
                        scope.showAlert("Success","Updated successfully","success")
                        scope.reloadpage();

                    }
                    else
                    {
                        console.info("Error in updating app "+response.data.Exception);
                        scope.showAlert("Error","Error in updating","error");
                    }

                }, function (error) {
                    console.info("Error in updating application "+error);
                    scope.showAlert("Error","Error in updating","error");
                });
            };


            scope.removeHoldMusic = function (item) {

                scope.showConfirm("Delete Record", "Delete", "ok", "cancel", "Do you want to delete " + scope.holdmusic.Name, function (obj) {

                    holdMusicBackendService.removeHoldMusicFiles(scope.holdmusic).then(function (response) {
                        if (response) {
                            scope.updateholdmusic(item);
                            scope.showAlert("Deleted", "File " + item.Name + " Deleted successfully","success");
                        }
                        else
                            scope.showAlert("Error", "Error in deleting ","error");
                    }, function (error) {
                        scope.showAlert("Error", "Error in deleting ","error");
                    });

                }, function () {

                }, item);


            };

            scope.showConfirm = function (tittle, label, okbutton, cancelbutton, content, OkCallback, CancelCallBack, okObj) {

                (new PNotify({
                    title: tittle,
                    text: content,
                    icon: 'glyphicon glyphicon-question-sign',
                    hide: false,
                    confirm: {
                        confirm: true
                    },
                    buttons: {
                        closer: false,
                        sticker: false
                    },
                    history: {
                        history: false
                    }
                })).get().on('pnotify.confirm', function () {
                        OkCallback("confirm");
                    }).on('pnotify.cancel', function () {

                    });

            };




            scope.cancelUpdate = function () {
                scope.editMode = false;
            };

            scope.makeFirstAnnounementEmpty =function()
            {
                scope.holdmusic.FirstAnnounement =null;
            };
            scope.makeMOHEmpty=function()
            {
                scope.holdmusic.MOH =null;
            };
            scope.makeAnnouncementEmpty=function()
            {
                scope.holdmusic.Announcement =null;
            };





        }

    }
});