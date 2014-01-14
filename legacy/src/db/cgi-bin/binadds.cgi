#!/usr/bin/perl

# Bin Adds display page.
# parameters are s (for start date) and e (for end date), both in YYYY-MM-DD format

use lib "$ENV{WWW_SITE}/perl-lib";
use lib "$ENV{WWW_SITE}/perl-lib/tables";
require "sql.pl";
require "interface.pl";

require 'review.pl';
$tbl = &TblInit;

use CGI;
my($cgi) = new CGI;
my $params = $cgi->Vars;
my $sortby = ($$params{sortby} or 'GenreID,Artists.ShortName');

&printHead({name=>'Bin'}, $cgi);

if ($$params{s}) {
  $startdate = $$params{s};
} else {
  $startdate = `date +%Y-%m-%d`;
  chop $startdate;
}

$enddate = ($$params{e} or $startdate);

print "<h2>Bin Adds ",
  ($enddate eq $startdate ? $startdate : "$startdate to $enddate"),
  "</h2>\n\n";

$sql = '
select Albums.Album, Albums.AlbumID, Albums.Comp,
       Artists.Artist, Artists.ShortName, Artists.ArtistID,
       Genres.Genre, Genres.GenreID,
       Formats.Format, Formats.FormatID
'.#       Reviews.Review, Reviews.ReviewID
'  FROM Albums LEFT JOIN Artists ON Albums.ArtistID = Artists.ArtistID
              LEFT JOIN Genres ON Albums.GenreID = Genres.GenreID
              LEFT JOIN Formats ON Albums.FormatID = Formats.FormatID
'.#              RIGHT JOIN Reviews ON Reviews.AlbumID = Albums.AlbumID
' WHERE DateAdded >= ? AND DateAdded <= ? AND (Status = ? OR Status = ?)
 ORDER BY Genres.Genre, Albums.Comp, Artists.ShortName';

print "<pre>$sql</pre><br />\n" if $$params{debug};
print "Values: $startdate, $enddate<br />\n" if $$params{debug};

my $sth = $dbh->prepare($sql);
$sth->execute($startdate, $enddate, 'Bin', 'OOB');

print <<DONE;
<table border="1">
  <tr>
    <th>Artist</th>
    <th>Album</th>
    <th>Genre</th>
    <th>Format</th>
    <th>Review</th>
  </tr>
DONE

while (my $row = $sth->fetchrow_hashref) {
  print "  <tr>\n";

  for (qw( Artist Album Genre Format )) {
    print "    <td>\n$$row{$_}\n    </td>\n";
  }

  $sql = '
select Reviews.Review, Users.FName, Users.LName
  FROM Reviews LEFT JOIN Users USING (UserID)
 WHERE Reviews.AlbumID = ?';

  my $sth2 = $dbh->prepare($sql);
  $sth2->execute($$row{AlbumID});
  my $review = $sth2->fetchrow_hashref;
  print "    <td>\n$$review{Review} ($$review{FName} $$review{LName})\n    </td>\n";

  print "  </tr>\n";
}

print "</table>\n";

&printFoot({name=>'Bin'}, $cgi);
