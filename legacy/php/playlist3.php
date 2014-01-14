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
if (!array_key_exists('id', $_GET) || !$_GET['id']) {
  // grab a random one!
  $query = "SELECT `PlayListID` FROM `PlayLists` ORDER BY RAND() LIMIT 1";
  $plresults = mysql_query($query);
  $plrow = mysql_fetch_row($plresults);
  echo "No playlist is specified :(<br />";
  echo "Might we suggest <a href=\"/playlist/{$plrow[0]}/\"> this one?</a>";
  exit(0);
}
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


/**************************
  Media Player section
 **************************/
$showlength_time = strtotime($pl_end) - strtotime($pl_start);
$showlength = $showlength_time/60/60;
$i = 0;

?>

<h2>Audio Logs</h2>
<table>

<?php
while($i < $showlength) {
  $addstr = " +$i hours";
  $ptime = strtotime($pl_start.$addstr);

  if ($ptime >= time()) break;

  $p_year = date('Y',$ptime);
  $p_month = date('m',$ptime);
  $p_day = date('d',$ptime);
  $p_hour = date('H',$ptime);

  ?>

  <tr><td style="vertical-align: top; padding-top: 15px;">  
    Hour <?php echo ($i+1); ?>
  </td>
  <td>
    <?php getplayer($p_year,$p_month,$p_day,$p_hour); ?>
  </td></tr>
  
  <?php
  $i++;
}
echo "</table>";

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


function getplayer($year,$month,$day,$hour) {
  $url = formstreamurl($year, $month, $day, $hour, "lo");
  ?>

  <object id="emff" type="application/x-shockwave-flash" data="http://db.wrct.org/php/player/emff.swf?src=<?php echo $url; ?>" width="150" height="40">
    <param name="movie" value="http://db.wrct.org/php/player/emff.swf?src=<?php echo $url; ?>" />
    <param name="quality" value="high" />
  </object>

  <?php
}

function formstreamurl($year,$month,$day,$hour,$quality) {
  $prefix = "http://db.wrct.org/php/test/";
  //return $prefix."getfile.php?year=$year&month=$month&day=$day&hour=$hour&quality=$quality";
  return $prefix."getfile.php?date=$year-$month-$day-$hour-$quality";
}
