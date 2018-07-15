<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />	
	<title>Log Parser</title>
	<link rel="stylesheet" type="text/css" href="css/report.css" />
	<script type="text/javascript" src="js/jquery-1.10.2.js"></script>
	<script src="jquery-ui-1.10.3/js/jquery-ui-1.10.3.custom.js"></script>
	<link rel="stylesheet" media="screen" type="text/css" href="css/colorpicker.css" />
	<script type="text/javascript" src="js/colorpicker.js"></script>
	<script type="text/javascript" src="user_data.js"></script>
	<script type="text/javascript" src="key_codes.js"></script>
	<script type="text/javascript" src="labels.js"></script>
</head>
<script  type="text/javascript">
var timers = new Array();	

function getSpaces(n){
	//var s="                                               ";
	//return s.slice(0,n);
	var s = "";
	for(var i=0;i<n;i++)
		s += " ";
	
	return s;
}
function startProcessingTimer(str){
	var e={}
	e.name = str;
	e.start = new Date();
	timers.push(e);
}
function stopProcessingTimer(){
	var e;
	var t = new Date();
	
	try{
		e=timers.pop();
		var d = t.getTime() - e.start.getTime();
		var s = getSpaces(timers.length) + e.name + " : " + d + " ms";
		if(e.name==="CREATION")
			$('#creation_time').html(s);
		else
			$('#processing_time').html(s);
	
		console.log(s);
	}
	catch(err){
		console.log("timers array is empty:"+err);
	}
}
startProcessingTimer("CREATION");
</script>
<body>
<!-- ***************************************************************************
							*** NAVBAR ***
**************************************************************************** -->
<div class="navbar navbar-fixed-top">
		
		
		<button id="replace_keycodes">REPLACE KEY CODES</button>
		|
		New Title:<input name="new_title" id="new_title"/>
		<button id="set_title">SET TITLE</button>
		|
<?php		
		$auto_detect = '';
		$server_processing = '';
		$user_labels = Array();
		
		if($_SERVER['REQUEST_METHOD'] === 'POST'){
			if(array_key_exists('auto_detect',$_POST)){
				$auto_detect = "checked";
			}
			else{
				if(array_key_exists('server_processing', $_POST)){
					$server_processing = 'checked';
					$user_labels = json_decode($_POST['user_labels']);
				}				
			}
		}
?>
<!-- ***************************************************************************
							*** FORM ***
**************************************************************************** -->
		<form method="POST" enctype="multipart/form-data">
			<input name="auto_detect" id="auto_detect" type="checkbox" <?php echo $auto_detect;?>>Auto-detect Labels</input>
			<input name="server_processing" id="server_processing"type="checkbox" <?php echo $server_processing;?>>Process in Server</input>
			<input name="user_labels" type="hidden" value="" id='user_labels'/>
			<input name="logfiles[]" id="logfiles" type="file" multiple="" />
			<button id="submit">SUBMIT</button>
		</form>
		<button id="show_labels" style="display:none;">SHOW LABELS</button>
</div>	
<div id="page">
<!-- ***************************************************************************
							*** LOG TABLE ***
**************************************************************************** -->
<?php

$dt_start = round(microtime(true) * 1000);
if($_SERVER['REQUEST_METHOD'] === 'POST'){
	echo '<span>';
	$total = 0;
	$prefix = '';
	for($i = 0; $i < count($_FILES['logfiles']['name']);$i++){
		echo $prefix;
		echo $_FILES['logfiles']['name'][$i].'('.number_format($_FILES['logfiles']['size'][$i], 0, '.','.').') &nbsp;';
		$total += $_FILES['logfiles']['size'][$i];
		$prefix = ' + ';
	}
	echo  ' = '.number_format($total, 0, '.','.').' bytes';
	//echo $_POST['auto_detect'];
	echo '</span>';
}
//if($server_processing !=='')
//	print_r($user_labels);

//fill color codes
$hour_colors= array();
$min_colors= array();
for($i=0;$i<60;$i++)
{
	$hc = sprintf("%02X%02X%02X", 128, $i*10, (24-$i)*10);
	array_push($hour_colors, $hc);
	$mc = sprintf("%02X%02X%02X", 128, (60-$i)*4, $i*4);	
	array_push($min_colors, $mc);
}
/*
echo "<pre>";
print_r($hour_colors);
print_r($min_colors);
echo "</pre>";
 */
?>
	<table id="logtable">
		<thead>
			<tr>
				<td></td>
				<td></td>
				<td>No</td>
				<td>Date</td>
				<!--
				<td>Label</td>
				-->
				<td>Log</td>
				<td style="width:1px;"></td>
				<td style="width:1px;"></td>
			</tr>
		</thead>
		<tbody>
