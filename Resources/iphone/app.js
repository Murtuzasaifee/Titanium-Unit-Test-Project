var Alloy = require("alloy"), _ = Alloy._, Backbone = Alloy.Backbone;

if ("production" !== Ti.App.deployType) {
    var behave = require("behave");
    require("spec/ui");
    behave.run();
}

Alloy.createController("index");