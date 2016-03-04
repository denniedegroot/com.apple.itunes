"use strict";

var types = require('./content-types.json')

function getContentType(itemType) {
    return types.filter(function (item) {
        return item.code === itemType
    })[0]
}

function addProperty(object, key, value, contentType) {
    var typeName = contentType.name;

    if (contentType.type == 'list')
        key = typeName;

    if (object instanceof Array) {
        var item = {};
        item[typeName] = value;
        object.push(item);
    } else if (object[key] != null) {
        var array = [];
        var item1 = {};
        var item2 = {};

        item1[key] = object[key];
        item2[key] = value;
        array.push(item1, item2);
        object = array;
    } else {
        object[key] = value;
    }

    return object;
}

function decode(buffer) {
    var output = {};

    for (var i = 0; i < buffer.length;) {
        var itemType = buffer.slice(i, i + 4).toString()
        var outputKey = itemType.toString()
        var itemLength = buffer.slice(i + 4, i + 8).readUInt32BE(0)
        var contentType = getContentType(itemType);

        if (contentType) {
            var parsedData = null

            if (itemLength != 0) {
                var data = buffer.slice(i + 8, i + 8 + itemLength)
                parsedData = null

                try {
                    if (contentType.type === 'byte') {
                        parsedData = data.readUInt8(0)
                    } else if (contentType.type === 'date') {
                        parsedData = data.readIntBE(0, 4)
                    } else if (contentType.type === 'short') {
                        parsedData = data.readUInt16BE(0)
                    } else if (contentType.type === 'int') {
                        parsedData = data.readUInt32BE(0)
                    } else if (contentType.type === 'long') {
                        parsedData = data.readIntBE(0, 8)
                    } else if (contentType.type === 'list') {
                        output = addProperty(output, outputKey, decode(data), contentType);
                    } else {
                        parsedData = data.toString()
                    }
                } catch (e) {
                    console.log('error on %s', itemType)
                    console.error(e)
                }
            }

            if (parsedData != null)
                output[contentType.name] = parsedData;
        } else {
            console.error('Unknown ContentType: %s', itemType)
        }

        i += 8 + itemLength
    }
    return output
}

module.exports.decode = decode
