/**
 ##################                           ##################
 ##################                           ##################
 ##################   WEEMO EXTENSION         ##################
 ##################                           ##################
 ##################                           ##################
 */


/**
 * WeemoExtension Class
 * @constructor
 */
function WeemoExtension() {
    this.username = "";
    this.jzGetState = "";
    this.getStateURL = "";
    this.urlHasOneOneCallPermission = "";
    this.weemoIntervalNotif = "";
    this.notifEventInt = "";
    this.isSupport = true;
    this.tokenKey = "";
    this.weemoKey = "";
    this.isValidWeemoKey = true;
    this.isTurnOffForUser = false;
    this.isTurnOffForGroupCall = 'true';
    this.isSameUserLogged = 'false';
    this.isTurnOff = false;
    this.connectedWeemoDriver = false;
    this.videoCallVersion = "";
    this.meetingPoint;
    this.meetingPointId = "";

    var ieVersionNumber = GetIEVersion();

    try {
        if (ieVersionNumber < 11 && ieVersionNumber > 0) {
            var options = {
                useJquery: true,
                mode_parameter: 'plugin_webrtc',
                uiVersion: '1.4.4'
            };
            //this.rtcc = new Rtcc('', '', 'internal', options);
        } else {
            var options = {
                mode_parameter: 'plugin_webrtc',
                uiVersion: '1.4.4'
            };
            //this.rtcc = new Rtcc('', '', 'internal', options);
        }

    } catch (err) {
        console.log("WEEMO NOT AVAILABLE YET " + err);
        this.rtcc = undefined;
        this.isValidWeemoKey = false;
        jqchat(".btn-weemo-conf").css('display', 'none');
        jqchat(".btn-weemo").addClass('disabled');
    }


    this.callObj;

    this.callOwner = false; //jzGetParam("callOwner", false);
    this.callActive = false; //jzGetParam("callActive", "false").toLowerCase() === "true";
    this.callType = jzGetParam("callType", "");

    this.uidToCall = jzGetParam("uidToCall", "");
    this.displaynameToCall = jzGetParam("displaynameToCall", "");

    this.chatMessage = JSON.parse(jzGetParam("chatMessage", '{}'));

    this.isConnected = false;

    this.tiptipContentDOMNodeInsertedHandler = function() {
        weemoExtension.attachWeemoToPopups();
    };
}

WeemoExtension.prototype.setNotInstallWeemoDriver = function() {
    var isNotInstallWeemoPlugin = weemoExtension.getCookie("isNotInstallWeemoPlugin");
    if (!isNotInstallWeemoPlugin || 0 === isNotInstallWeemoPlugin.length) {
        weemoExtension.setCookie("isNotInstallWeemoPlugin", "true", 365);
        var downloadUrl = "https://download.weemo.com/file/release/3";
        if (this.rtcc) downloadUrl = this.rtcc.getDownloadUrl();
        weemoExtension.setCookie("downloadUrl", downloadUrl, 365);
    }
    weemoExtension.showWeemoInstaller();
};

WeemoExtension.prototype.setInstallWeemoDriver = function() {
    var isNotInstallWeemoPlugin = weemoExtension.getCookie("isNotInstallWeemoPlugin");
    if (isNotInstallWeemoPlugin == 'true') {
        weemoExtension.setCookie("isNotInstallWeemoPlugin", "false", 365);
    }
    jqchat("#weemo-alert").hide();
}

WeemoExtension.prototype.initOptions = function(options) {
    this.username = options.username;
    this.jzGetState = options.urlGetState;
    this.urlHasOneOneCallPermission = options.urlHasOneOneCallPermission;
    this.weemoIntervalNotif = options.notificationInterval;
    this.getStateURL = this.jzGetState;
};

WeemoExtension.prototype.log = function() {
    console.log("callOwner         :: " + this.callOwner);
    console.log("callActive        :: " + this.callActive);
    console.log("callType          :: " + this.callType);
    console.log("uidToCall         :: " + this.uidToCall);
    console.log("displayNameToCall :: " + this.displaynameToCall);
    console.log("chatMessage       :: " + this.chatMessage);
}

WeemoExtension.prototype.setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}
WeemoExtension.prototype.removeCookie = function(cname) {
    document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
}
WeemoExtension.prototype.getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

