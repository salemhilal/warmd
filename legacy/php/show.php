<?PHP

//create show comments depending on type
$show_types = array("show" => "Music show", "pa" => "Public Affairs show");
$playlist_limit = 12;

$conn = mysql_connect("localhost", "www", "fuckyou");
if (!$conn) die(mysql_error());
mysql_select_db("wrct");

$id = $_GET['id'];
$page = $_GET['page'];
$start = $page*$playlist_limit;
if (!$page){
  $page = 0;
  $start = 0;
}
//echo "START: ".$start."<br />";

if (!$id) {
  echo "No show was specified!";
  mysql_close($conn);
  exit(0);
}

//get showinfo
$query = "SELECT ProgramID, Program, DJName, StartTime, EndTime, Promo, Website, Type FROM Programs WHERE ProgramID=".$id;
$shresults = mysql_query($query);

if (mysql_num_rows($shresults) != 1) {
  echo "This show does not exist!";
  mysql_close($conn);
  exit(0);
}

//parse showinfo
$shrow = mysql_fetch_row($shresults);
$sh_id = $shrow[0];
$sh_name = utf8_encode($shrow[1]);
$sh_djname = utf8_encode($shrow[2]);
$sh_start = strtotime($shrow[3]);
$sh_end = strtotime($shrow[4]);
$sh_promo = utf8_encode($shrow[5]);
$sh_website = utf8_encode($shrow[6]);
$sh_type = $shrow[7];

$sh_timestr = date('l', $sh_start)."s from ".date('g:i A', $sh_start)." to ".date('g:i A', $sh_end);

//get program genres
$query = "SELECT s.`SubGenre`, p.`ProgramGenre`, CONCAT_WS('',(s.SubGenre),(p.ProgramGenre)) ".
	"FROM `ProgramGenres` p ".
	"LEFT JOIN `SubGenres` s ON p.`SubGenreID`=s.`SubGenreID` ".
	"WHERE p.`ProgramID`=".$id." ".
	"ORDER BY 3";
$geresults = mysql_query($query);

//print out showinfo
echo "<h1 class='show-name'>".$sh_name."</h1>";
echo "<table><tr><td class='showtbl-left'>";
echo "<div class='show-subtitle'>";
if ($sh_type != "pa")
  echo "With <span class='show-djname'>".$sh_djname."</span> on ";
echo "<span class='show-time'>".$sh_timestr."</span></div>";
//echo "<div class='show-content'>".$show_types[$sh_type]."</div>";

//print out genres if applicable
if (mysql_num_rows($geresults)){
  $gestr = "";
  while ($row = mysql_fetch_row($geresults)) {
    if ($row[0])
      $gestr = $gestr.$row[0].', ';
    else if ($row[1])
      $gestr = $gestr.$row[1].', ';    
  }
  if (strlen($gestr))
    $gestr = substr($gestr, 0, -2);
}
echo "<div class='show-genres'>".$gestr."</div>";

echo "<div class='show-spacer'> </div>";
echo "<hr class='show-hr' width='70%' />";
echo "<div class='show-spacer'> </div>";
echo "<div class='show-promo'>";
if ($sh_promo)
  echo "".$sh_promo."";
echo "</div>";
echo "<div class='show-spacer'> </div>";
echo "<div class='show-website'><a href='".$sh_website."' target='_blank'>".$sh_website."</a></div>";
echo "</td>";
echo "<td class='showtbl-center'> </td>";
//mysql_close($conn);
//exit(0);

//get playlists
$query = "SELECT ".
  "PlayListID, StartTime, EndTime ".//, (SELECT COUNT(Time) FROM Plays WHERE Plays.PlayListID=PlayLists.PlayListID)".
  "FROM `PlayLists` WHERE `ProgramID`=".$id." ORDER BY `StartTime` DESC LIMIT ".$start.", ".$playlist_limit;
$results = mysql_query($query);

if (mysql_num_rows($results) < 1){
  mysql_close($conn);
  echo "<td class='showtbl-right'></td></table>";
  exit(0);
}

//table header
echo "<td class='showtbl-right'>";
echo "<h2 class='showpl-header'>Playlists</h2>";

//setup table
echo "<table>";
//echo "<tr>";
  //echo "<td class='showpl-title'>Link</td>";
//  echo "<td class='showpl-title'>Date</td>";
//echo "</tr>";

//print rows
while ($row = mysql_fetch_row($results)) {
  echo "<tr>";
  //$timestr = date('M j, Y g:i A', strtotime($row[1]))." - ".date('g:i A', strtotime($row[2]));
  $timestr = date('F j, Y', strtotime($row[1]));

  echo "<td colspan='2' class='showpl-date'><a href='/playlist/".$row[0]."'>".$timestr."</a></td>";
  echo "</tr>";
}

//print playlist pagination
//echo "<tr><td colspan='3' class='showpl-footer'>Playlist Count: ".mysql_num_rows($results)."</td></tr>";
echo "<tr><td class='showpl-pagination'>";

if ($page == 1) echo "<a href='./'>Prev</a>";
else if ($page > 0) echo "<a href='./?page=".($page-1)."'>Prev</a>";
//echo "<span width='5px'> </div>";
echo "</td><td class='showpl-pagination' style='text-align: right;'>";
if (mysql_num_rows($results) == $playlist_limit) echo "<a href='./?page=".($page+1)."'>Next</a>";

echo "</td></tr>";

//close table
echo "</table>";

echo "</td></tr></table>";

mysql_close($conn);
