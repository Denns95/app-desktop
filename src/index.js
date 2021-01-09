const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const url = require('url');
const path = require('path');
const main = require('electron-reload');
const { ppid } = require('process');

if (process.env.NODE_ENV !== 'production') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
  });
}
let mainWindow, newProductWindow

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'views', 'index.html'),
    protocol: 'file',
    slashes: true
  }))

  const mainMenu = Menu.buildFromTemplate(templateMenu)
  Menu.setApplicationMenu(mainMenu)

  mainWindow.on('closed', () => {
    app.quit();
  })
})


function createNewProductWindow() {
  newProductWindow = new BrowserWindow({
    width: 400,
    height: 330,
    title: 'Add a new Product',
    webPreferences: {
      nodeIntegration: true
    }
  })
  // newProductWindow.setMenu(null)
  newProductWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'views', 'new-product.html'),
    protocol: 'file',
    slashes: true
  }))

  newProductWindow.on('closed', () => {
    newProductWindow = null
  })
}
const isMac = process.platform === 'darwin'

ipcMain.on('product:new', (e, newProduct) => {
  mainWindow.webContents.send('product:new', newProduct);
  newProductWindow.close()
  // console.log(newProduct)
})

const templateMenu = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Product',
        accelerator: 'Ctrl+N',
        click() {
          createNewProductWindow()
        }
      },
      {
        label: 'Remove All Products',
        click() {
          mainWindow.webContents.send('products:remove-all')
        }
      },
      {
        label: 'Exit',
        accelerator: isMac ? 'command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  }
]

if (!isMac) {
  templateMenu.unshift({
    label: app.getName()
  })
}

if (process.env.NODE_ENV !== 'production') {
  templateMenu.push({
    label: 'DevTools',
    submenu: [
      {
        label: ' Show/Hide Dev Tools',
        accelerator: 'Ctrl+D',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}