WeemoExtension.prototype.showWeemoInstaller = function() {
    if (!weemoExtension.isSupport || weemoExtension.connectedWeemoDriver || weemoExtension.isTurnOff === "true") {
        jqchat("#weemo-alert").hide();
        return;
    }
    var isDismiss = weemoExtension.getCookie('isDismiss');
    if (!weemoExtension.isConnected) {
        if ((typeof(isDismiss) == "undefined" && isDismiss == null) || !isDismiss) {
            var uiToolbarContainer = jqchat("#UIToolbarContainer");
            var height = uiToolbarContainer.outerHeight() - jqchat(".alert").css("marginTop").replace('px', '');

            jqchat("#weemo-alert").css({
                top: height + 'px'
            });
            jqchat("#weemo-alert").show();
            var downloadUrl = weemoExtension.getCookie("downloadUrl");
            jqchat("#weemo-alert-download").click(function() {
                jqchat("#weemo-alert").hide();
                location.href = downloadUrl;
            });

            jqchat("#weemo-alert-dismiss").click(function() {
                weemoExtension.setCookie("isDismiss", "true", 365);
                jqchat("#weemo-alert").hide();
            });
            var closeElem = jqchat("#weemo-alert").find(".uiIconClose:first");
            jqchat(closeElem).click(function() {
                jqchat("#weemo-alert").hide();
            });
        }
    }
}

WeemoExtension.prototype.setKey = function(weemoKey) {
    this.weemoKey = weemoKey;
    jzStoreParam("weemoKey", weemoKey, 14400); // timeout = 60 sec * 60 min * 4 hours = 14400 sec
};

WeemoExtension.prototype.setTokenKey = function(tokenKey) {
    this.tokenKey = tokenKey;
    jzStoreParam("tokenKey", tokenKey, 14400); // timeout = 60 sec * 60 min * 4 hours = 14400 sec
};


WeemoExtension.prototype.setCallOwner = function(callOwner) {
    this.callOwner = callOwner;
    jzStoreParam("callOwner", callOwner, 14400);
};

WeemoExtension.prototype.setCallType = function(callType) {
    this.callType = callType;
    jzStoreParam("callType", callType, 14400);
};

WeemoExtension.prototype.setCallActive = function(callActive) {
    this.callActive = callActive;
    jzStoreParam("callActive", callActive, 14400);
};

WeemoExtension.prototype.setUidToCall = function(uidToCall) {
    this.uidToCall = uidToCall;
    jzStoreParam("uidToCall", uidToCall, 14400);
};

WeemoExtension.prototype.setDisplaynameToCall = function(displaynameToCall) {
    this.displaynameToCall = displaynameToCall;
    jzStoreParam("displaynameToCall", displaynameToCall, 14400);
};

WeemoExtension.prototype.setMeetingPointId = function(meetingPointId) {
    this.meetingPointId = meetingPointId;
    jzStoreParam("meetingPointId", meetingPointId, 14400);
};
/**
 * A JSON Object like :
 * { "url" : url,
 *   "user" : user,
 *   "targetUser" : targetUser,
 *   "room" : room,
 *   "token" : token
 * }
 * @param chatMessage
 */
WeemoExtension.prototype.setChatMessage = function(chatMessage) {
    this.chatMessage = chatMessage;
    jzStoreParam("chatMessage", JSON.stringify(chatMessage), 14400);
};

WeemoExtension.prototype.hasChatMessage = function() {
    return (this.chatMessage.url !== undefined);
};

WeemoExtension.prototype.initChatMessage = function() {
    this.setChatMessage({});
};

WeemoExtension.prototype.hangup = function() {
    if (this.callObj !== undefined) {
        this.callObj.hangup();
    }
};

WeemoExtension.prototype.changeStatus = function(status) {
    var $weemoStatus = jqchat(".uiNotifWeemoIcon");
    if (typeof status === "undefined") {
        $weemoStatus.removeClass("uiNotifWeemoGreen");
        return;
    }
    $weemoStatus.removeClass("uiNotifWeemoRed");
    $weemoStatus.removeClass("uiNotifWeemoBlue");
    $weemoStatus.removeClass("uiNotifWeemoWarning");
    $weemoStatus.removeClass("uiNotifWeemoGreen");

    if (weemoExtension.isSameUserLogged === 'true') {
        $weemoStatus.addClass("uiNotifWeemoWarning");
    } else {
        $weemoStatus.addClass("uiNotifWeemo" + status);
    }

}

/**
 * Init Weemo Call
 * @param $uid
 * @param $name
 */
