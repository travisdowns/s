'use strict';

var link = function(dest) {
    return '<a href="' + dest + '">' + dest + '</a>';
}

var setOutput = function(str) {
    document.getElementById('output').innerHTML = str;
}

var output = function(str) {
    document.getElementById('output').innerHTML += str;
}

// example URL:
// https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1633464138102-78920.report.html
var lhEncode = function(url) {
    console.log(url);
    var regex = new RegExp('^https://storage\\.googleapis\\.com/lighthouse-infrastructure\\.appspot\\.com/reports/(.*)\\.report\\.html$');
    var m = url.match(regex);
    console.log(m);
    if (!m) {
        throw new Error('failed to match');
    }
    var frag = '#l' + m[1];
    var l = window.location;
    var full = l.href.replace(/\/encode.html.*/, frag);
    console.log(window.location);
    output('Your shortened link: ' + link(full));
}

var lhDecode = function(str) {
    var template = 'https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/{ID}.report.html';
    return template.replace('{ID}', str);
}

var byid = function(id) {
    return document.getElementById(id);
}

var getFrag = function() {
    var frag = window.location.hash.substr(1);
    (byid('frag') || {}).innerText = frag;
    return frag;
}

// https://stackoverflow.com/a/901144
// https://creativecommons.org/licenses/by-sa/4.0/
// modified function name, added ifempty
function getParam(name, ifmissing = null, ifempty = '1', url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return ifmissing;
    if (!results[2]) return ifempty;
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var doDecode = function() {
    try {
        var frag = getFrag();
        var id = frag[0]
        var rest = frag.substr(1)
        var dest;
        var decoders = {
            'l': { 'd': lhDecode, 'name': 'lighthouse' }
        };
        var scheme = decoders[id];
        if (scheme) {
            var dest = scheme.d(rest);
            if (getParam('show', '0') !== '0') {
                document.write('This <strong>' + scheme.name + '</strong> scheme shortlink redirects to:<br>' + link(dest));
            } else {
                window.location.replace(dest);
            }
        } else {
            document.write('This shortlink has an invalid scheme: ', id);
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
}

var encodeListenerAttached = false;


var doEncode = function() {
    if (!encodeListenerAttached) {
        window.addEventListener('hashchange', function() { 
            console.log('hashchange');
            doEncode();
        });
        encodeListenerAttached = true;
    }

    var frag = getFrag();

    setOutput('');
    try {
        lhEncode(frag);
    } catch (e) {
        output('<h2>' + e.toString() + '</h2>');
        output('<pre>' + e.stack + '</pre>');
        throw e;
    }   
}




