function S4() {
    return (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
}

function guid() {
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function Sync(model, method, opts) {
    var prefix = model.config.adapter.collection_name ? model.config.adapter.collection_name : "default", regex = new RegExp("^(" + prefix + ")\\-(.+)$"), resp = null;
    if ("read" === method) if (opts.parse) {
        var list = [];
        _.each(TAP.listProperties(), function(prop) {
            var match = prop.match(regex);
            null !== match && list.push(TAP.getObject(prop));
        });
        model.reset(list);
        resp = list;
    } else {
        var obj = TAP.getObject(prefix + "-" + model.get("id"));
        model.set(obj);
        resp = model.toJSON();
    } else if ("create" === method || "update" === method) {
        var newId = model.get("id") || guid();
        model.set({
            id: newId
        }, {
            silent: !0
        });
        TAP.setObject(prefix + "-" + newId, model.toJSON() || {});
        resp = model.toJSON();
    } else if ("delete" === method) {
        TAP.removeProperty(prefix + "-" + model.get("id"));
        model.clear();
        resp = model.toJSON();
    }
    if (resp) {
        _.isFunction(opts.success) && opts.success(resp);
        "read" === method && model.trigger("fetch");
    } else _.isFunction(opts.error) && opts.error("Record not found");
}

var Alloy = require("alloy"), _ = require("alloy/underscore")._, TAP = Ti.App.Properties;

module.exports.sync = Sync;

module.exports.beforeModelCreate = function(config) {
    config = config || {};
    config.columns = config.columns || {};
    config.defaults = config.defaults || {};
    ("undefined" == typeof config.columns.id || null === config.columns.id) && (config.columns.id = "String");
    return config;
};