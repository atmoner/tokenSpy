const { app, BrowserWindow, Menu } = require('electron')
var sq = require('sqlite3');
var fs = require('fs');
var basepath = app.getAppPath();

// Definit le stockage des donnée dans le dossier du programme
app.setPath ('userData', basepath + '/store');
const userDataPath = app.getPath ('userData');
const Store = require('electron-store');
const store = new Store();
//console.log(store.delete('masterPass'));
// Gardez une reference globale de l'objet window, si vous ne le faites pas, la fenetre sera
// fermee automatiquement quand l'objet JavaScript sera garbage collected.
let win
let user = process.env.USER || "";
var pathMoz = "";

// Get path moz
function get_line(filename, line_no, callback) {
    var data = fs.readFileSync(filename, 'utf8');
    var lines = data.split("\n");

    if(+line_no > lines.length){
      throw new Error('File end reached without finding line');
    }

    callback(null, lines[+line_no]);
}

function createWindow () {
  // Créer le browser window.
  win = new BrowserWindow({
    width: 420,
    height: 650,
	icon: 'logo.png',
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Ouvre les DevTools.
  // win.webContents.openDevTools()

  // Émit lorsque la fenêtre est fermée.
  win.on('closed', () => {
    // Dé-référence l'objet window , normalement, vous stockeriez les fenêtres
    // dans un tableau si votre application supporte le multi-fenêtre. C'est le moment
    // où vous devez supprimer l'élément correspondant.
	store.delete('masterPass');
    win = null
  })

  // Other code removed for brevity

	// Cross-platform 
	if(process.platform == "linux") {
		get_line('/home/'+user+'/.mozilla/firefox/profiles.ini', 1, function(err, line){
			defaulPath = line.replace('Default=','');		
		  })
		pathMoz = '/home/'+user+'/.mozilla/firefox/'+defaulPath+'/cookies.sqlite';

	} else if (process.platform == "win32" || process.platform == "win64") {
		var getUser = getUserHome();
		get_line(getUser + '\\AppData\\Roaming\\Mozilla\\Firefox\\profiles.ini', 1, function(err, line){
			defaulPath = line.replace('Default=Profiles/','');		
			defaulPathSan = defaulPath.replace(/\s/g, '');
		  })
		pathMoz = getUser + '\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\'+defaulPathSan+'\\cookies.sqlite';

	}
	var db = new sq.Database(pathMoz);
  // Menu
  var menu = Menu.buildFromTemplate([
      {
          label: 'Menu',
          submenu: [
              {label:'Github',
		            click() {  
						require("electron").shell.openExternal("https://github.com/atmoner/tokenSpy");
		            } 
				},
              {label:'Report issue',
		            click() {  
						require("electron").shell.openExternal("https://github.com/atmoner/tokenSpy/issues");
		            } 
				},
              {label:'Quitter', 
		            click() { 
		                app.quit() 
		            } 
				}
          ],
      },
      {
          label: 'Action',
          submenu: [
              {label:'Delete local token',
		            click() {  
						store.delete('instaSessions');
						store.delete('twitterSessions');
						store.delete('githubSessions');
						store.delete('masterPass');
		            } 
				},
              {label:'Delete mozilla cookies',
		            click() {  
						db.run("DELETE FROM moz_cookies;");
		            } 
				}
          ],
      }
  ])
  Menu.setApplicationMenu(menu); 

}

// Cette méthode sera appelée quand Electron aura fini
// de s'initialiser et sera prêt à créer des fenêtres de navigation.
// Certaines APIs peuvent être utilisées uniquement quand cet événement est émit.
app.on('ready', createWindow)

// Quitte l'application quand toutes les fenêtres sont fermées.
app.on('window-all-closed', () => {
  store.delete('masterPass');
  // Sur macOS, il est commun pour une application et leur barre de menu
  // de rester active tant que l'utilisateur ne quitte pas explicitement avec Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // Sur macOS, il est commun de re-créer une fenêtre de l'application quand
  // l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres d'ouvertes.
  if (win === null) {
    createWindow()
  }
})

// Dans ce fichier, vous pouvez inclure le reste de votre code spécifique au processus principal. Vous pouvez également le mettre dans des fichiers séparés et les inclure ici.