WeemoExtension.prototype.initCall = function($uid, $name) {
    this.displayVideoCallOnTopNav();

    if (this.weemoKey !== "" && this.rtcc !== undefined) {
        jqchat(".btn-weemo-conf").css('display', 'none');

        this.rtcc.setDebugLevel(1); // Activate debug in JavaScript console
        this.rtcc.setWebAppId(this.weemoKey);
        this.rtcc.setToken("weemo" + $uid);

        this.rtcc.on('client.connect', function(connectionMode) {
            if ("plugin" === connectionMode || "webrtc" === connectionMode) {
                weemoExtension.connectedWeemoDriver = true;
                weemoExtension.setInstallWeemoDriver();
                //this.authenticate();
                weemoExtension.changeStatus("Blue");

                if (weemoExtension.hasChatMessage() && (chatApplication !== undefined)) {
                    var roomToCheck = weemoExtension.chatMessage.room;
                    chatApplication.checkIfMeetingStarted(roomToCheck, function(callStatus) {
                        if (callStatus === 0) { // Already terminated
                            return;
                        }
                        var options = {};
                        options.timestamp = Math.round(new Date().getTime() / 1000);
                        options.type = "call-off";
                        chatApplication.chatRoom.sendFullMessage(
                            weemoExtension.chatMessage.user,
                            weemoExtension.chatMessage.token,
                            weemoExtension.chatMessage.targetUser,
                            roomToCheck,
                            chatBundleData.exoplatform_chat_call_terminated,
                            options,
                            "true"
                        );

                        weemoExtension.initChatMessage();
                    });
                }
            }
        });

        this.rtcc.on('cloud.authenticate.success', function() {
            weemoExtension.rtcc.setPluginMode('standalone');
        });

        this.rtcc.on('client.disconnect', function() {
            if (weemoExtension.rtcc.getConnectionMode() === "plugin" || weemoExtension.rtcc.getConnectionMode() === "webrtc") {
                weemoExtension.isConnected = false;
                weemoExtension.setCallActive(false);
                if (weemoExtension.hasChatMessage() && (chatApplication !== undefined)) {
                    var roomToCheck = weemoExtension.chatMessage.room;
                    chatApplication.checkIfMeetingStarted(roomToCheck, function(callStatus) {
                        if (callStatus === 0) { // Already terminated
                            return;
                        }
                        var options = {};
                        options.timestamp = Math.round(new Date().getTime() / 1000);
                        options.type = "call-off";
                        chatApplication.chatRoom.sendFullMessage(
                            weemoExtension.chatMessage.user,
                            weemoExtension.chatMessage.token,
                            weemoExtension.chatMessage.targetUser,
                            roomToCheck,
                            chatBundleData.exoplatform_chat_call_terminated,
                            options,
                            "true"
                        );

                        weemoExtension.initChatMessage();

                    });
                }
            }
        });

        this.rtcc.on('cloud.sip.ok', function() {
            if (weemoExtension.rtcc.getConnectionMode() === "plugin" || weemoExtension.rtcc.getConnectionMode() === "webrtc") {
                weemoExtension.isConnected = true;
                weemoExtension.changeStatus("Green");

                var fn = jqchat(".label-user").text();
                var fullname = jqchat("#UIUserPlatformToolBarPortlet > a:first").text().trim();
                if (fullname !== "") {
                    weemoExtension.rtcc.setDisplayName(fullname); // Configure the display name
                } else if (fn !== "") {
                    weemoExtension.rtcc.setDisplayName(fn); // Configure the display name
                }
            }
        });

        this.rtcc.on('cloud.loggedasotheruser', function() {
            if (weemoExtension.rtcc.getConnectionMode() === "plugin" || weemoExtension.rtcc.getConnectionMode() === "webrtc") {
                weemoExtension.rtcc.authenticate(1);
            }
        });

        this.rtcc.on('cloud.sip.ko', function() {
            if (weemoExtension.rtcc.getConnectionMode() === "plugin" || weemoExtension.rtcc.getConnectionMode() === "webrtc") {
                weemoExtension.isConnected = false;
                weemoExtension.changeStatus("Warning");
            }
        });

        this.rtcc.on('error', function(errorMessage) {
            console.log("Unknown error: " + errorMessage);
        });

        this.rtcc.on('error.ossupport', function() {
            weemoExtension.isSupport = false;
            weemoExtension.isConnected = false;
        });

        this.rtcc.on('plugin.missing', function(downloadUrl) {
            weemoExtension.setCookie("isNotInstallWeemoPlugin", "true", 365);
            weemoExtension.setCookie("downloadUrl", downloadUrl, 365);
            weemoExtension.showWeemoInstaller();
            if (navigator.platform !== "Linux") {
                jqchat("#weemo-alert-download").click(function() {
                    jqchat("#weemo-alert").hide();
                    location.href = downloadUrl;
                });
            }
        });

        this.rtcc.on('meetingpoint.create.success', function(meetinPointObject) {
            meetinPointObject.autoaccept_mode();
            meetinPointObject.host();
        });

        this.rtcc.on('call.create', function(callObj) {
            if ("outgoing" !== callObj.getDirection()) return;
            weemoExtension.callObj = callObj;
            callObj.on(['active', 'proceed', 'terminate'], function() {
                var eventName = this.eventName;
                var messageWeemo = "";
                var optionsWeemo = {};
                ts = Math.round(new Date().getTime() / 1000);

                if (eventName === "terminate") weemoExtension.setCallOwner(false);

                if (weemoExtension.callType === "internal" || eventName === "terminate") {
                    messageWeemo = "Call " + status;
                    optionsWeemo.timestamp = ts;
                } else if (weemoExtension.callType === "host") {
                    messageWeemo = "Call " + status;
                    optionsWeemo.timestamp = ts;
                    optionsWeemo.uidToCall = weemoExtension.uidToCall;
                    optionsWeemo.displaynameToCall = weemoExtension.displaynameToCall;
                    optionsWeemo.meetingPointId = weemoExtension.meetingPoint.id;
                }

                if (eventName === "active" && weemoExtension.callActive) return; //Call already active, no need to push a new message
                if (eventName === "terminate" && (!weemoExtension.callActive || weemoExtension.callType === "attendee")) //Terminate a non started call or a joined call, no message needed
                {
                    weemoExtension.setCallActive(false);
                    return;
                }
                if (weemoExtension.callType === "attendee" && eventName === "active") {
                    weemoExtension.setCallActive(true);
                    optionsWeemo.type = "call-join";
                    optionsWeemo.username = weemoExtension.chatMessage.user;
                    optionsWeemo.fullname = weemoExtension.chatMessage.fullname;

                } else if (eventName === "active") {
                    weemoExtension.setCallActive(true);
                    optionsWeemo.type = "call-on";
                } else if (eventName === "terminate") {
                    weemoExtension.setCallActive(false);
                    optionsWeemo.type = "call-off";
                } else if (eventName === "proceed") {
                    weemoExtension.setCallActive(false);
                    optionsWeemo.type = "call-proceed";
                }

                if (weemoExtension.hasChatMessage()) {
                    console.log("WEEMO:hasChatMessage::" + weemoExtension.chatMessage.user + ":" + weemoExtension.chatMessage.targetUser);
                    if (chatApplication !== undefined) {
                        var roomToCheck = "";
                        if (weemoExtension.chatMessage.room !== undefined) roomToCheck = weemoExtension.chatMessage.room;
                        chatApplication.checkIfMeetingStarted(roomToCheck, function(callStatus) {
                            if (callStatus === 1 && optionsWeemo.type === "call-on") {
                                // Call is already created, not allowed.
                                weemoExtension.initChatMessage();
                                weemoExtension.hangup();
                                return;
                            }
                            if (callStatus === 0 && optionsWeemo.type === "call-off") {
                                // Call is already terminated, no need to terminate again
                                return;
                            }

                            chatApplication.chatRoom.sendFullMessage(
                                weemoExtension.chatMessage.user,
                                weemoExtension.chatMessage.token,
                                weemoExtension.chatMessage.targetUser,
                                weemoExtension.chatMessage.room,
                                messageWeemo,
                                optionsWeemo,
                                "true"
                            );

                            if (eventName === "terminate") {
                                weemoExtension.initChatMessage();
                            }
                        });
                    }
                }

            });
        });

        try {
            this.rtcc.initialize();
        } catch (err) {
            if (window.console)
                console.log("Can not initialize weemo: " + err);
        }
        var fn = jqchat(".label-user").text();
        var fullname = jqchat("#UIUserPlatformToolBarPortlet > a:first").text().trim();
        if (fullname !== "") {
            this.rtcc.setDisplayName(fullname); // Configure the display name
        } else if (fn !== "") {
            this.rtcc.setDisplayName(fn); // Configure the display name
        }
        this.changeStatus("Red");

    }
};

