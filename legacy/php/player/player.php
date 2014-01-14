<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US">
<head>
  <title>WRCT Popup Player</title>
  <link rel="stylesheet" href="player.css" type="text/css" media="screen" />
  <script type="text/javascript">
    function updateNP() {
      if (window.XMLHttpRequest) {
        xmlhttp=new XMLHttpRequest();
      } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
      }
      xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200){
          document.getElementById("nowPlayingDiv").innerHTML=xmlhttp.responseText;
          //alert(xmlhttp.responseText);
        }
      };
      xmlhttp.open("GET", "display.php", true);
      xmlhttp.send(null);
    }

    function pageload() {
      updateNP();
      setInterval("updateNP()", 30000);
    }
  </script>			

</head>
<body onload='pageload()'>
<div id="content">
  <div id="header">WRCT: A Webstream</div>

  <div id="nowPlayingDiv"></div>

  <object id="emff" type="application/x-shockwave-flash" data="emff.swf?src=http://stream.wrct.org:8000/wrct-hi.mp3" width="150" height="40">
    <param name="movie" value="emff.swf?src=http://stream.wrct.org:8000/wrct-hi.mp3" />
    <param name="quality" value="high" />
  </object>
</div>
</body>
</html>
