'use strict';

var types = require('./content-types.json');

function getContentType(itemType) {
    return types.filter(function (item) {
        return item.code === itemType;
    })[0];
}

function addProperty(object, key, value, contentType) {
    var typeName = contentType.name;

    if (contentType.type == 'list') {
        key = typeName;
    }

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

/*
    @param buffer is a byte[]
    @returns nowplaying object
*/
function decode_nowplayingids(buffer) {
    var o = {};

    o.databaseId = 0;
    o.databaseId = (buffer[0] & 0xff) << 24;
    o.databaseId |= (buffer[1] & 0xff) << 16;
    o.databaseId |= (buffer[2] & 0xff) << 8;
    o.databaseId |= buffer[3] & 0xff;

    o.playlistId = 0;
    o.playlistId = (buffer[4] & 0xff) << 24;
    o.playlistId |= (buffer[5] & 0xff) << 16;
    o.playlistId |= (buffer[6] & 0xff) << 8;
    o.playlistId |= buffer[7] & 0xff;

    o.containerItemId = 0;
    o.containerItemId = (buffer[8] & 0xff) << 24;
    o.containerItemId |= (buffer[9] & 0xff) << 16;
    o.containerItemId |= (buffer[10] & 0xff) << 8;
    o.containerItemId |= buffer[11] & 0xff;

    o.trackId = 0;
    o.trackId = (buffer[12] & 0xff) << 24;
    o.trackId |= (buffer[13] & 0xff) << 16;
    o.trackId |= (buffer[14] & 0xff) << 8;
    o.trackId |= buffer[15] & 0xff;

    return o;
}

function decode(buffer) {
    var output = {};

    for (var i = 0; i < buffer.length;) {
        var itemType = buffer.slice(i, i + 4).toString();
        var outputKey = itemType.toString();
        var itemLength = buffer.slice(i + 4, i + 8).readUInt32BE(0);
        var contentType = getContentType(itemType);

        if (contentType) {
            var parsedData = null;

            if (itemLength != 0) {
                var data = buffer.slice(i + 8, i + 8 + itemLength);

                parsedData = null;

                try {
                    switch (contentType.type) {
                    case 'byte':
                        parsedData = data.readUInt8(0);
                        break;
                    case 'date':
                        parsedData = data.readIntBE(0, 4);
                        break;
                    case 'short':
                    case 'int':
                    case 'long':
                        switch (itemLength) {
                        case 4:
                            parsedData = data.readUInt32BE(0);
                            break;
                        case 8:
                            parsedData = data.readUInt32BE(4);
                            break;
                        default:
                            if (contentType.name === 'dacp.nowplayingids') {
                                parsedData = decode_nowplayingids(data);
                            } else {
                                // Return the buffer instead because 64 bits cannot be saved in plain javascript without precision loss.
                                parsedData = data;
                            }
                            break;
                        }
                        break;
                    case 'list':
                        output = addProperty(output, outputKey, decode(data), contentType);
                        break;
                    default:
                        parsedData = data.toString();
                        break;
                    }
                } catch (e) {
                    console.log('error on %s', itemType);
                    console.error(e);
                }
            }

            if (parsedData != null) {
                output[contentType.name] = parsedData;
            }
        } else {
            // console.error('Unknown ContentType: %s', itemType);
        }

        i += 8 + itemLength;
    }
    return output;
}

module.exports.decode = decode;