/**
 *
 */
WeemoExtension.prototype.createWeemoCall = function(targetUser, targetFullname, chatMessage) {


    if (this.weemoKey !== "" && this.callActive === false) {

        if (chatMessage !== undefined) {
            this.setChatMessage(chatMessage);
        }

        if (targetUser.indexOf("space-") === -1 && targetUser.indexOf("team-") === -1) {
            this.setUidToCall("weemo" + targetUser);
            this.setDisplaynameToCall(targetFullname);
            this.setCallType("internal");
            this.setCallOwner(true);
            this.rtcc.createCall(this.uidToCall, this.callType, this.displaynameToCall);
        } else {
            this.setUidToCall(this.rtcc.getToken());
            this.setDisplaynameToCall(this.rtcc.getDisplayName());
            this.setCallType("host");
            this.setCallOwner(true);
            this.meetingPoint = this.rtcc.createMeetingPoint('adhoc');
        }
    }
};

/**
 *
 */
WeemoExtension.prototype.joinWeemoCall = function(chatMessage) {
    if (this.weemoKey !== "" && this.callActive === false) {
        if (chatMessage !== undefined) {
            this.setChatMessage(chatMessage);
        }
        this.setCallType("attendee");
        this.setCallOwner(false);
        this.rtcc.joinConfCall(this.meetingPointId);
    }
};

