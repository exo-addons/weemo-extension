
@Application(defaultController = VideoCallApplication.class)
@Portlet(name = "VideoCallPortlet")
@Bindings(
        {
                @Binding(value = org.exoplatform.services.organization.OrganizationService.class),
                @Binding(value = org.exoplatform.social.core.space.spi.SpaceService.class),
                @Binding(value = org.exoplatform.services.security.ConversationRegistry.class),
                @Binding(value = org.exoplatform.ws.frameworks.cometd.ContinuationService.class),
                @Binding(value = org.mortbay.cometd.continuation.EXoContinuationBayeux.class)
        }
)
@Scripts(location = AssetLocation.SERVER,
        value = {
                @Script(value = "js/jquery-1.8.3.min.js", id = "jquery"),
                @Script(value = "js/jquery-juzu-utils-0.1.0.js", depends = "jquery", id = "juzu-utils"),
                @Script(value = "js/notif.js", id = "notif", depends = {"jquery", "juzu-utils"})
        }
)
@Stylesheets({
        @Stylesheet(value = "css/style.css", location = AssetLocation.SERVER)
})
@Assets("*") package org.exoplatform.portlet.videocall;

import juzu.Application;
import juzu.asset.AssetLocation;
import juzu.plugin.asset.*;
import juzu.plugin.binding.Binding;
import juzu.plugin.binding.Bindings;
import juzu.plugin.portlet.Portlet;

