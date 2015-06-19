/*
 * Copyright (C) 2003-2013 eXo Platform SAS.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package org.exoplatform.services.videocall;


import org.exoplatform.commons.api.notification.model.MessageInfo;
import org.exoplatform.services.rest.resource.ResourceContainer;
import org.exoplatform.services.security.ConversationState;
import org.exoplatform.utils.videocall.PropertyManager;
import org.json.JSONObject;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/weemo/")
public class  RESTAuthService implements ResourceContainer{
  private AuthService authService;
  
  public RESTAuthService() {     
  }
  
  @GET
  @Path("/auth/")
  @RolesAllowed("users")
  public Response auth() {
    authService = new AuthService();
    String profileId = PropertyManager.getProperty(PropertyManager.PROPERTY_VIDEO_PROFILE);
    String content = authService.authenticate(null, profileId);
    return Response.ok(content, MediaType.APPLICATION_JSON).build();    
  }
  
  @GET
  @Path("/verify/")
  @RolesAllowed("users")
  public Response verifyPermission(@QueryParam("permissionId") String permissionId) throws Exception {
    authService = new AuthService(); 
    JSONObject json = authService.verifyPermission(permissionId);     
    return Response.ok(json.toString(), MediaType.APPLICATION_JSON).build();    
  }
  
  @GET
  @Path("/auth/{profileId}/")
  @RolesAllowed("users")
  public Response auth(@PathParam("profileId") String profileId) {
    authService = new AuthService(); 
    String content = authService.authenticate(null, profileId);    
    return Response.ok(content, MediaType.APPLICATION_JSON).build();    
  }

  @GET
  @Path("/hasOneOneCallPermission/{userId}/")
  @RolesAllowed("users")
  public Response hasOneOneCallPermission(@PathParam("userId") String userId) throws Exception {
    VideoCallService videoCallService = new VideoCallService();
    boolean hasOneOneCallPermission = !videoCallService.isTurnOffVideoCallForUser(false, userId);
    return Response.ok(String.valueOf(hasOneOneCallPermission)).build();
  }

  @GET
  @Path("/callOneOne/{toUser}/{meetingId}")
  @RolesAllowed("users")
  public Response callOneOne(@PathParam("toUser") String toUser, @PathParam("meetingId") String meetingId) throws Exception {
    CacheControl cacheControl = new CacheControl();
    cacheControl.setNoCache(true);

    boolean canCall = VideoCallService.callOneOne(toUser, meetingId);
    WebNotificationSender.sendJsonMessage(toUser, new MessageInfo().setId(meetingId).from(ConversationState
            .getCurrent().getIdentity().getUserId()));
    return Response.ok(canCall).cacheControl(cacheControl).build();
  }

  @GET
  @Path("/call11/{callee}")
  @RolesAllowed("users")
  public Response call11(@PathParam("callee") String callee) throws Exception {
    CacheControl cacheControl = new CacheControl();
    cacheControl.setNoCache(true);


    WebNotificationSender.sendJsonMessage(callee, new MessageInfo().setId("Popup").from(ConversationState
            .getCurrent().getIdentity().getUserId()));
    return Response.ok().cacheControl(cacheControl).build();
  }

  @GET
  @Path("/call11Ready/{caller}")
  @RolesAllowed("users")
  public Response call11Ready(@PathParam("caller") String caller) throws Exception {
    CacheControl cacheControl = new CacheControl();
    cacheControl.setNoCache(true);


    WebNotificationSender.sendJsonMessage(caller, new MessageInfo().setId("Ready").to(caller));
    return Response.ok().cacheControl(cacheControl).build();
  }

  @GET
  @Path("/finishOneOne/{toUser}")
  @RolesAllowed("users")
  public Response finishOneOne(@PathParam("toUser") String toUser) throws Exception {
    CacheControl cacheControl = new CacheControl();
    cacheControl.setNoCache(true);

    VideoCallService.finishCall(toUser);
    return Response.ok().cacheControl(cacheControl).build();
  }

  @GET
  @Path("/getMeetingId/{toUser}")
  @RolesAllowed("users")
  public Response getMeetingId(@PathParam("toUser") String toUser) throws Exception {
    CacheControl cacheControl = new CacheControl();
    cacheControl.setNoCache(true);

    String meetingId = VideoCallService.getMeetingId(toUser);
    return Response.ok(meetingId).cacheControl(cacheControl).build();
  }
}