<?php

$predefinedLabels = array("     at com/ucentric/",
		"     at com/directv/",
		"     at java/lang/",
		"     at java/io/",
		" last message repeated",
		" java.lang.NullPointerException",
		" java.lang.Throwable",
		" FATAL APG",
		" FATAL Ams",
		"  appstarter",
		"  udhcpc"
	);
$labels = array();


function findLabels($line)
{
	global $user_labels;
	$ret = Array();
	$l = count($user_labels);
	
	for($i = 0; $i<$l; $i++){
		if(strstr($line, $user_labels[$i]->name) !== FALSE)
			array_push($ret, $user_labels[$i]->name);
	}
	return $ret;
}
function addLabel($lbl)
{
	global $labels;
	
	$key = array_search($lbl, $labels);
	if($key === false)
	{
		array_push($labels, $lbl);
		return count($labels)-1;
	}
	else
		return $key;
}

function getPredefinedLabel($log)
{
	global $predefinedLabels;
	$cnt = count($predefinedLabels);
	for($i = 0; $i < $cnt; $i++)
	{
		$len = strlen($predefinedLabels[$i]);
		if(strncmp($log, $predefinedLabels[$i], $len) == 0)
				return $predefinedLabels[$i];
	}
	
	return false;
	
}
	//$logfile = $_FILES['logfile']['tmp_name'];
	

$CNT = 1;
$d = "";
$h = "";

$i = 0;

if($_SERVER['REQUEST_METHOD'] !== 'POST')
	goto end;

// add all labels to detected labels to keep order of labels.
if($server_processing !== ''){
	$l = count($user_labels);
	
	for($i = 0; $i<$l; $i++)
		addLabel($user_labels[$i]->name);
}

for ($i = 0; $i < count($_FILES['logfiles']['tmp_name']); $i++) {
	$logfile = $_FILES['logfiles']['tmp_name'][$i];
	$name = $_FILES['logfiles']['name'][$i];
	$size = number_format($_FILES['logfiles']['size'][$i], 0, '.','.').' bytes';
	$handle = @fopen($logfile, "r");
	if ($handle === false) {
		echo "Couldn't open file";
		goto end;
	}
	
	echo "<tr class=\"label_all\" style=\"background-color:#ddd\">";
	echo "<td class=\"hide\"></td>";
	echo "<td class=\"more\"></td>";
	echo "<td>$CNT</td>";
	$CNT++;
	echo "<td> </td>";
	echo "<td id=\"log\">MSG_LOG_FILE_NAME : $name , size : $size </td>";
	echo "<td ></td>";
	echo "<td ></td>";
	echo "</tr>";

	while (($buffer = fgets($handle, 8192)) !== false) {
		$dt = substr($buffer, 0, 16);
		$log = substr($buffer, 16);
		
		if($auto_detect === ''){
			$label = "all";
			
			if($server_processing !== '')
				$other_labels=findLabels($log);
		}
		else
			$label = getPredefinedLabel($log);
		
		if ($label === false)
		{
			$idx = 0;
			$comma = strpos($log, ":");
			$dash = strpos($log, "-");
			if($comma === false || $dash == false){
				if($comma !== false)
					$idx = $comma;

				if($dash !== false)
					$idx = $dash;
			}
			else{
				if($comma < $dash)
					$idx = $comma;
				else
					$idx = $dash;
			}


			if($idx > 0)
			{
				$label = substr($log, 0, $idx);
				//$log = substr($log, $idx+1);
			}
			else
				$label = "   ";
		}
		
		$key = addLabel($label);
		$cl =  " label$key";
		if($server_processing !== ''){		
			foreach ($other_labels as $l){
				$key = addLabel($l);
				$cl .= " label$key";
			}
		}
		
		echo "<tr class=\"$cl\">";
		echo "<td class=\"hide\"></td>";
		echo "<td class=\"more\"></td>";
		echo "<td>$CNT</td>";
		echo "<td><nobr>$dt</nobr></td>";
		
		//echo "<td><nobr>$label</nobr></td>";
		$log = str_replace("<", "&lt;", $log);
		echo "<td id=\"log\">$log</td>";
		
		$dateTime = strtotime($dt);
		if($d !== $dateTime)
		{
			$d = $dateTime;
			$tmp = intval(date('i',$dateTime));
			$mc = $min_colors[$tmp];
		
			$tmp = intval(date('G',$dateTime));
			$hc = $hour_colors[$tmp];
		}
		echo "<td style=\"background-color:#$mc\"></td>";
		echo "<td style=\"background-color:#$hc\"></td>";
		//echo "<td class=\"more\"></td>";
		echo "</tr>";
		$CNT++;
	}
	if (!feof($handle))
			echo "Error: unexpected fgets() fail\n";
	fclose($handle);
	unlink($logfile);
}

