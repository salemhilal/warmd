#!/usr/bin/perl

use lib "$ENV{WWW_SITE}/perl-lib";
require "sql.pl";
require "interface.pl";
require "login.pl";

use CGI;

$cgi = new CGI;
$params = $cgi->Vars;

use lib "$ENV{WWW_SITE}/perl-lib/tables";
require "user.pl";
$tbl = &TblInit;

$user = &loginSession($$params{session});
unless ($user) {
  print $cgi->header;
  &error('Must be <a href="index.cgi">logged in</a> to change password');
}

if ($$params{passwd1} and $$params{passwd1} eq $$params{passwd2}) {
  $passwd = crypt($$params{passwd1},
		  join('',('.','/','a'..'z','A'..'Z',0..9)[rand 64,rand 64]));
  &sqlUpdate($tbl, { Password=>$passwd },
	     {string=>'UserID = ?', values=>[$$user{UserID}]}, $$params{debug});
  print "Location: index.cgi?session=$$params{session}\n\n";
  exit(0);
}
&printHead({name=>'NoLink'},$cgi);

print "<h3 class=\"error\">Passwords don't match</h3>\n\n"
  if $$params{passwd1} ne $$params{passwd2};


print <<DONE;
<form action="passwd.cgi" method="post">
<input type="hidden" name="session" value="$$params{session}">
<table border="0">
  <tr>
    <td align="right">Enter New Password:</td>
    <td align="left"><input type="password" name="passwd1"></td>
  </tr>
  <tr>
    <td align="right">Comfirm Password:</td>
    <td align="left"><input type="password" name="passwd2"></td>
  </tr>
  <tr>
    <td align="center" colspan="2"><input type="submit" value="Change Password"></td>
  </tr>
</table>
</form>
DONE

&printFoot({name=>'NoLink'},$cgi);
