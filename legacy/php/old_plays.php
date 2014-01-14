<?PHP

$conn = mysql_connect("localhost", "www", "fuckyou");
if (!$conn) die(mysql_error());
mysql_select_db("wrct");

$show_id = $_GET['id'];
$limit = 100;
$query = "
  SELECT
    PlayListID,
    DATE(`StartTime`) AS `StartDate`
  FROM PlayLists
  WHERE
    ProgramID=".$show_id."
  ORDER BY StartTime DESC";
$plresults = mysql_query($query);

if (mysql_num_rows($plresults) < 1) {
  echo "This show has no playlists!";
  mysql_close($conn);
  exit(0);
}

//parse grab the playlists
$playlists = array();
while($pl = mysql_fetch_assoc($plresults)) {
  $playlists[] = $pl;
}

$totalCount = 0;

echo "<table border=1>";
echo "<tr>";
echo "<th>Playlist</th>";
echo "<th>Time</th>";
echo "<th>Artist</th>";
echo "<th>Track Name</th>";
echo "</tr>";

foreach ($playlists as $pl) {
  $query = "
    SELECT
      Plays.TrackName,
      time(`Plays`.`Time`) as `Time`,
      Artists.Artist
    FROM Plays
    LEFT JOIN Artists ON (Plays.ArtistID = Artists.ArtistID)
    WHERE
      PlayListID=" . $pl['PlayListID'] . "
    ORDER BY Time DESC";
  $playResults = mysql_query($query);
  $playCount = mysql_num_rows($playResults);
  echo "<tr><td rowspan=\"" . $playCount . "\">";
  echo $pl['PlayListID'] . "<br />";
  echo $pl['StartDate'];
  echo "</td>";
  $first = true;
  while($play = mysql_fetch_assoc($playResults)) {
    if ($totalCount > $limit) {
      return 2;
    }
    if (!$first) {
      echo "<tr>";
    }
    echo "<td>" . $play['Time'] . "</td>";
    echo "<td>" . $play['Artist'] . "</td>";
    echo "<td>" . $play['TrackName'] . "</td>";
    echo "</tr>";
    $first = false;
    $totalCount++;
  }
}

mysql_close($conn);