/**
 * Gets target user status
 * @param targetUser
 */
WeemoExtension.prototype.getStatus = function(targetUser, callback) {
    if (typeof chatNotification !== 'undefined') {
        chatNotification.getStatus(targetUser, callback);
    } else {
        var refreshURL = this.getStateURL + targetUser + "/";
        jqchat.ajax({
            url: refreshURL,
            dataType: "text",
            context: this,
            success: function(data) {
                if (typeof callback === "function") {
                    var obj = jQuery.parseJSON(data);
                    if (obj != null) {
                        var acticity = obj.activity;
                        callback(targetUser, acticity);
                    } else {
                        callback(targetUser, "offline");
                    }
                }
            },
            error: function() {
                if (typeof callback === "function") {
                    callback(targetUser, "offline");
                }
            }
        });
    }
};

WeemoExtension.prototype.hasOneOneCallPermission = function(userId) {
    var hasPermission = "false";
    jqchat.ajax({
        url: this.urlHasOneOneCallPermission + userId,
        async: false,
        dataType: "text",
        success: function(data) {
            hasPermission = data;
        }
    });
    return hasPermission;
};

WeemoExtension.prototype.attachWeemoToPopups = function() {
    var $tiptip_content = jqchat("#tiptip_content");
    if ($tiptip_content.length == 0 || $tiptip_content.hasClass("DisabledEvent")) {
        setTimeout(jqchat.proxy(this.attachWeemoToPopups, this), 250);
        return;
    }

    $tiptip_content.addClass("DisabledEvent");
    var username = "";
    var fullname = "";
    var addStyle = "";
    var $uiElement;

    var $uiAction = jqchat(".uiAction", $tiptip_content).first();
    if ($uiAction !== undefined && $uiAction.html() !== undefined) {
        var $uiFullname = jqchat('#tiptip_content').children('#tipName').children("tbody").children("tr").children("td").children("a");
        $uiFullname.each(function() {
            var html = jqchat(this).html();
            if (html.indexOf("/rest/") == -1) {
                fullname = html;
            }
            var href = jqchat(this).attr("href");
            if (href.indexOf("/portal/intranet/activities/") > -1) {
                username = href.substr(28);
            }
        });
        $uiElement = $uiAction;
    }

    if (username !== "" && $uiElement.has(".weemoCallOverlay").size() === 0 && weemoExtension.isSupport) {
        var callLabel = jqchat("#weemo-status").attr("call-label");
        var makeCallLabel = jqchat("#weemo-status").attr("make-call-label");
        var strWeemoLink = '<a type="button" class="btn weemoCallOverlay weemoCall-' + username.replace('.', '-') + ' disabled" title="' + makeCallLabel + '"';
        strWeemoLink += ' data-fullname="' + fullname + '"';
        strWeemoLink += ' data-username="' + username + '" style="margin-left:5px;' + addStyle + '">';
        strWeemoLink += '<i class="uiIconWeemoVideoCalls uiIconWeemoLightGray"></i> ' + callLabel + '</a>';

        var $btnChat = jqchat(".chatPopupOverlay", $uiElement);
        if ($btnChat.length > 0) {
            var $btnConnect = jqchat(".connect", $uiElement);
            $btnConnect.wrap("<div></div>");
            $uiElement.addClass("twice-line");
            $btnChat.before(strWeemoLink);
        } else {
            $uiElement.append(strWeemoLink);
        }

        jqchat(".weemoCallOverlay").unbind("click");
        jqchat(".weemoCallOverlay").on("click", function() {
            if (!jqchat(this).hasClass("disabled") && weemoExtension.isTurnOffForUser == "false" && weemoExtension.isValidWeemoKey == true && weemoExtension.tokenKey.length > 0) {
                var targetUser = jqchat(this).attr("data-username");
                var targetFullname = jqchat(this).attr("data-fullname");
                if (weemoExtension.hasOneOneCallPermission(targetUser.trim()) === "false") {
                    eXo.ecm.VideoCalls.showReceivingPermissionInterceptor(targetFullname.trim());
                } else {
                    //weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
                    //alert('xxx');
                    weemoExtension.caller = window.open('/weemo-extension/calloneone/caller.html?callee=' + targetUser.trim() + '&callee_display_name=' + targetFullname.trim(), "MyWindow", "top=100, left=100,toolbar=no, menubar=no,scrollbars=no,resizable=no,location=no,directories=no,status=no, height=300, width=500");

                    var callOneOneUrl = "/rest/weemo/call11/" + targetUser.trim();

                    jqchat.ajax(callOneOneUrl)
                      .done(function() {

                      })
                      .fail(function() {});
                }
            } else if (!jqchat(this).hasClass("disabled")) {
                if (weemoExtension.isValidWeemoKey == false || weemoExtension.tokenKey.length == 0) {
                    eXo.ecm.VideoCalls.showInstallInterceptor();
                } else if (weemoExtension.isTurnOffForUser == "true") {
                    eXo.ecm.VideoCalls.showPermissionInterceptor();
                }
            }
        });

        function cbGetStatus(targetUser, activity) {
            if (activity !== "offline") {
                jqchat(".weemoCall-" + targetUser.replace('.', '-')).removeClass("disabled");
            }
        }
        weemoExtension.getStatus(username, cbGetStatus);

    }

    $tiptip_content.removeClass("DisabledEvent");
    $tiptip_content.unbind("DOMNodeInserted", this.tiptipContentDOMNodeInsertedHandler);
    $tiptip_content.bind("DOMNodeInserted", this.tiptipContentDOMNodeInsertedHandler);
};

