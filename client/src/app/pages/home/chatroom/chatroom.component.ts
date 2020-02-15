import { Router, ActivatedRoute } from "@angular/router";
import { UserService } from "../../../user.service";
import { WebsocketService } from "../../../websocket.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-chatroom",
  templateUrl: "./chatroom.component.html",
  styleUrls: ["./chatroom.component.scss"]
})
export class ChatroomComponent implements OnInit {
  private username: String;
  private email: String;
  private chatroom;
  private message: String;
  messageArray: Array<{ user: String; message: String }> = [];
  private isTyping = false;

  constructor(
    private route: ActivatedRoute,
    private webSocketService: WebsocketService,
    private userService: UserService,
    private router: Router
  ) {
    this.webSocketService.newMessageReceived().subscribe(data => {
      this.messageArray.push(data);
      this.isTyping = false;
    });
    this.webSocketService.receivedTyping().subscribe(bool => {
      this.isTyping = bool.isTyping;
    });
  }

  ngOnInit() {
    window.setInterval(function () {
      var elem = document.getElementById("chat-window")
      elem.scrollTop = elem.scrollHeight
    }, 2000)

    this.username = this.route.snapshot.queryParamMap.get("name");
    this.email = this.route.snapshot.queryParamMap.get("email");
    const currentUser = this.userService.getLoggedInUser();
    if (currentUser.email < this.email) {
      this.chatroom = currentUser.email.concat(this.email);
    } else {
      this.chatroom = this.email.concat(currentUser.email);
    }
    this.webSocketService.joinRoom({
      user: this.userService.getLoggedInUser().username,
      room: this.chatroom
    });
    this.userService.getChatRoomsChat(this.chatroom).subscribe(messages => {
      this.messageArray = messages.json();
      console.log(this.messageArray)
    });
  }
  Enter(event) {
    if (event.keyCode === 13) {
      this.sendMessage()
    }
  }
  sendMessage() {
    this.webSocketService.sendMessage({
      room: this.chatroom,
      user: this.userService.getLoggedInUser().username,
      message: this.message
    });
    this.message = "";
  }

  typing(event) {
    if (event.keyCode === 13) {
      return
    }
    this.webSocketService.typing({
      room: this.chatroom,
      user: this.userService.getLoggedInUser().username
    });
  }
}
