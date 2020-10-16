import { app, BrowserWindow,Tray,Menu,globalShortcut,ipcMain,Notification, dialog} from 'electron'
import path from 'path'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let appTray
var notification
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
 
function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    backgroundColor:'#fff',
    useContentSize: true,
    width: 1020,
    height: 563,
    minWidth:1020,
    minHeight: 563,
    webPreferences: {
      webSecurity: false, // 是否禁用浏览器的跨域安全特性
      nodeIntegration: true // 是否完整支持node
    },
    // resizable: false, //禁止改变主窗口尺寸
    icon:path.join(__static,'./icon.ico'),
    show: false, // 先隐藏
    // frame:false
  })
 
  mainWindow.loadURL(winURL)
  mainWindow.on('ready-to-show', function () {
    mainWindow.show() // 初始化后再显示
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.setMenu(null)
 
}
   // 设置托盘
function implementSystemTray(){
  let timer=null,count=0
  appTray = new Tray(path.join(__static,'./icon.ico'))
  const trayContextMenu = Menu.buildFromTemplate([
    {
      label:'打开',
      click:()=>{
        mainWindow.show()
      }
    },
     {
      label:'退出',
      click:()=>{
        app.quit()
      }
    }
  ])
  appTray.setToolTip('妮姬客服系统')
  //系统托盘图标闪烁
  ipcMain.on('message_tray', () => {
      if (!mainWindow.isFocused()) {
            if(timer) return
            timer=setInterval(function() {
              count++;
              if (count%2 == 0) {
                appTray.setImage(path.join(__static,'./icon.ico'))
              } else {
                appTray.setImage(path.join(__static,'./favicon.ico'))
              }
          }, 500);
      } 
        
    })
  mainWindow.on('focus',()=>{
      mainWindow.flashFrame(false);
      clearInterval(timer);
      timer = null
      appTray.setImage(path.join(__static,'./icon.ico'))
    })
  appTray.on('click',()=>{
    if (mainWindow.isVisible()) {
     if(!mainWindow.isFocused()){
        mainWindow.focus()
      }else {
        mainWindow.hide();
      }
    } else {
         mainWindow.show();
    }
  })
  appTray.on('right-click',()=>{
    appTray.popUpContextMenu(trayContextMenu)
  })
}
// // 关闭应用前事件
// app.on('before-quit',(event)=>{
//   console.log(1)
//   event.preventDefault()
//     mainWindow.webContents.send('before_closed');
// })
// app.on('close',(event)=>{
//   console.log(2)
//   event.preventDefault()
//   mainWindow.webContents.send('before_closed');
// })
// app.on('quit',(event)=>{
//   console.log(3)
//   event.preventDefault()
//   mainWindow.webContents.send('before_closed');
// })
// app.on('will-quit',(event)=>{
//   console.log(4)
//   event.preventDefault()
//   mainWindow.webContents.send('before_closed');
// })

app.on('window-all-closed', (event) => {
  console.log(5)
  // event.preventDefault()
  mainWindow.webContents.send('before_closed');
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// 任务栏的闪烁
ipcMain.on('message_prompt', () => {
  if(!mainWindow.isFocused()){
    mainWindow.flashFrame(true);
  }
})

ipcMain.on('isVisible_box', (event,data) => {
 notification = new Notification({
  // 通知的标题, 将在通知窗口的顶部显示
  title: '妮姬客服',
  // 通知的副标题, 显示在标题下面 macOS
  subtitle: '',
  // 通知的正文文本, 将显示在标题或副标题下面
  body:data,
  // false有声音，true没声音
  silent: true,
  icon:path.join(__static,'./logo.png') ,
  timeoutType: 'default',
})
if(!mainWindow.isFocused()){
  notification.show()
}
notification.on('click',()=>{
  mainWindow.show()
})
  
})
app.on('ready', async ()=>{
  // 创建渲染窗口
  createWindow()
  implementSystemTray()
  // 设置快捷键
  globalShortcut.register('Ctrl+Alt+Z', function () {
    mainWindow.show()
  })
 
})