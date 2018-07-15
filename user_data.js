var USER_DATA = {};

function loadUserData()
{
	var data = window.localStorage.getItem("USER_DATA");
	

	USER_DATA.colors = new Array();
	USER_DATA.labels = new Array();
	
	if(data === null){
		return;	
	}
		
	try {
			USER_DATA = $.parseJSON(data);
	} catch (e) {
	}
}
function saveUserData(){
	var data = JSON.stringify(USER_DATA);
	
	window.localStorage.setItem("USER_DATA", data);
}
function resetUserDataColor(){
	USER_DATA.colors = [];
	saveUserData();
}
function resetUserDataLabel(){
	USER_DATA.labels = [];
	saveUserData();
}
function findUserDataIndex(arr, name){
	var ret = -1;
	if(typeof USER_DATA[arr] ==='undefined' )
		return -1;
	
	//startProcessingTimer('findUserDataIndex'+arr+':'+name);
	var l = USER_DATA[arr].length;
	for(var i=0; i<l;i++){
		if(USER_DATA[arr][i].name === name){
			ret = i;
			break;
		}
	}
	//stopProcessingTimer();
	return ret;
}
function loadUserDataColor(name, field){
	var idx=0;
	
	//alert(name+':'+field);
	idx = findUserDataIndex('colors', name);
	if(idx < 0)
		return "";
	
	if(typeof USER_DATA.colors[idx][field] !== "undefined")
		return USER_DATA.colors[idx][field];
	
	return "";
}
function removeUserDataColor(name)
{
	var idx=0;
	
	loadUserData();
	
	idx = findUserDataIndex('colors', name);
	
	if(idx < 0)
		return;
	
	USER_DATA.colors.splice(idx, 1);
	
	saveUserData();
}
function saveUserDataColor(name, field, value)
{
	var idx=0;
	var e = {};
	
	loadUserData();
	
	if(typeof USER_DATA['colors'] ==='undefined' )
		USER_DATA.colors = new Array();

	idx = findUserDataIndex('labels', name);
	if(idx < 0)
		return;
	
	idx = findUserDataIndex('colors', name);
	if(idx < 0){
		e.name = name;
		e[field] = value;
		USER_DATA.colors.push(e);
	}
	else{
		USER_DATA.colors[idx][field] = value;
	}
	saveUserData();
}
function removeUserDataLabel(name)
{
	var idx=0;
	
	loadUserData();
	
	idx = findUserDataIndex('labels', name);
	if(idx < 0){
		alert("'"+name+"' is not in the list.");
	}
	else{
		USER_DATA.labels.splice(idx, 1);
		//alert("'"+name+"' has been removed.");
		saveUserData();
	}
}	
	
function addUserDataLabel(name)
{
	var idx=0;
	
	loadUserData();
	
	if(typeof USER_DATA['labels'] ==='undefined' )
		USER_DATA.labels = new Array();
	
	idx = findUserDataIndex('labels', name);
	if(idx < 0){
		var e = {};
		e.name = name;
		USER_DATA.labels.push(e);
		saveUserData();
		//alert("'"+name+"' has been saved.");
	}
	else{
		alert("'"+name+"' is already saved.");
	}
}

function colorSettings(){
	loadUserData();
	
	var i =0;
	var l = USER_DATA.colors.length;
	
	$("#color_list").html('');
	
	for(i = 0 ; i< l;i++){
		var id = "cs_label_"+i;
		var c = USER_DATA.colors[i];
		
		var s = '<p id="'+id+'">';
		s += ' <a href="#" class="label_ops delete_color" >Delete</a>';
		s += ' <span>'+c.name+'</span>';
		s += '</p>';
		
		$("#color_list").append(s);
		
		if(typeof c['bgcolor'] !== "undefined")
			$('#'+id).css('background-color', '#' + c.bgcolor);
		if(typeof c['fgcolor'] !== "undefined")
			$('#'+id).css('color', '#' + c.fgcolor);
	}
	$('.delete_color').click(function(){
		var name = $(this).parent().find('span').text();
		removeUserDataColor(name);
		$(this).parent().remove();
	});
}
function saveLabelSettings(){
	var lbls = $('#label_list').find('p');
	var l = lbls.length;
	
	USER_DATA.labels = new Array();
	for(var i = 0; i< l; i++){
		var lbl = lbls[i];
		var a = {};
		a.name = $(lbl).find('span').text();
		USER_DATA.labels.push(a);
	}
	
	saveUserData();
	
}
function labelSettings(){
	
	loadUserData();
	
	var i =0;
	var l = USER_DATA.labels.length;
	
	$("#label_list").html('');
	
	for(i = 0 ; i< l;i++){
		
		var lbl = USER_DATA.labels[i];
		
		var s = '<p>';
		s += ' <a href="#" class="label_ops delete_label" >Delete</a>';
		s += ' <span>'+lbl.name+'</span>';
		s += ' <a href="#" class="label_ops up_label" > UP </a>';
		s += ' <a href="#" class="label_ops down_label" > DOWN </a>';
		s += '</p>';
		
		$("#label_list").append(s);
		
	}
	
	$('.delete_label').click(function(){
		var name = $(this).parent().find('span').text();
		removeUserDataLabel(name);
		$(this).parent().remove();
	});

	$('.up_label').click(function(){
		var p = $(this).parent();
		
		$(p).insertBefore($(p).prev());
		saveLabelSettings();
	});
	
	$('.down_label').click(function(){
		var p = $(this).parent();
		var n = $(p).next();
		
		$(n).insertBefore(p);
		saveLabelSettings();
	});
}
function loadDefaultLabels(){
	resetUserDataLabel();
	
	addUserDataLabel('MediaPlayer(S0');
	addUserDataLabel('MediaPlayer(S1)');
	addUserDataLabel('MediaPlayer(S2)');
	addUserDataLabel('MediaPlayer(S3)');
	
	addUserDataLabel('LocalPlayer');
	addUserDataLabel('RemotePlayer(1)');
	addUserDataLabel('RemotePlayer(2)');
	addUserDataLabel('RemotePlayer(3)');
	
	addUserDataLabel('RuiSession(S1)');
	addUserDataLabel('RuiSession(S2)');
	addUserDataLabel('RuiSession(S3)');
	
	addUserDataLabel('DispatchKey[0]');
	addUserDataLabel('DispatchKey[1]');
	addUserDataLabel('DispatchKey[2]');
	addUserDataLabel('DispatchKey[3]');
	
	addUserDataLabel('sessionID: 0');
	addUserDataLabel('sessionID: 1');
	addUserDataLabel('sessionID: 2');
	addUserDataLabel('sessionID: 3');

	addUserDataLabel('MediaPlayerProxy.load()');
	addUserDataLabel('captureInitialized(): submit CaptureBuffer');
	addUserDataLabel('- stop(): acquireResources');
	addUserDataLabel('requestTune');
	addUserDataLabel('watchStation(): request to watch channel');
	addUserDataLabel('watchRecording');

	addUserDataLabel('showOsd');
	addUserDataLabel('removeOsd');
	addUserDataLabel('loadScreen');
	
	addUserDataLabel('java.io.');
	addUserDataLabel('java.lang.');
	addUserDataLabel('com.directv.mw.util.');
	addUserDataLabel('at com/');
	
	addUserDataLabel('GdbSetTimeOfDay_SetTime');

	addUserDataLabel('DEADLOCK');
	addUserDataLabel('WATCHDOG');
	addUserDataLabel('DUMPSTACK');
	addUserDataLabel("dropping key!");
}