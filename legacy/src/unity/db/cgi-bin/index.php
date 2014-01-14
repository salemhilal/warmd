<?

$wrctusername = $_SERVER['REMOTE_USER'];

$db = mysql_connect("","www","fuckyou");
mysql_select_db("wrct",$db);

if(isset($_POST["tryagain"])){
	$username = $_POST['User'];
	$userpass = $_POST['Password'];

	$result = mysql_query("Select * from Users where User='".$username."'");

	if(mysql_num_rows($result) == 1){
		$line = mysql_fetch_array($result);
		$hashedpass = $line['Password'];

		$password = crypt($userpass,$hashedpass);		
                
		if($hashedpass != "" && $line['Password'] != $password){
			echo "Wrong username/password.   Please click 'back' and try again.  If you continue to have problems, e-mail ism@wrct.org";
                	return;
                }

                $origusername = $line['User'];

                mysql_query("Update Users set WRCTUser='".$wrctusername."' where User='".$origusername."'");
	}
	else{
		echo "Username not found.  Please click 'back' and try again.  If you continue to have problems, e-mail ism@wrct.org";
		return;
	}	

	
}

$result = mysql_query("Select * from Users where WRCTUser='".$wrctusername."'");

if(mysql_num_rows($result) == 1){
        header("Location: index.cgi");
        exit;
}

?>

<!DOCTYPE html 
     PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
     "DTD/xhtml1-transitional.dtd">
<html>
<head>
   <meta name="Author" content="Joel Young" />
   <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
   <title>WRCT Pittsburgh 88.3 FM - Database</title>
   <link rel="StyleSheet" href="/StyleSheets/wrct/global.css" type="text/css" media="screen" />
</head>

<body background="/img/wrct/bg-database.gif"
      bgcolor="black" text="#BFBFBF" link="#8899ff" vlink="#9999cc">
<br />
<table border="0">
   <tr>
      <td><img src="/img/wrct/blackpixel.gif" width="40" alt="" /></td>
      <td colspan="2"><a href="index.cgi"><img src ="/img/wrct/blank.gif" width="142" height="1" border="0" alt="" /></a><br />
        <img src="/img/wrct/orangebar.gif" width="417" height="2" border="0" alt="" />
      </td>
   </tr>
   <tr>
      <td></td>
      <td><img src="/img/wrct/blackpixel.gif" width="30" alt="" /></td>
      <td>
<table border="0" cellspacing="0" cellpadding="0" width="100%">
  <tr valign="middle">
    <td align="center">

<h1>wrct: a database</h1>
<h2><font color='red'>This should be the first and last time you see this page.  If you see this twice, e-mail ism@wrct.org</font></h2>
<h2>login</h2>

<form action="<?echo $_SERVER['PHP_SELF'];?>" method="post">
<input type="hidden" name="tryagain" value="1" />
<table border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td align="right">User Name:</td>
    <td align="left"><input type="text" name="User" value="" /></td>
  </tr>
  <tr>
    <td align="right">Password:</td>
    <td align="left"><input type="password" name="Password" /></td>
  </tr>
  <tr>
    <td align="center" colspan="2"><input type="submit" value="Log In" /></td>
  </tr>
</table>
</form>

    </td>
  </tr>
</table>
    </td>
  </tr>
</table>

</body>
</html>
