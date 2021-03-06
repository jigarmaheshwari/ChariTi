var APP = require("core");
var SOCIAL = require("social");
var DATE = require("alloy/moment");
var STRING = require("alloy/string");
var MODEL = require("models/article")();

var CONFIG = arguments[0] || {};
var ACTION = {};

$.init = function() {
	APP.log("debug", "article_article.init | " + JSON.stringify(CONFIG));

	MODEL.init(CONFIG.index);

	$.handleData(MODEL.getArticle(CONFIG.id));
};

$.handleData = function(_data) {
	APP.log("debug", "article_article.handleData");

	$.handleNavigation();

	var time = DATE(parseInt(_data.date, 10));
	time = time.isBefore() ? time : DATE();

	$.heading.text = _data.title;
	$.heading.color = APP.Settings.colors.primary || "#000";
	$.text.value = _data.description;
	$.date.text = STRING.ucfirst(time.fromNow());

	if(_data.image) {
		var image = Ti.UI.createImageView({
			image: _data.image,
			width: APP.Device.width + "dp",
			height: Ti.UI.SIZE,
			preventDefaultImage: true
		});

		$.image.add(image);
	} else {
		$.container.remove($.image);
	}

	ACTION.url = _data.link;

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary || "#000");

	if(APP.Device.isHandheld) {
		$.NavigationBar.showBack({
			callback: function(_event) {
				APP.removeAllChildren();
			}
		});
	}

	$.NavigationBar.showAction({
		callback: function(_event) {
			SOCIAL.share(ACTION.url, $.NavigationBar.right);
		}
	});
};

$.handleNavigation = function() {
	ACTION.next = MODEL.getNextArticle(CONFIG.id);
	ACTION.previous = MODEL.getPreviousArticle(CONFIG.id);

	var navigation = Alloy.createWidget("com.chariti.detailNavigation", null, {
		down: function(_event) {
			APP.log("debug", "article_article @next");

			APP.addChild("article_article", {
				id: ACTION.next.id,
				index: CONFIG.index
			}, false, true);
		},
		up: function(_event) {
			APP.log("debug", "article_article @previous");

			APP.addChild("article_article", {
				id: ACTION.previous.id,
				index: CONFIG.index
			}, false, true);
		}
	}).getView();

	$.NavigationBar.addNavigation(navigation);
};

// Kick off the init
$.init();