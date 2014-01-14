#!/usr/bin/perl
## Review statistics. Non-authenticated.
## By Andrew Widdowson <apw2@wrct.org> 9/15/2002
use DBI;
use CGI qw/:standard/;
$dbh = DBI->connect('dbi:mysql:wrct','www','fuckyou');

srand;

if (param()) {

#    $go = param('whats') eq 'week' ? 1 : 0;
#    if $go == 1 {
#	my $sth = $dbh->prepare("select count(*) as quan, Reviews.UserID, Users.FName, Users.LName from Reviews,Users where Users.UserID=Reviews.UserID AND Reviews.Time >= date_sub(now(), INTERVAL ".(param('whats') eq 'week' ? param('num')*7 : param('num')).' '.(param('whats') eq 'week' ? 'day' : param('whats')).") group by UserID order by quan DESC");
#    }
#    else{
	my $d = param('year')*10000000000+param('month')*100000000+param('day')*1000000;
	my $sth = $dbh->prepare("select count(*) as quan, Reviews.UserID, Users.FName, Users.LName from Reviews,Users where Users.UserID=Reviews.UserID AND Reviews.Time >= $d group by UserID order by quan DESC");
#    }

    $sth->execute();
	
    $queryHTMLdata = "<TABLE BORDER=1><TR><TH>Reviews #</TH><TH>First Name</TH><TH>Last Name</TH><TH>User ID</TH></TR>";

    while (my $ref = $sth->fetchrow_hashref()) {
	    $queryHTMLdata.="<TR><TD>$ref->{'quan'}</TD><TD>$ref->{'FName'}</TD><TD>$ref->{'LName'}</TD><TD>$ref->{'UserID'}</TD></TR>";
    }

    $queryHTMLdata.="</TABLE>";
    $sth->finish();
}



         print header,
               start_html('Review Counter'),
               h1('Review Counter'),p,
    start_form,
#    p,'Use date, or interval ',popup_menu(-name=>'method',-values=>['date','interval']),
    p,'Show me the review count since ',
    'Month:',popup_menu(-name=>'month',-values=>['1','2','3','4','5','6','7','8','9','10','11','12']),
    'Day:',popup_menu(-name=>'day',-values=>['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31']),
    'Year:',popup_menu(-name=>'year',-values=>['2007','2006','2005','2004','2003','2002','2001','2000','1999']),
#    p,'Show me the review count for the past ',
#    textfield(-name=>'num', -size=>2),
#       popup_menu(-name=>'whats',
#                          -values=>['month','day','week']),'(s)',p,
               submit,$queryHTMLdata,p
               end_form,
    hr;


