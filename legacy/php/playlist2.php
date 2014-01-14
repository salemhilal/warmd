<html>
<head>
</head>
<body>

<?PHP

//setup sorting
$sortarr = array( 
	"time" => "`Time`",
	"artist" => "`Artist`",
	"album" => "5",
	"track" => "`TrackName`");

$conn = mysql_connect("localhost", "www", "fuckyou");
if (!$conn) die(mysql_error());
mysql_select_db("wrct");

//get variables and handle sorting
$id = $_GET['id'];
$tblsort = 'Time';
$sortvar = $_GET['sort'];
if ($sortvar && $sortarr[$sortvar])
  $tblsort = $sortarr[$sortvar];

//get playlistinfo
$query = "SELECT t1.`StartTime`, t1.`EndTime`, t1.`Comment`, t2.`Program`, t2.`DJName`, t2.`ProgramID` ".
  "FROM `PlayLists` AS t1 ".
  "INNER JOIN `Programs` AS t2 ON t1.`ProgramID`=t2.`ProgramID` ".
  "WHERE t1.`PlayListID`=".$id;
$plresults = mysql_query($query);

if (mysql_num_rows($plresults) != 1) {
  echo "This playlist does not exist!";
  mysql_close($conn);
  exit(0);
}

//parse playlistinfo
$plrow = mysql_fetch_row($plresults);
$pl_showname = utf8_encode($plrow[3]);
$pl_djname = utf8_encode($plrow[4]);
$pl_comment = utf8_encode($plrow[2]);
$pl_start = $plrow[0];
$pl_end = $plrow[1];
$pl_start_str = date('D M j, Y \f\r\o\m g:i A', strtotime($pl_start));
$pl_end_str = date('g:i A', strtotime($pl_end));
$pl_pgrmid = $plrow[5];

//print out playlistinfo
echo "<span class='playlist-name'><a href='/show/".$pl_pgrmid."'>".$pl_showname."</a></span>";
echo " with <span class='playlist-djname'>".$pl_djname."</span>";
echo "<div class='playlist-time'>".$pl_start_str." until ".$pl_end_str."</div>";
echo "<div class='playlist-spacer'> </div>";

//select playlist 
/*$query = "SELECT ".
  "(SELECT `Artist` FROM `Artists` WHERE `Artists`.`ArtistID`=`Plays`.`ArtistID`) AS Artist,".
  "(SELECT `Album` FROM `Albums` WHERE `Albums`.`AlbumID`=`Plays`.`AlbumID`) AS Album,".
  "(AltAlbum),".
  "(TrackName)".
  "FROM `Plays` WHERE `PlayListID`=".$id." ORDER BY `".$tblsort."`";*/
$query = "SELECT t2.Artist, t3.Album, t1.AltAlbum, t1.TrackName, CONCAT_WS('',(t3.Album),(t1.Altalbum)) ".
  "FROM `Plays` AS t1 ".
  "LEFT JOIN `Artists` AS t2 ON t1.`ArtistID`=t2.`ArtistID` ".
  "LEFT JOIN `Albums` AS t3 ON t1.`AlbumID`=t3.`AlbumID` ".
  "WHERE t1.`PlayListID`=".$id." ".
  "ORDER BY ".$tblsort."";
$results = mysql_query($query);

//setup table
echo "<table>";
echo "<tr>";
  echo "<td class='playlist-title'><a href='./?sort=artist'>Artist</a></td>";
  echo "<td class='playlist-title'><a href='./?sort=album'>Album</a></td>";
  echo "<td class='playlist-title'><a href='./?sort=track'>Track</a></td>";
echo "</tr>";

//print rows
while ($row = mysql_fetch_row($results)) {
  echo "<tr>";
  $r_artist = utf8_encode($row[0]);
  $r_album = "";
  if ($row[1] != null)
    $r_album = utf8_encode($row[1]);
  else if ($row[2] != null)
    $r_album = utf8_encode($row[2]);
  $r_track = utf8_encode($row[3]);

  echo "<td class='playlist-artist'>".sanitize($r_artist)."</td>";
  echo "<td class='playlist-album'>".sanitize($r_album)."</td>";
  echo "<td class='playlist-track'>".sanitize($r_track)."</td>";
  echo "</tr>";
}

//print track count
echo "<tr><td colspan='3' class='playlist-footer'>Track Count: ".mysql_num_rows($results)."</td></tr>";

//close table
echo "</table>";

mysql_close($conn);

stream();


function sanitize($input)
{
  $arr = array("<", ">", "&");
  $rep = array("&lt;", "&gt;", "&amp;");

  $string = $input;
  for($i = 0; $i < count($arr); $i++) {
    $string = str_replace($arr[$i], $rep[$i], $string);
  }
  return $string;
}

function stream()
{
/*

<div id='audiosecure' style='display:block;width:750px;height:30px;' href='http://releases.flowplayer.org/data/fake_empire.mp3'></div>
<script>
$f("audiosecure", "flowplayer.audio-3.2.2.swf", {
	plugins: {
		controls: {
			fullscreen: false,
			height: 30,
			autoHide: false
		},
	secure: {
		autoPlay: false,
		onBeforeBegin: function() { $f("player").close(); }
		}
});

</script>

*/

?>

<div id="audio" style="display:block;width:750px;height:30px;"
	href="http://releases.flowplayer.org/data/fake_empire.mp3"></div>

<script>
// install flowplayer into container
$f("audio", "http://releases.flowplayer.org/swf/flowplayer-3.2.7.swf", {

	// fullscreen button not needed here
	plugins: {
		controls: {
			fullscreen: false,
			height: 30,
			autoHide: false
		}
	},

	clip: {
		autoPlay: false,

		// optional: when playback starts close the first audio playback
		onBeforeBegin: function() {
			$f("player").close();
		}
	}

});
</script>
<?php

}

?>

</body>
</html>
