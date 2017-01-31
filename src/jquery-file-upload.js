/*
 * HTML5 File Upload jQuery Plugin
 *
 * Copyright 2017 Tom Ellis | MIT Licensed (license.txt)
 */
(function($) {

    $.uploadFiles = function(files, options) {

        var reader,
            dfd = new jQuery.Deferred(),
            i = 0,
            failedImages = [],
            successImages = [],
            fileLength = files.length,
            opts = $.extend({}, $.uploadFiles.defaults, options);

        $.each(files, function(index, file) {

            var formData = new FormData();

            formData.append(opts.submitName, 'true');
            formData.append(opts.fileName, file);

            reader = new FileReader();

            reader.onload = (function(file, outer) {

                return function(evt) {

                    var retData = {};

                    $.ajax({
                        type: 'POST',
                        cache: false,
                        url: opts.url,
                        processData: false,
                        contentType: false,
                        //timeout: 10000,
                        data: formData,
                        dataType:'json',
                        xhr: function() {
                            var xhr = new window.XMLHttpRequest();

                            xhr.upload.onprogress = function(e) {
                                if (e.lengthComputable) {
                                    var percentage = Math.round( ( e.loaded * 100 ) / e.total );

                                    dfd.notify(index, file.name, percentage );
                                }
                            };

                            xhr.upload.oncomplete = function(e) {
                                dfd.notify(index, file.name, 100 );
                            };

                            return xhr;
                        },
                        error: function(jqhxr, status, errorThrown) {

                            failedImages.push({
                                index: index,
                                fileName: file.name,
                                status: status
                            });
                        },
                        success: function(data, textStatus, jqXHR) {
                            retData = data;
                            successImages.push({
                                index: index,
                                fileName: file.name,
                                data: data,
                                status: status
                            });
                        },
                        complete: function(jqXHR) {
                            i++;

                            if (i === fileLength) {
                                dfd.resolve(successImages, failedImages);
                            }
                        }

                    });
                };

            })( file );

            reader.readAsDataURL(file);
        });

        return dfd.promise();
    };

    // "image/gif image/pjpeg image/jpg image/jpeg image/png image/x-png".split(" ")

    $.uploadFiles.defaults = {
        fileTypes : [],
        url: null,
        submitName: 'submit',
        fileName: 'files',
        postData :{}
    };

//$.fileReader()

})(jQuery);