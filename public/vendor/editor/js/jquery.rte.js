/*
* jQuery RTE plugin 0.5.1 - create a rich text form for Mozilla, Opera, Safari and Internet Explorer
*
* Copyright (c) 2009 Batiste Bieler
* Distributed under the GPL Licenses.
* Distributed under the MIT License.
*/

// define the rte light plugin
(function($) {

if(typeof $.fn.rte === "undefined") {

    var defaults = {
        media_url: "",
        content_css_url: "",
        dot_net_button_class: null,
        type: 0
    };

    $.fn.rte = function(options) {

    $.fn.rte.html = function(iframe) {
        return iframe.contentWindow.document.getElementsByTagName("body")[0].innerHTML;
    };

    // build main options before element iteration
    var opts = $.extend(defaults, options);

    // iterate and construct the RTEs
    return this.each( function() {
        var textarea = $(this);
        var iframe;
        var element_id = textarea.attr("id");

        // enable design mode
        function enableDesignMode() {

            var content = textarea.val();

            // Mozilla needs this to display caret
//            if($.trim(content)=='') {
//                content = '<br />';
//            }

            // already created? show/hide
            if(iframe) {
                console.log("already created");
                textarea.hide();
                $(iframe).contents().find("body").html(content);
                $(iframe).show();
                $("#toolbar-" + element_id).remove();
                textarea.before(toolbar());
                return true;
            }

            // for compatibility reasons, need to be created this way
            iframe = document.createElement("iframe");
            iframe.frameBorder=0;
            iframe.frameMargin=0;
            iframe.framePadding=0;
            iframe.height=200;
            if(textarea.attr('class'))
                iframe.className = textarea.attr('class');
            if(textarea.attr('id'))
                iframe.id = element_id;
            if(textarea.attr('name'))
                iframe.title = textarea.attr('name');

            textarea.after(iframe);

            var css = "";
            if(opts.content_css_url) {
                css = "<link type='text/css' rel='stylesheet' href='" + opts.content_css_url + "' />";
            }

            var doc = "<html><head>"+css+"</head><body class='frameBody'>"+content+"</body></html>";
            tryEnableDesignMode(doc, function() {
                $("#toolbar-" + element_id).remove();
                textarea.before(toolbar());
                // hide textarea
                textarea.hide();

            });

        }

        function tryEnableDesignMode(doc, callback) {
            if(!iframe) { return false; }

            try {
                iframe.contentWindow.document.open();
                iframe.contentWindow.document.write(doc);
                iframe.contentWindow.document.close();
            } catch(error) {
                //console.log(error);
            }
            if (document.contentEditable) {
                iframe.contentWindow.document.designMode = "On";
                callback();
                return true;
            }
            else if (document.designMode != null) {
                try {
                    iframe.contentWindow.document.designMode = "on";
                    callback();
                    return true;
                } catch (error) {
                    //console.log(error);
                }
            }
            setTimeout(function(){tryEnableDesignMode(doc, callback)}, 500);
            return false;
        }

        function disableDesignMode(submit) {
            var content = $(iframe).contents().find("body").html();

            if($(iframe).is(":visible")) {
                textarea.val(content);
            }

            if(submit !== true) {
                textarea.show();
                $(iframe).hide();
            }
        }

        // create toolbar and bind events to it's elements
        function toolbar() {
            var tb;
                $(".editor").css("padding-bottom","85px");
                tb = $("<div><input class='editor_title'></div>\
                <div class='rte-toolbar' id='toolbar-"+ element_id +"'><div>\
                <p>\
                    <span class='bold'><img src='data:image/gif;base64,R0lGODlhGAAYAMZGAAAAAAEBAQICAgMDAw8PDxERESMjIyUlJSwsLC4uLjk5OT09PUBAQEZGRkpKSkxMTFlZWWFhYWRkZGVlZXFxcXp6en9/f4WFhYyMjJOTk5eXl56enqampqqqqri4uLu7u729vb+/v8nJyc7OztXV1dnZ2dvb2+Dg4OHh4eLi4uPj4+Tk5OXl5ebm5ufn5+jo6Onp6erq6uvr6+zs7O3t7e7u7u/v7/Dw8PHx8fLy8vPz8/T09PX19fb29vf39/j4+Pn5+fr6+vv7+/z8/P39/f7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////yH+FUNyZWF0ZWQgd2l0aCBUaGUgR0lNUAAh+QQBCgB/ACwAAAAAGAAYAAAH/oB/AIOEhYaGf4kAKTmNOTqQO5I8lD09Pj47JgCKNycnKCkqKywtLi8vMDEyMzQ1NjScgjkooaOlp6qrra83OLIAOaK3LRmFGrw2vjnAOre4C4UMrso4j82kpi4jAYUBJNWPO824qRWDAoQWONY6OzzAO6apMQaDCvYAB4/uPD3xuWJ4IFRBAqEQ7/z5AMaDnowIhD5wIDRBoY8fDFXJYEFgEAEaKwYMKnDj4g8gDHdtIPSgkQJCHE4GCQKsBysaDQ4VcgAkiJAhwHzQoFFCpM5BA1b8JBL01QVCFN5dgkAIwxAiRYD98IXg4KWTHQglKGLEiNZ2k772XIq1rFlFK436Wbq49ipZtzOAiaDxQ+EPmUvvlq0BQpago4gHJVrMuLHjx5AjS54sORAAOw==' alt='bold' /></span>\
                </p>\
                <p>\
                    <span class='link'><img src='data:image/png;base64,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' alt='link' /></span>\
                    <span class='image'><img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADkElEQVRIie2VTUxcVRTHf+e894Y3D2YYPoYp0kaBim0ooDFRM/gRG1NXNXHtogvdaHVj/IgLFyZd6M7U2ERcNKYmNlqbmjAhKVFrCk2MFGnRhtpGaIFSkDLt0AGmnXevi+EjiIkbceVZ3eTenN///M/JuWKtZTNDNzX7fwFwM5nMpnrkAqTTnZuS/MyZ/hIAoPrFUdq3l7HSc2MMDhAigAFKfooqYFELdvmMKCoWURdHLeeuFLl+sGGtAoBHW+N0bIsQWnAwGMAiOBhWPBRApZQ0tKAqYMGqoKKIgKNK4IfrLQIo832ciKKhAfXQZdUryi2rYgHFFYu1iqgFARXBiuCogxuYjYBIhY/vW8K7BuMpagWLLem2RRTFOoraEIsioqiAiMWoImJRcVCFoJwVSWuAisDF88H1QSxYDKoKxkAshQOY+SxWXFRLb0QMVhzUCqqCEfDUJRYAFNYDYtEyYr7BWjAIaIgYhZqA4vAPGCdBzc4OFrILyw3VUqMFVCxGHCQU1BWqKr2NgHhFGdHoXWzJUkLj4GyJ4A79SO1wF4d7x+g81E9dbcDifLE0OVoyQkWIlguVKYiWQ2F0bVTXAIEQ+B7WWqwxuEmXxcvj3Dn5IbOp+9n3XIxMz0n2vL+H+ZzLrRtQKEAkBl4Mpich8/nXXBn6jr6jh3htLvsXQDQkiBgEkMADAzXDn/J7vJG2thZmsxUMf/IBb104RlV9Cy+8/gbxWrh8doxfvvqI6PxVZGqCHRUeZ8v+poIaJ8/W2jhRH5w4TH/WhUSiZL2bHDj8BX3nfuWl5x/g+JfdTOemyHS9ybbme3k53Ul8Jk/rg23cTt7H5I0siYb+jYBifpbB3lOMXh+nv+cY5/tOrT5qbtrBq88+zu3FceqaEjj5gJowQt7kOH1xnIcb2zjyfQ+7Uk145QV2Ru/ZCPj4lf3MXpvkocfaqY008O7bB9je0srFny+wYO+QTFSxNZHm6UeSHM98wxNPPsPA4ABN7VuYGZ4kWd/Ikf6feG//O/SeGNkISLYOsHffbuxSHi+WozookitcItF0C39pnqn8IpMjBcauTlPp+5wYusRTnR3s3V3PwZvf0pGsJlXTwuC1o2j6t1WAdHd323S6k+rqKmgGFkoX5QKBAxLCTAhtKbAVMLEA4RLUVcEfOchNgFddWiG7KmGhHEZOw9xcdv02nVseq387XCjt7c0K+f/T/6f4ExgdSKay8Yz/AAAAAElFTkSuQmCC' alt='image' /></span>\
                    <span class='video'><img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAClUlEQVRIS92VX0hTYRjGn7OsTbdjc+a68CIsDLywqIGhEIhj3oS0C6Pp2l1LdIWFV0pMgkBvtDAMSrBQhEFzFYRjaUZMGUVaI8opSH+Q+Qe3pWscz6Zn7WxMOW7rDGw3nsuX9/t+3/u87/MeAhn+iAzfj30CqKqqOsYwTN7/lEsgEPjGx8d/EgqF4qC8oMCvUqmETqcTs/lKhOUlvKwQ9Qdr7nlOnsT/HWez3SgtLYXVaqW9Ph9JVFZWivJlMupxXx8e9vbCVmiATCbjBSz4gellblrB8iRajkxAr9dDW1+PDZrOjgIOCARUPJXWPksLMOcDXJ5EwKlp43Zwi2FiAIlYTF3WaDBht+PruQ4OINv9HjleF1aP14DI2ans8wrwaz0RcCkwhPKKCgwODCAYCsUAeVIp1dHZGQ2+O9HCARTODuK2Tomhl6Nw+kTwn1QDWULYFwDfRiLAIB6Fpq4ON5ub05OIBdzVX4jetOrx4OnzMcwQxXhBKCMRro3YHiSVKJckqSaDAdaREUydbk+oIA6Iv3dmbh73hidhkV9HmMjaLoMF6BgLqqur0d3VtSPR4dxcqrWtDcNmMxwlrbyAbxHA/RSAq1mvcFGtRrvRCDoY5J+i3RI9Mo9hZL0Yrohf0paIr4J4kz96RLAcUmNTIEzqE1aipBWQEgl1raEBr202fDpzJ+mYrhTVYNIrw286tQdZgHbTDKVSiQc9PTs94DMaEwamloDFwL8NnnKKWB90dXfjSX8/3hbd4lQQ3AI+LALeXTOfDMUCbpBvcEWnQ1NjY8wH7LI7Kpf7a2trhQ6HA1/I85xl51/6ATqwxrub2AR22ZVLPSgrK4PJZKI9Xi8ZdUpG13VaT9tD0j75Ze5BAd6jfwGH/UHE3ST8tAAAAABJRU5ErkJggg==' alt='video'></span>\
                    <span class='submit' ng-click='submit()'>提交</span>\
                </p>\
                <span class='close right'><img src='data:image/gif;base64,R0lGODlhGAAYAIABAAAAAP///yH+FUNyZWF0ZWQgd2l0aCBUaGUgR0lNUAAh+QQBCgABACwAAAAAGAAYAAACLIyPqcvtD6OcdAJ1aTag69x5XxBWZLhVpXmuH5pCKyq5bbzYHM72/g8MCikFADs=' alt='close rte' /></span>\
                </div></div>");

            $('.bold', tb).click(function(){ formatText('bold');return false; });
//            $('.unorderedlist', tb).click(function(){ formatText('insertunorderedlist');return false; });
            $('.link', tb).click(function(){
                var p=prompt("网站地址:");
                if(p)
                    formatText('CreateLink', p);
                return false; });

            $('.image', tb).click(function(){
                var p=prompt("图片地址:");
                if(p)
                    formatText('InsertImage', p);
                return false; });
            $('.video',tb).click(function(){
                var p=prompt("视频地址");
                if(p)
                    formatText('insertHTML',p);
                return false;
            });

            // .NET compatability
            if(opts.dot_net_button_class) {
                var dot_net_button = $(iframe).parents('form').find(opts.dot_net_button_class);
                dot_net_button.click(function() {
                    disableDesignMode(true);
                });
            // Regular forms
            } else {
                $(iframe).parents('form').submit(function(){
                    disableDesignMode(true);
                });
            }

            var iframeDoc = $(iframe.contentWindow.document);

            var select = $('select', tb)[0];
            iframeDoc.keyup(function() {
                var body = $('body', iframeDoc);
                if(body.scrollTop() > 0) {
                    var iframe_height = parseInt(iframe.style['height'])
                    if(isNaN(iframe_height))
                        iframe_height = 0;
                    var h = Math.min(opts.max_height, iframe_height+body.scrollTop()) + 'px';
                    iframe.style['height'] = h;
                }
                return true;
            });

            return tb;
        };

        function formatText(command, option) {
//            iframe.contentWindow.focus();
            try{
                iframe.contentWindow.document.execCommand(command, false, option);
                if(command==='CreateLink'){
                    $(".editor iframe").contents().find("body a:last").attr("target","_bank");
                }
            }catch(e){
//                console.log(e);
            }
//            iframe.contentWindow.focus();
        };

        function getSelectionElement() {
            if (iframe.contentWindow.document.selection) {
                // IE selections
                selection = iframe.contentWindow.document.selection;
                range = selection.createRange();
                try {
                    node = range.parentElement();
                }
                catch (e) {
                    return false;
                }
            } else {
                // Mozilla selections
                try {
                    selection = iframe.contentWindow.getSelection();
                    range = selection.getRangeAt(0);
                }
                catch(e){
                    return false;
                }
                node = range.commonAncestorContainer;
            }
            return node;
        };
        
        // enable design mode now
        enableDesignMode();

    }); //return this.each
    
    }; // rte

} // if

})(jQuery);
