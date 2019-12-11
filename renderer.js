// electron-packager . --asar --overwrite
var $ = require("jquery");
var sq = require('sqlite3');
var fs = require('fs');
const Store = require('electron-store');
const store = new Store();
sq.verbose(); 
if (store.get('masterPass')) { 
	var encryptor = require('simple-encryptor')(store.get('masterPass'));
}
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
function getUserHome() {
	return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
console.log();
// Cross-platform 
if(process.platform == "linux") {
	get_line('/home/'+user+'/.mozilla/firefox/profiles.ini', 1, function(err, line){
		defaulPath = line.replace('Default=Profiles/','');		
	  })
	pathMoz = '/home/'+user+'/.mozilla/firefox/'+defaulPath+'/cookies.sqlite';

} else if (process.platform == "win32" || process.platform == "win64") {
	var getUser = getUserHome();
	get_line(getUser + '\\AppData\\Roaming\\Mozilla\\Firefox\\profiles.ini', 1, function(err, line){
		defaulPath = line.replace('Default=Profiles/','');		
		defaulPathSan = defaulPath.replace(/\s/g, '');
	  })
	pathMoz = getUser + '\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\'+defaulPathSan+'\\cookies.sqlite';

} /* else if (opsys == "darwin") {
	pathMoz = '';
} */
console.log(pathMoz);
// TODO 1/ Trouver le dossier utilisateur mozzila
// TODO 2/ Faire un Cross Plateforme, motherfucker!
// var db = new sq.Database('/home/atmo/.mozilla/firefox/zpbmz7ql.default-release/cookies.sqlite');
var db = new sq.Database(pathMoz);
 

$("#displayDebug").click(function(e){
	var debugReturn = encryptor.decrypt(store.get('twitterSessions'));
 
	if (debugReturn != null){	
		$("#returnDebug").replaceWith('value:'+debugReturn[0].value);
	} else
		$("#returnDebug").replaceWith('false');
	console.log(encryptor.decrypt(store.get('twitterSessions')));
});

$("#instaInject").click(function(){
console.log('go sql');
 	r = encryptor.decrypt(store.get('instaSessions'));
	
	db.run("INSERT INTO moz_cookies (baseDomain, creationTime, expiry, host, inBrowserElement, isHttpOnly, isSecure, lastAccessed, name, originAttributes, path, rawSameSite, sameSite, value) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [r[0].baseDomain, r[0].creationTime, r[0].expiry, r[0].host, r[0].inBrowserElement, r[0].isHttpOnly, r[0].isSecure, r[0].lastAccessed, r[0].name, r[0].originAttributes, r[0].path, r[0].rawSameSite, r[0].sameSite, r[0].value]);
});

$("#twitterInject").click(function(){
console.log('go sql');
 	r = encryptor.decrypt(store.get('twitterSessions'));
	
	db.run("INSERT INTO moz_cookies (baseDomain, creationTime, expiry, host, inBrowserElement, isHttpOnly, isSecure, lastAccessed, name, originAttributes, path, rawSameSite, sameSite, value) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [r[0].baseDomain, r[0].creationTime, r[0].expiry, r[0].host, r[0].inBrowserElement, r[0].isHttpOnly, r[0].isSecure, r[0].lastAccessed, r[0].name, r[0].originAttributes, r[0].path, r[0].rawSameSite, r[0].sameSite, r[0].value]);
});

$("#githubInject").click(function(){
console.log('go sql');
 	r = encryptor.decrypt(store.get('githubSessions'));
	
	db.run("INSERT INTO moz_cookies (baseDomain, creationTime, expiry, host, inBrowserElement, isHttpOnly, isSecure, lastAccessed, name, originAttributes, path, rawSameSite, sameSite, value) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [r[0].baseDomain, r[0].creationTime, r[0].expiry, r[0].host, r[0].inBrowserElement, r[0].isHttpOnly, r[0].isSecure, r[0].lastAccessed, r[0].name, r[0].originAttributes, r[0].path, r[0].rawSameSite, r[0].sameSite, r[0].value]);
}); 
if (!store.get('masterPass')) {
	$(function() {
		var modal = UIkit.modal("#modal-group-1",{'bgClose':false});
		modal.show(); 
	});
	$("#addPass").click(function(e){
		store.set('masterPass',$('#pass').val());
		console.log($('#pass').val());
 
     $(this).attr('disabled',true);
     $("#addPass").text('Master pass ajouté!');
	 location.reload();
 
	});
}

$("#deleteSessionLocal").click(function(e){
	store.delete('instaSessions');
	store.delete('twitterSessions');
	store.delete('githubSessions');
	$("#deleteReturn").replaceWith('<span class="uk-text-success"><span class="uk-margin-small-right" uk-icon="check"></span> Sessions effacer</span>');
});

$("#deleteMoz_cookies").click(function(e){
	db.run("DELETE FROM moz_cookies;");
	$("#deleteMoz_cookiesReturn").replaceWith('<span class="uk-text-success"><span class="uk-margin-small-right" uk-icon="check"></span> Sessions effacer</span>');
});

$("#insta").click(function(e){

	let instaDump = `SELECT * FROM moz_cookies WHERE baseDomain='instagram.com' AND name = 'sessionid';`;
	db.all(instaDump, [], (err, rows) => {
		if (err) {
			throw err;
		}
		var objEnc = encryptor.encrypt(rows);
		 // Store session
 		 store.set('instaSessions', objEnc);
	 	$("#instaDump").replaceWith('<span class="uk-text-success"><span class="uk-margin-small-right" uk-icon="check"></span> Dump OK!</span>');
		$(this).attr('disabled',true);

		$("#instaInjectButton").show();
		$("#insta").hide();
	});
});

$("#twitter").click(function(e){

	let twitterDump = `SELECT * FROM moz_cookies WHERE baseDomain='twitter.com' AND name = 'auth_token';`;
	db.all(twitterDump, [], (err, rows) => {
		if (err) {
			throw err;
		}
		var objEnc = encryptor.encrypt(rows);
		store.set('twitterSessions', objEnc); // Store session
	 	$("#twitterDump").replaceWith('<span class="uk-text-success"><span class="uk-margin-small-right" uk-icon="check"></span> Dump OK!</span>');
		$(this).attr('disabled',true);

		$("#twitterInjectButton").show();
		$("#twitter").hide();
	});
});

$("#github").click(function(e){

	let githubDump = `SELECT * FROM moz_cookies WHERE baseDomain='github.com' AND name = 'user_session';`;
	db.all(githubDump, [], (err, rows) => {
		if (err) {
			throw err;
		}
		var objEnc = encryptor.encrypt(rows);
		store.set('githubSessions', objEnc); // Store session
	 	$("#githubDump").replaceWith('<span class="uk-text-success"><span class="uk-margin-small-right" uk-icon="check"></span> Dump OK!</span>');
		$(this).attr('disabled',true);

		$("#githubInjectButton").show();
		$("#github").hide();
	});
});


let instagramExist = `SELECT baseDomain FROM moz_cookies WHERE baseDomain='instagram.com' AND name = 'sessionid';`;
db.all(instagramExist, [], (err, rows) => {

	if (err) {
		throw err;
	} 
	if (rows != '') {
		$("#instagramDetected").replaceWith('<span class="uk-text-success"><span class="uk-margin-small-right" uk-icon="check"></span> Instagram login detecté</span>');
	} else {
		$("#instagramDetected").replaceWith('<span class="uk-text-danger"><span class="uk-margin-small-right" uk-icon="close"></span> Aucun login detecté</span>');
		$('#insta').attr('disabled','disabled');
		$( "#optionButonInsta" ).remove();
		$( "#optionMenuInsta" ).remove();
		}	
		if (store.get('instaSessions')) {
			$("#instaInjectButton").show();
			$("#insta").hide();			
		}

});

let twitterExist = `SELECT baseDomain FROM moz_cookies WHERE baseDomain='twitter.com' AND name = 'auth_token';`;
db.all(twitterExist, [], (err, rows) => {

	if (err) {
		throw err;
	}  
	if (rows != '') {
		$("#twitterDetected").replaceWith('<span class="uk-text-success"><span class="uk-margin-small-right" uk-icon="check"></span> Twitter login detecté</span>');
	} else {
		$("#twitterDetected").replaceWith('<span class="uk-text-danger"><span class="uk-margin-small-right" uk-icon="close"></span> Aucun login detecté</span>');
		$('#twitter').attr('disabled','disabled');
		$( "#optionButonTwitter" ).remove();
		$( "#optionMenuTwitter" ).remove();
		}
		if (store.get('twitterSessions')) {
			$("#twitterInjectButton").show();
			$("#twitter").hide();			
		}
});

let githubExist = `SELECT baseDomain FROM moz_cookies WHERE baseDomain='github.com' AND name = 'user_session';`;
db.all(githubExist, [], (err, rows) => {

	if (err) {
		throw err;
	}  
	if (rows != '') {
		$("#githubDetected").replaceWith('<span class="uk-text-success"><span class="uk-margin-small-right" uk-icon="check"></span> Github login detecté</span>');
	} else {	
		$("#githubDetected").replaceWith('<span class="uk-text-danger"><span class="uk-margin-small-right" uk-icon="close"></span> Aucun login detecté</span>');
		$('#github').attr('disabled','disabled');
		$( "#optionButonGithub" ).remove();
		$( "#optionMenuGithub" ).remove();
		}
		if (store.get('githubSessions')) {
			$("#githubInjectButton").show();
			$("#github").hide();			
		}

});