WeemoExtension.prototype.attachWeemoToProfile = function() {
    if (window.location.href.indexOf("/portal/intranet/profile") == -1) return;

    var headerSecion = jqchat("#UIHeaderSection");
    if (headerSecion.html() === undefined) {
        setTimeout(jqchat.proxy(this.attachWeemoToProfile, this), 250);
        return;
    }

    var infoSection = jqchat("UIBasicInfoSection");
    var $h3Elem = jqchat(headerSecion).find("h3:first");
    var buttonInvite = jqchat(headerSecion).find("button:first");
    var fullName = $h3Elem.html();
    fullName = fullName.substring(0, fullName.indexOf("<"));
    var userName = window.location.href;
    userName = userName.substring(userName.lastIndexOf("/") + 1, userName.length);

    if (userName != weemoExtension.username && userName !== "" && $h3Elem.has(".weemoCallOverlay").size() === 0 && weemoExtension.isSupport) {
        var callLabel = jqchat("#weemo-status").attr("call-label");
        var makeCallLabel = jqchat("#weemo-status").attr("make-call-label");
        var html = '<a type="button" class="btn weemoCallOverlay weemoCall-' + userName.replace('.', '-') + ' disabled"   id="weemoCall-' + userName.replace('.', '-') + '" title="' + makeCallLabel + '"';
        html += ' data-username="' + userName + '" data-fullname="' + fullName + '"';
        html += ' style="margin-left:5px;"><i class="uiIconWeemoVideoCalls uiIconLightGray"></i> ' + callLabel + '</a>';

        $h3Elem.append(html);


        jqchat(".weemoCallOverlay").unbind("click");
        jqchat(".weemoCallOverlay").on("click", function() {
            if (!jqchat(this).hasClass("disabled") && weemoExtension.isTurnOffForUser == "false" && weemoExtension.isValidWeemoKey == true && weemoExtension.tokenKey.length > 0) {
                var targetUser = jqchat(this).attr("data-username");
                var targetFullname = jqchat(this).attr("data-fullname");
                console.log(targetUser + " == " + targetFullname.trim());
                if (weemoExtension.hasOneOneCallPermission(targetUser.trim()) === "false") {
                    eXo.ecm.VideoCalls.showReceivingPermissionInterceptor(targetFullname.trim());
                } else {
                    weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
                }
            } else if (!jqchat(this).hasClass("disabled")) {
                if (weemoExtension.isValidWeemoKey == false || weemoExtension.tokenKey.length == 0) {
                    eXo.ecm.VideoCalls.showInstallInterceptor();
                } else if (weemoExtension.isTurnOffForUser == "true") {
                    eXo.ecm.VideoCalls.showPermissionInterceptor();
                }
            }
        });

        function cbGetProfileStatus(targetUser, activity) {
            if (activity !== "offline") {
                jqchat(".weemoCall-" + targetUser.replace('.', '-')).removeClass("disabled");
            }
        }

        weemoExtension.getStatus(userName, cbGetProfileStatus);

    }
    setTimeout(function() {
        weemoExtension.attachWeemoToProfile()
    }, 250);

};



