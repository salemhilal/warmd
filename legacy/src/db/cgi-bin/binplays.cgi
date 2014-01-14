#!/usr/bin/perl
## Bin play statistics. Non-authenticated.
## By Andrew Widdowson <apw2@wrct.org> 10/05/2002
use DBI;
use CGI qw/:standard/;
$dbh = DBI->connect('dbi:mysql:wrct','www','fuckyou') or die("NO ACCESS");

srand;


if (param()) {


	$foo = "select Plays.PlayListID, Users.FName, Users.LName, PlayLists.endtime, Programs.Program,".
                            " sum(Plays.B = 'Yes') as playcount from Plays, PlayLists, Programs, Users where".
			    " Plays.PlayListID = PlayLists.PlayListID and PlayLists.endtime > DATE_SUB(now(), INTERVAL ".param('numback')." ".param('whatsback').") and ".
		            " PlayLists.endtime < DATE_ADD(DATE_SUB(now(), INTERVAL ".param('numback')." ".param('whatsback')."), INTERVAL ".param('num')." ".param('whats')." ) and ".
			    (param('lname') ne '' ? " Users.LName like '%".param('lname')."%' and " : '') .
			    (param('prog') ne '' ? " Programs.Program like '%".param('prog')."%' and " : '') .
                            " Programs.ProgramID = PlayLists.ProgramID and Users.UserId = Programs.UserID ".
			    " group by PlayLists.PlayListID order by PlayLists.endtime DESC";	
    my $sth = $dbh->prepare($foo);
    $sth->execute();

    $queryHTMLdata = "<TABLE BORDER=1><TR><TH>PID</TH><TH>First Name</TH><TH>Last Name</TH><TH>End Time</TH><TH>Program</TH><TH>Bin Cuts</TH></TR>";

    while (my $ref = $sth->fetchrow_hashref()) {
	    $queryHTMLdata.="<TR><TD><A HREF=\"playlist.cgi?id=$ref->{'PlayListID'}\">$ref->{'PlayListID'}</A></TD><TD>$ref->{'FName'}</TD><TD>$ref->{'LName'}</TD><TD>$ref->{'endtime'}</TD><TD>$ref->{'Program'}</TD><TD>$ref->{'playcount'}</TD></TR>";
    }

    $queryHTMLdata.="</TABLE>";
    $sth->finish();

}



         print header,
               start_html('Bin Plays');
#	print  "\n<!-- Query:\n     $foo\n-->\n";
#	print  "<P>$foo\n</P>";

        print       h1('Bin Cuts Auditor'),p,
    start_form,
               p,'Show me the bin plays for ',textfield(-name=>'num', -size=>2),
               popup_menu(-name=>'whats',
                          -values=>['MONTH', 'DAY', 'YEAR']),'(s), backing up by ',
		textfield(-name=>'numback', -size=>2),
               popup_menu(-name=>'whatsback',
                          -values=>['MONTH','DAY', 'YEAR']),'(s) first. '
		,p,
		'Narrow down to last name like ', textfield(-name=>'lname', -size=>20),
		'and/or program name like ', textfield(-name=>'prog', -size=>20),
		,p,
# $foo,
               submit,$queryHTMLdata,p
               end_form,
    hr;


