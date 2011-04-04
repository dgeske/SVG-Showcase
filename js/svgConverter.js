"use strict";
/*global $ */
/*jslint white: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
var svgConverter = function (svgFileURL, paper) {
    var xml, 
	    makeRaphaelStop, 
		parseGradientStop,
		parseStyle;

    makeRaphaelStop = function (style, offset) {
        var color, tempStyle, i;

        style = style.split(';');

        for (i = 0; i < style.length; i = i + 1) {
            tempStyle = style[i].split(':');
            if (tempStyle[0] === 'stop-color') {
                color = tempStyle[1].replace(' ', '');
            }
        }

        offset = 100 * offset;


        return color + ':' + offset;
    };
    parseGradientStop = function (elements) {
        var style, offset, rStop = '0';

        $(elements).each(function () {
            $.each(this.attributes, function (i, attrib) {
                var name = attrib.name,
                    value = attrib.value;

                switch (name) {
                case 'style':
                    style = value;
                    break;
                case 'offset':
                    offset = value;
                    break;
                }

            });

            rStop += '-' + makeRaphaelStop(style, offset);
        });
        return rStop.replace('rStop:', '');

    };

    parseStyle = function (vars) {
        var attributes = [],
            i = 0,
            styleObj = {},
            tempStyle,
			fill,
			id;
        attributes = vars.split(';');
        for (i = 0; i < attributes.length; i = i + 1) {
            tempStyle = attributes[i].split(':');
            styleObj[tempStyle[0]] = tempStyle[1];
            if (tempStyle[0] === 'fill') {
                id = /#[a-zA-Z0-9]*/.exec(tempStyle[1]);
                if (id && $(xml).find(id[0]).length) {

                    fill = $(xml).find(id[0]);
                    fill = $(xml).find($(fill).attr('xlink:href'));
                    styleObj.fill = parseGradientStop($(fill).find('stop'));
                }

            }



        }

        return styleObj;
    };

    $.ajax({
        url: svgFileURL,
        cache: false,
        success: function (data) {
            xml = data;
            $(data).find('path').each(function () {
                var p;
                p = paper.path($(this).attr('d'));
                p.attr(parseStyle($(this).attr('style')));


            });

            $(data).find('rect').each(function () {
                var rect = paper.rect(),
                    rectAttr = {};

                $.each(this.attributes, function (i, attrib) {
                    var name = attrib.name,
                        value = attrib.value;

                    rectAttr[name] = value;
                });

                rect.attr(rectAttr);

            });
        }
    });
};