end:
	
?>
		</tbody>
	</table>
	<br/>
	<br/>
<!-- ***************************************************************************
							*** LABELS ***
**************************************************************************** -->
	
<div class="toolbar" id="labels_container">
	<img id="close" src="images/close-32.png"/>
	<p class="header">LABELS</p>
	<hr/>
	<div id="labels" class="label_div"></div>

	<button id="checkall">Check All</button>
	<button id="uncheckall">Uncheck All</button>
	<button id="refresh">Refresh</button>
	<button id="sortbyCount">Sort by Count</button>
	<button id="sortbyName">Sort by Name</button>
	<hr/>
	<p>
	Visible / All:
	<span id="logcounters"></span>
	<br/>
	<span>PHP processing time : 
		<?php
		$processing_time = round(microtime(true) * 1000) - $dt_start;
		echo $processing_time.' ms';
		?>
	</span><br/>
	Creation : <span id="creation_time"></span><br/>
	JS processing time : <span id="processing_time"></span>
	</p>
	<hr/>
	<p>
		Search Label:<input id="newlabel"/>
		<button id="addLabel">Add Label</button>
	</p>
	<p>
		Search Regex:<input id="regex"/>
		<button id="addRegex">Add Regex</button>
		JS Regex Tutorial 
		<a href="http://www.w3schools.com/jsref/jsref_obj_regexp.asp" target="_blank"> 1 </a>
		<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp" target="_blank"> 2 </a>

	</p>
	<p>
		Index Label:
		Start:<input id="newStart" type="number"/>
		End :<input id="newEnd" type="number"/>
		<button id="addIndexLabel">Add Label</button>
	</p>
	<hr/>
	<p>
		<button id="btn_color_settings">Color Settings</button>
		<button id="btn_label_settings">Label Settings</button>
	</p>
</div>
<!-- ***************************************************************************
							*** COLOR SETTINGS ***
**************************************************************************** -->
<div class="toolbar hidden" id="color_settings">
	<img class="close" src="images/close-32.png"/>
	<p class="header">Color Settings</p>
	<hr/>
	<div id="color_list" class="label_div">
	</div>
	<hr/>
	<button id="clear_colors">Clear Colors</button>
</div>
<!-- ***************************************************************************
							*** LABEL SETTINGS ***
**************************************************************************** -->
<div class="toolbar hidden" id="label_settings">
	<img class="close" src="images/close-32.png"/>
	<p class="header">Label Settings</p>
	<hr/>
	<div id="label_list" class="label_div">
	</div>
	<hr/>
	<button id="clear_labels">Clear Labels</button>
	<button id="default_labels">Default Labels</button>
</div>

<!-- ***************************************************************************
							*** JAVASCRIPT ***
**************************************************************************** -->

<?php	

echo "<script type=\"text/javascript\">";
	echo "var cnt=".count($labels).";";
	
	if($auto_detect === '')	// don't detect automatically
		echo "var auto_detect=false;";
	else
		echo "var auto_detect=true;";

	if($server_processing === '')	// don't detect automatically
		echo "var server_processing=false;";
	else
		echo "var server_processing=true;";
	
	echo "var labels=[";
	$comma=" ";
	for ($idx =0; $idx < count($labels);$idx++){
		echo "$comma{\"name\":\"".trim($labels[$idx])."\"";
		echo ",\"class\":\"label".$idx."\"";
		echo ",\"bgcolor\":\"\"";
		echo ",\"fgcolor\":\"\"";
		echo "}";
		$comma=", ";
	}
	echo "];";
echo "</script>";

?>
<!-- ***************************************************************************
							*** JAVASCRIPT ***
**************************************************************************** -->
<script type="text/javascript">
	