WeemoExtension.prototype.attachWeemoToConnections = function() {
    if (window.location.href.indexOf("/portal/intranet/connexions") == -1 && window.location.href.indexOf("/portal/intranet/connections") == -1) return;

    var $uiPeople = jqchat('.uiTabInPage').first();
    if ($uiPeople.html() === undefined) {
        setTimeout(jqchat.proxy(this.attachWeemoToConnections, this), 250);
        return;
    }

    jqchat(".contentBox", ".uiTabInPage").each(function() {

        var $uiUsername = jqchat(this).children(".spaceTitle").children("a").first();
        var username = $uiUsername.attr("href");
        username = username.substring(username.lastIndexOf("/") + 1);
        var fullname = $uiUsername.html();

        var $uiActionWeemo = jqchat(".weemoCallOverlay", jqchat(this).next()).first();
        if ($uiActionWeemo == undefined || $uiActionWeemo !== undefined && $uiActionWeemo.html() == undefined && weemoExtension.isSupport) {
            var nextElem = jqchat(this).next();

            var callLabel = jqchat("#weemo-status").attr("call-label");
            var makeCallLabel = jqchat("#weemo-status").attr("make-call-label");
            var html = '<a type="button" class="btn weemoCallOverlay weemoCall-' + username.replace('.', '-') + ' pull-right disabled" id="weemoCall-' + username.replace('.', '-') + '" title="' + makeCallLabel + '"';

            html += ' data-username="' + username + '" data-fullname="' + fullname + '"';
            html += ' style="margin-left:5px;"><i class="uiIconWeemoVideoCalls uiIconLightGray"></i> ' + callLabel + '</a>';
            html += jqchat(nextElem).html();
            jqchat(nextElem).html(html);

            function cbGetConnectionStatus(targetUser, activity) {
                if (activity !== "offline") {
                    jqchat(".weemoCall-" + targetUser.replace('.', '-')).removeClass("disabled");
                }
            }

            weemoExtension.getStatus(username, cbGetConnectionStatus);
        }
    });

    jqchat(".weemoCallOverlay").unbind("click");
    jqchat(".weemoCallOverlay").on("click", function() {
        if (!jqchat(this).hasClass("disabled") && weemoExtension.isTurnOffForUser == "false" && weemoExtension.isValidWeemoKey == true && weemoExtension.tokenKey.length > 0) {
            var targetUser = jqchat(this).attr("data-username");
            var targetFullname = jqchat(this).attr("data-fullname");
            if (weemoExtension.hasOneOneCallPermission(targetUser.trim()) === "false") {
                eXo.ecm.VideoCalls.showReceivingPermissionInterceptor(targetFullname.trim());
            } else {
                weemoExtension.createWeemoCall(targetUser.trim(), targetFullname.trim());
            }
        } else if (!jqchat(this).hasClass("disabled")) {
            if (weemoExtension.isValidWeemoKey == false || weemoExtension.tokenKey.length == 0) {
                eXo.ecm.VideoCalls.showInstallInterceptor();
            } else if (weemoExtension.isTurnOffForUser == "true") {
                eXo.ecm.VideoCalls.showPermissionInterceptor();
            }
        }
    });

    setTimeout(function() {
        weemoExtension.attachWeemoToConnections()
    }, 500);
};

WeemoExtension.prototype.displayVideoCallOnTopNav = function() {
    if (typeof chatNotification === 'undefined') {
        return;
    }

    var $uiNotifChatIcon = jqchat(".uiNotifChatIcon");
    var $uiNotifWeemoIcon = jqchat(".uiNotifWeemoIcon", $uiNotifChatIcon);

    if ($uiNotifWeemoIcon.length === 0) {
        $uiNotifChatIcon.append("<span class=\"uiNotifWeemoIcon\"></span>");
        this.changeStatus("Red");
    }

};

