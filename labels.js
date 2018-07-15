
function updateCounters()
{
	var all = $('#logtable tbody tr').length;	
	var v = $('#logtable tbody tr:visible').length;	
	$('#logcounters').html(v+' / '+all);
}
function updateScreen()
{
	startProcessingTimer("updateScreen");
	$("input:checkbox").each(function(){
		s = '.'+$(this).val();
		if($(this).is(':checked'))
			$(s).show();
		else
			$(s).hide();
	});	
	updateCounters();
	stopProcessingTimer();
}
function compare_count(a,b) {
	
	var acnt = $('tr.'+a.class).length;
	var bcnt = $('tr.'+b.class).length;
	
	if (acnt < bcnt)
		return 1;
	if (acnt > bcnt)
		return -1;
	return 0;
}

function compare_name(a,b) {
	if (a.name < b.name)
		return -1;
	if (a.name > b.name)
		return 1;
	return 0;
}
function changeColor(hex){
	
}
function setLabelBGColor(cl, hex)
{
	for(var i=0; i<labels.length;i++)
	{
		if(labels[i].class === cl)
		{
			labels[i].bgcolor=hex;
			break;
		}
	}
}

function setLabelFGColor(cl, hex)
{
	for(var i=0; i<labels.length;i++)
	{
		if(labels[i].class === cl)
		{
			labels[i].fgcolor=hex;
			break;
		}
	}
}
function dec2Hex(d) {
  var hex = Number(d).toString(16);
  hex = "00".substr(0, 2 - hex.length) + hex; 
  return hex;
}
function getColorCode(name, offset)
{
	var idx;
	
	
	idx = parseInt(name.replace("label",""));
	
	var m = idx % 24;

	var r = m%24 + offset;
	var g = (m+12) %24 + offset;
	var b = (24-m) % 24 + offset;
	
	var ret = dec2Hex(r*8)+dec2Hex(g*8)+dec2Hex(b*8);
	
	return '#'+ret;
	
}

