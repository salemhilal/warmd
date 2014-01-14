#!/usr/bin/perl

use lib "$ENV{WWW_SITE}/perl-lib";
require "sql.pl";
require "interface.pl";
require "login.pl";
require 'task.pl';
require 'search.pl';

use CGI;

$cgi = new CGI;
$params = $cgi->Vars;

use lib "$ENV{WWW_SITE}/perl-lib/tables";
require "user.pl";
$tbl = &TblInit;

&printHead({name=>'Login'}, $cgi);

  print <<DONE;
<table border="0" cellspacing="0" cellpadding="0" width="100%">
  <tr valign="middle">
    <td align="center">

<h1>wrct: a database</h1>

DONE

# Look for a session; otherwise, try to get a session from User and Password.
# Then use the session to lookup the user info
#if (
#    ($$params{session} or
#     ($$params{User}
#      and
#      (
#       $$params{session} = &OpenSession($ENV{REMOTE_USER},{debug=>$$params{debug}})
#       )
#      )
 #    )
    
#    and $user = &loginSession($ENV{REMOTE_USER},$$params{'debug'})
#    )
if ( $user = &loginSession($ENV{REMOTE_USER}) )
{
  # Whew! All logged in.

  &printUserInfo($cgi, $user);
  &printPlaylists($cgi, $user);
  print "<h2>--Database--</h2>\n\n";
  &printStartData;
  &printSearchForm(undef, $cgi, {session=>$$params{session},debug=>$$params{debug}});
  print '<a href="merge.cgi?session=', $$params{session},'">Merge Records</a>';
  &printEndData;

  my ($tasks) = &sqlSelectMany({table=>'UserTasks'}, ['Task'],
			       {string=>'UserID = ?', values=>[$$user{UserID}]},
			       undef, {nolookup=>1, debug=>$$params{debug}});
  for (@$tasks) {
    &printTaskSelect($cgi, $user, $$_{Task});
  }

} else { # no successful login, print login screen

  &printLoginForm($cgi);

}

print <<DONE;

    </td>
  </tr>
</table>
DONE
&printFoot({name=>'Login'}, $cgi);

######################################################################
# Helper functions
######################################################################

sub printLoginForm {
  my ($cgi) = @_;
  my $action = $cgi->url(-relative=>1);
  print "<h2>login</h2>\n\n";
  print "Error: invalid password<br />\n" if $cgi->param('User');

  print <<DONE;
<form action="$action" method="post">
<input type="hidden" name="debug" value="$$params{debug}" />
<table border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td align="right">User Name:</td>
    <td align="left"><input type="text" name="User" value="$$params{User}" /></td>
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
DONE
}
