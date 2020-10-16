
const path = require('path')
export default function() {
  return {
    data() {
      return {
        isPlaying: false
      };
    },
    methods: {
      play() {
        this.lastRunTime = Date.now();
        let audio = document.querySelector("#audio");
        if (!this.isPlaying) {
          audio.play();
          this.isPlaying = true;
        }
        let timeOut = setTimeout(() => {
          this.stop(timeOut);
        }, 1000);
      },
      stop(timeOut) {
        this.currentTime = Date.now();
        let audio = document.querySelector("#audio");
        if (this.currentTime - this.lastRunTime < 1000) {
        } else {
          if (this.isPlaying) {
            audio.currentTime = 0;
            audio.pause();
            this.isPlaying = false;
          }
        }
        clearTimeout(timeOut);
      },
      notification(data) {
        const myNotification = new Notification(`${data.from_name}给你发了一条新消息`, {
            body: ``,
            timeoutType: "default",
            silent: true,
            icon: path.join(__dirname, '../../assets/logo.png')
        });
        myNotification.onclick = () => {
            this.$electron.ipcRenderer.send("message_notification_click", );
        };
    },
    }
  };
}