function addColorPicker(cl, ccode, onchange){
	$(cl).ColorPicker({
		color: ccode,
		onShow: function (colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onHide: function (colpkr) {
			$(colpkr).fadeOut(500);
			return false;
		},
	
		onChange: function (hsb, hex, rgb) {
			onchange(hsb, hex, rgb);
		}
	});
}
function createLabel(name, cl, bgcolor, fgcolor)
{
	if($('tr.'+cl).length <= 0)
		return;

	bgcolor = typeof bgcolor !== 'undefined' ? bgcolor : "";
	fgcolor = typeof fgcolor !== 'undefined' ? fgcolor : "";

	if(bgcolor === "")
		bgcolor = loadUserDataColor(name, 'bgcolor');
	
	if(fgcolor === "")
		fgcolor = loadUserDataColor(name, 'fgcolor');

	
	if(findUserDataIndex('labels', name) < 0)
		button_name = 'Save';
	else
		button_name = 'Remove';

	var s="";
	s = "";
	s += '<div class="div_lbl" id="div_'+cl+'">';
	s += ' <a href="#" id=\"save_remove_'+cl+'\" class="label_ops" value="'+cl+'">'+button_name+'</a>';
	s += ' <input class="label_checkbox cb_'+cl+'" type="checkbox" value="'+cl+'"/>';
	s += '<span id="span_label_'+cl+'" >'+name+'</span>';
	s +=' <span class="light">'+$('tr.'+cl).length+ ' </span>';
	s +=' <span id="span_fg_'+cl+'"> - FG </span>';
	s +=' <span id="span_bg_'+cl+'" > - BG </span>';
	s +=' <span id="span_first_'+cl+'"> - First </span>';
	s +=' <span id="span_last_'+cl+'" > - Last </span>';
	s += '</div>';
	
	
	$('#labels').append(s);	
	
	$('input.cb_'+cl).click(function(){
		toggleCheckbox(this);
	});

	$('a#save_remove_'+cl).click(function(){
		var t = $(this).text();
		if(t === 'Save'){
			addUserDataLabel(name);
			t = 'Remove';
		}
		else{
			removeUserDataLabel(name);
			t = 'Save';
		}
		$(this).html(t);
	});

	var bg = bgcolor;
	var fg = fgcolor;
	
	if(bgcolor === "")
		bg = getColorCode(cl, 8);

	if(fgcolor === "")
		fg = getColorCode(cl, 8);
	
	
	//addColorPicker('#span_bg_'+cl, lbl, function(hsb, hex, rgb){
	addColorPicker('#span_bg_'+cl, bg, function(hsb, hex, rgb){
		//$('#span_bg_'+cl).css('background-color', '#' + hex);
		$('#div_'+cl).css('background-color', '#' + hex);
		$('tr.'+cl).css('background-color', '#' + hex);
		saveUserDataColor(name, 'bgcolor', hex);
	});

	addColorPicker('#span_label_'+cl, bg, function(hsb, hex, rgb){
		$('#logtable').find('tbody').find('tr.'+cl).each(function(){
			if($(this).find('#log').find('span.'+cl).length > 0)
				return;
			// add span for serach label name
			//var s = $(this).find('#log').html();
			var s = $(this).find('#log').text();
			var h = replaceAll(s, name, '<span class="'+cl+'">'+name+'</span>');
			$(this).find('#log').html(h);
		});

		$('#span_label_'+cl).css('background-color', '#' + hex);
		$('span.'+cl).css('background-color', '#' + hex);
	});

	addColorPicker('#span_fg_'+cl, fg, function(hsb, hex, rgb){
		$('#span_fg_'+cl).css('color', '#' + hex);
		$('#span_label_'+cl).css('color', '#' + hex);
		$('.'+cl).css('color', '#' + hex);
		saveUserDataColor(name, 'fgcolor', hex);
	});
	$('#span_first_'+cl).click(function(){
		var p = $('.'+cl+':visible:first').offset();
		$(window).scrollTop(p.top-50);		
	});
	$('#span_last_'+cl).click(function(){
		var p = $('.'+cl+':visible:last').offset();
		$(window).scrollTop(p.top-50);		
	});
	
	if(bgcolor !== "")
	{
		$('#div_'+cl).css('background-color', '#' + bgcolor);
		$('tr.'+cl).css('background-color', '#' + bgcolor);
	}
	if(fgcolor !== "")
	{
		$('#span_fg_'+cl).css('color', '#' + fgcolor);
		$('#span_label_'+cl).css('color', '#' + fgcolor);
		$('.'+cl).css('color', '#' + fgcolor);
	}
}

function toggleCheckbox(cb)
{
	startProcessingTimer($(cb).val());
	s = 'tr.'+$(cb).val();
	if($(cb).is(':checked'))
		$('#logtable').find('tbody').find(s).show();
	else
		$('#logtable').find('tbody').find(s).hide();

	updateCounters();
	stopProcessingTimer();
}
function createLabels(sort)
{
	startProcessingTimer("createLabels");
	labelIndex = labels.length;
	
	if(sort === "count")
		labels.sort(compare_count);
	else if(sort === "name")
		labels.sort(compare_name);
	
	for(i=0;i<labels.length;i++){
		createLabel(labels[i].name, labels[i].class, labels[i].bgcolor, labels[i].fgcolor);
	}
	stopProcessingTimer();
}
function refreshLabels(sort)
{
	$('#labels').html('');		
	createLabels(sort);
}
function _replaceAll(str, search, replace){
	while(str.indexOf(search) !== -1)
        str = str.replace(search, replace);		
	return str;
}
function replaceAll(s, r, n){
	s = _replaceAll(s, r, "__YASAM__");
	s = _replaceAll(s, "__YASAM__", n);
	return s;
}
function isLabelExist(name)
{
	var l = labels.length;
	
	for(var i=0; i< l; i++)
		if(labels[i].name === name)
			return true;

	return false;
}
function addLabel(name, isRegex, bgcolor, fgcolor){
	
	
	bgcolor = typeof bgcolor !== 'undefined' ? bgcolor : "";
	fgcolor = typeof fgcolor !== 'undefined' ? fgcolor : "";
	
	isRegex = isRegex || false;
	var idx = labelIndex;
	var cl = 'label'+idx;
	var src_str = name;

	if(isLabelExist(name))	// don't add twice
		return;

	
	
	if(isRegex)
	{
		var tmp = name.replace('\\', '\\\\');
		var list = name.split('/');
		if(list.length <2)
		{
			alert("Invalid regex format. Regex should start with '/'");
			return;
		}
		if(list.length > 2)
			src_str = new RegExp(list[1], list[2]);
		else
			src_str = new RegExp(list[1]);
	}

	startProcessingTimer("addLabel : "+name);

	labelIndex++;
	labels.push({name:name, class:cl, bgcolor:"",fgcolor:""});
	
	// find labels
	
	//var l = table_rows.length;
	
	//for(var i=0; i<l;i++){
	$('#logtable').find('tbody').find('tr').each(function(){
		var s = $(this).find('#log').text();
		//var r = table_rows[i];
		//var s = $(r).find('#log').text();
		if(isRegex){
			if(s.search(src_str) >= 0)
				$(this).addClass(cl);
		}
		else{
			if(s.indexOf(src_str) >= 0)
				$(this).addClass(cl);
		}
	//}
	});
	createLabel(name, cl, bgcolor, fgcolor);
	
	stopProcessingTimer();
	return cl;
}
function addIndexLabel(start,end){
	var idx = labelIndex;
	var cl = 'label'+idx;
	var name = "[ " + start.toString()+" - "+end.toString()+ " ]";
	
	startProcessingTimer("addIndexLabel:"+start+":"+end);
	labelIndex++;
	labels.push({name:name, class:cl, bgcolor:"", fgcolor:""});
	
	
	$('#logtable').find('tbody').find('tr').slice(start-1, end).addClass(cl);
	
	createLabel(name, cl);
	stopProcessingTimer();
}
function deleteLabel(l){
	var s = $(l).attr('value');
	$('#logtable tbody tr.'+s).remove();	
	$('#div_'+s).remove();
	updateCounters();
}
function hideLabel(l){
	var s = $(l).attr('value');
	$('#div_'+s).hide();
	updateCounters();
}

function removeLabels()
{
	for(var i=0; i< labels.length; i++){
		$('#logtable tbody tr .'+labels[i].class).removeClass(labels[i].class);
		$('#div_'+labels[i].class).remove();
	}
	
	labelIndex = 0;
}

function createUserDataLabels(){
	if(typeof USER_DATA['labels'] ==='undefined' )
		return;
	
	startProcessingTimer("createUserDataLabels");
	
	var l = USER_DATA.labels.length;
	
	for(var i=0; i< l; i++){
		var lbl = USER_DATA.labels[i];
		addLabel(lbl.name);
	}
	stopProcessingTimer();
}

function autoDetectLabels(){
	startProcessingTimer("autoDetectLabels");
	addLabel("FATAL", false);
	addLabel("APGLIB", false);
	addLabel("[UCBIN-SERVER]", false);
	addLabel("[NVRAM]", false);
	addLabel("CHAN_NO_LONGER_VISIBLE", false);
	addLabel("OPENGL_DL", false);
	addLabel("OPENGL Error", false);
	addLabel("CORE_ReadNvram", false);
	addLabel("CORE_WriteNvram", false);
	addLabel("[AUTHORIZATION]", false);
	addLabel("requestTune", false);
	addLabel("notifyTune", false);
	addLabel('but the station is incorrect', false);
	addLabel("captureInitialized(): submit CaptureBuffer", false);
	addLabel("MediaPlayerProxy.load()", false);
	addLabel("- stop(): acquireResources", false);
	addLabel("DEADLOCK", false);
	addLabel("DUMPSTACK", false);
	addLabel("dropping key!", false);
	addLabel("at com/", false);
	addLabel("java.io.", false);
	addLabel("java.lang.", false);
	addLabel("com.directv.mw.util.", false);
	addLabel("[KD]: DispatchKey=1", false);
	addLabel("DispatchKey[0]", false);
	addLabel("DispatchKey[1]", false);
	addLabel("DispatchKey[2]", false);
	addLabel("DispatchKey[3]", false);
	addLabel('Genie', false);
	addLabel('showOsd', false);
	addLabel("removeOsd", false);
	addLabel("*** MAC:", false);
	stopProcessingTimer();
}

