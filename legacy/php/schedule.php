<?PHP

//pull in the db credentials
$server = 'localhost';
$user = 'www';
$pass = 'fuckyou';
$db = 'wrct';

//open connection to db
$conn = mysql_connect($server, $user, $pass) or die(mysql_error());
mysql_select_db($db);

//get current shows
$query = "SELECT * FROM `Programs` WHERE `EndTime`>`StartTime`";
$results = mysql_query($query) or die(mysql_error());


while($row = mysql_fetch_array($results)) {
  foreach ($row as $col) {
    echo $col.',';
  }
  echo '<br />';
}

mysql_close($conn);


?>