WeemoExtension.prototype.checkCallOneOne = function() {
    var callOneOneUrl = "/rest/weemo/getMeetingId/" + this.username;

    jqchat.ajax(callOneOneUrl)
        .done(function(meetingId) {
            if (meetingId !== "") {
                window.open('/weemo-extension/sightcall/attendee.html?meetingid=' + meetingId, "MyWindow", "top=100, left=100,toolbar=no, menubar=no,scrollbars=no,resizable=no,location=no,directories=no,status=no, height=300, width=500");
                jqchat.ajax("/rest/weemo/finishOneOne/" + weemoExtension.username)
                    .done(function() {

                    })
                    .fail(function() {});
                return;
            }
        })
        .fail(function() {

        });
    setTimeout(function() {
        weemoExtension.checkCallOneOne()
    }, 500);
};


/**
 ##################                           ##################
 ##################                           ##################
 ##################   HACK                    ##################
 ##################                           ##################
 ##################                           ##################
 */



/**
 * Hack to ignore console on for Internet Explorer (without testing its existence
 * @type {*|{log: Function, warn: Function, error: Function}}
 */
var console = console || {
    log: function() {},
    warn: function() {},
    error: function() {}
};



/**
 ##################                           ##################
 ##################                           ##################
 ##################   GLOBAL                  ##################
 ##################                           ##################
 ##################                           ##################
 */

// GLOBAL VARIABLES

var weemoExtension = new WeemoExtension();


(function($) {

    $(document).ready(function() {

        //GETTING DOM CONTEXT
        var $notificationApplication = $("#weemo-status");


        // WEEMO NOTIFICATION INIT
        weemoExtension.initOptions({
            "username": $notificationApplication.attr("data-username"),
            "urlNotification": "/rest/state/ping/",
            "urlGetState": "/rest/state/status/",
            "urlHasOneOneCallPermission": "/rest/weemo/hasOneOneCallPermission/",
            "notificationInterval": $notificationApplication.attr("data-weemo-interval-notif")
        });

        weemoExtension.isTurnOff = $notificationApplication.attr("data-weemo-turnoff");
        if (weemoExtension.isTurnOff == "true") return;
        if (navigator.platform.indexOf("Linux") >= 0 && !jqchat.browser.chrome) return;
        weemoExtension.isTurnOffForUser = $notificationApplication.attr("data-weemo-turnoff-user");
        weemoExtension.isTurnOffForGroupCall = $notificationApplication.attr("data-weemo-turnoff-group");
        weemoExtension.isSameUserLogged = $notificationApplication.attr("is-same-user-logged");
        weemoExtension.cometdUserToken = $notificationApplication.attr("cometd-user-token");
        weemoExtension.cometdContextName = $notificationApplication.attr("cometd-context-name");


        var isNotInstallWeemoPlugin = weemoExtension.getCookie("isNotInstallWeemoPlugin");

        weemoExtension.videoCallVersion = $notificationApplication.attr("videoCallVersion");
        if (weemoExtension.videoCallVersion.length > 0) {
            var oldVersion = weemoExtension.getCookie("videoCallVersion");

            if (weemoExtension.videoCallVersion > oldVersion) {
                if (isNotInstallWeemoPlugin == 'true') {
                    weemoExtension.removeCookie("isDismiss");
                    weemoExtension.showWeemoInstaller();
                }
                weemoExtension.setCookie("videoCallVersion", weemoExtension.videoCallVersion, 365);
            }
        }


        if (isNotInstallWeemoPlugin == 'true') {
            weemoExtension.showWeemoInstaller();
        }
        // WEEMO : GETTING AND SETTING KEY
        var weemoKey = $notificationApplication.attr("data-weemo-key");
        weemoExtension.setKey(weemoKey);

        var tokenKey = $notificationApplication.attr("data-token-key");
        weemoExtension.setTokenKey(tokenKey);


        var username = $notificationApplication.attr("data-username");
        weemoExtension.initCall(username, username);
        weemoExtension.attachWeemoToPopups();
        weemoExtension.attachWeemoToConnections();
        weemoExtension.attachWeemoToProfile();
        //weemoExtension.checkCallOneOne();
        window.require(["SHARED/SightCallNotification"], function(sightCallNotification) {
            sightCallNotification.initCometd(weemoExtension.username, weemoExtension.cometdUserToken, weemoExtension.cometdContextName);
        });
    });

})(jqchat);