$(document).ready(function(){
	var tmp;
	
	startProcessingTimer("INIT");
	loadUserData();
	createLabels("");
	
	if(auto_detect){
		autoDetectLabels();
	}
	
	if(server_processing === false)
		createUserDataLabels();

	updateCounters();
	
	
	tmp = addLabel("MSG_LOG_FILE_NAME");
	$('#logtable').find('tbody').find('tr.'+tmp).show();

	$('.toolbar').draggable({ handle: ".header" });
	$('.toolbar').resizable();
	//$("#labels_container .header").css("cursor", "move");	

	$('#uncheckall').click(function(){
		startProcessingTimer("uncheck all");
		$("input:checkbox").prop("checked", false);
		updateScreen();
		stopProcessingTimer();
	});
	$('#checkall').click(function(){
		startProcessingTimer("check all");
		$("input:checkbox").prop("checked", true);
		updateScreen();
		stopProcessingTimer();
	});


	$('#addLabel').click(function(){
		startProcessingTimer("add label");
		var l = $('#newlabel').val();
		addLabel(l,false);
		$('#newlabel').val('');
		stopProcessingTimer();
	});
	$('#addRegex').click(function(){
		startProcessingTimer("add regex");
		var l = $('#regex').val();
		addLabel(l, true);
		$('#regex').val('');
		stopProcessingTimer();
	});
	$('#addIndexLabel').click(function(){
		var s = $('#newStart').val();
		var e = $('#newEnd').val();
		
		s = parseInt(s);
		e = parseInt(e);
		if(isNaN(s) || isNaN(e)){
			alert("Please enter number for start end end");
			return;
		}

		if(s < 0 || e < 0){
			alert("Please enter positive values for start end end");
			return;
		}
		
		if(s >= e)
		{
			alert("start should be less than end ( "+s+" >= "+e+" )");
			return;
		}
		startProcessingTimer("add indexed label");
		addIndexLabel(s,e);
		$('#newStart').val('');
		$('#newEnd').val('');
		stopProcessingTimer();
	});

	$('#sortbyCount').click(function(){
		startProcessingTimer("sort by Count");
		refreshLabels("count");
		stopProcessingTimer();
	});
	$('#sortbyName').click(function(){
		startProcessingTimer("sort by Name");
		refreshLabels("name");
		stopProcessingTimer();
	});
	$('#refresh').click(function(){
		startProcessingTimer("refresh");

		$('#logtable').find('tbody').find('tr').hide();
		$('input.label_checkbox').each(function(){
			s = 'tr.'+$(this).val();
			if($(this).is(':checked'))
				$('#logtable').find('tbody').find(s).show();
		});

		updateCounters();
		stopProcessingTimer();
	});
	$('td.more').click(function(){
		var p = $(this).parent();
		
		var next = p;
		for(var i =0; i< 5; i++){
			$(next).show();
			next = $(next).next();
		}
		
		var prev = p.prev();
		for(var i =0; i< 5; i++){
			$(prev).show();
			prev = $(prev).prev();
		}
		
	});
	$('td.hide').click(function(){
		$(this).parent().hide();
	});
	
	$('#set_title').click(function(){
		var s = $('#new_title').val();
		$('title').html(s);
	});
	$('#replace_keycodes').click(function(){
		startProcessingTimer("Replace Key Codes");
		replaceKeyCode();
		stopProcessingTimer();
	});
	
	$('#show_labels').click(function(){
		$('#labels_container').show();
		$(this).hide();
	});
	$('#close').click(function(){
		$('#labels_container').hide();
		$('#show_labels').show();
	});

	$('.close').click(function(){
		$(this).parent().hide();
	});
	
	$('#clear_colors').click(function(){
		var conf = confirm("Are you sure?");

		if(conf !== true)
			 return;

		resetUserDataColor();	
		$("#color_list").html('');
		alert('Color settings have been cleared.\n Please reload the page.');
	});
	
	$('#clear_labels').click(function(){
		var conf = confirm("Are you sure?");

		if(conf !== true)
			 return;
		resetUserDataLabel();

		$("#label_list").html('');
		alert('Label settings have been cleared.\n Please reload the page.');
	});
	$('#default_labels').click(function(){
		var conf = confirm("Are you sure?");

		if(conf !== true)
			 return;

		$("#label_list").html('');
		loadDefaultLabels();
		labelSettings();
		alert('Default label settings has been restored.');
	});
	$('#btn_color_settings').click(function(){
		colorSettings();
		$('#color_settings').show();
	});
	$('#btn_label_settings').click(function(){
		labelSettings();
		$('#label_settings').show();
	});
	
	$("#submit").click(function(){
		if($('#server_processing').is(':checked'))
			$('input#user_labels').val(JSON.stringify(USER_DATA.labels));
		
		$(this).parent().submit();
	});
	
	$('input#auto_detect').click(function(){
		if($(this).is(':checked'))
			$('input#server_processing').prop('checked', false);
	});
	$('input#server_processing').click(function(){
		if($(this).is(':checked'))
			$('input#auto_detect').prop('checked', false);
	});
	stopProcessingTimer();//INIT
	
});
stopProcessingTimer();//CREATION
</script>
</div>
</body>
</html>
