#!/usr/bin/perl

# RSS Feed - displays the next 5 scheduled shows

use lib "$ENV{WWW_SITE}/perl-lib";
use lib "$ENV{WWW_SITE}/perl-lib/tables";
use POSIX qw(strftime);
require "sql.pl";
require "interface.pl";
require "record.pl";
require 'login.pl';
require 'search.pl';
require 'misc.pl';
require 'task.pl';
require 'calendar2.pl';

require 'program.pl';
$tbl = &TblInit;
push @{$$tbl{order}};

use CGI;
my($cgi) = new CGI;
my $params = $cgi->Vars;
my $sortby = ($$params{sortby} or 'GenreID,Artists.ShortName');

# Start by getting all the shows. It's just too messy to try to
# write a query to fetch what we want.
my ($shows) = &sqlSelectMany($tbl, undef, undef, "StartTime DESC", {debug=>$debug});

my $cal = [ sort cmpCalRows @$shows ];

if ($$params{debug}) {
  print "Content-type: text/html\n\n";
  map { print $$_{StartTime}, "<br />\n" } @$cal;
}

print <<DONE;
Content-type: text/xml

<?xml version="1.0" encoding="iso-8859-1"?>
<rss version="0.91">
  <channel>
    <title>WRCT Program Guide</title>
    <link>http://db.wrct.org/schedule.cgi</link>
    <description>WRCT Pittsburgh, 88.3FM. Freeform radio since 1949.</description>
    <language>en-us</language>
    <webMaster>ism\@wrct.org</webMaster>
DONE
print "    <pubDate>", strftime("%a, %e %b %Y %H:%M:%S %z", localtime), "</pubDate>\n\n";

# Find the first item with a StartTime after now, then back up
my $i;
$now = strftime "%Y-%m-%d %H:%M:%S", localtime;
print "It is now $now<br />\n" if $$params{debug};
print "Processing $#$cal records<br />\n" if $$params{debug};
for ($i=0; $i<$#$cal; $i++) {
  print "cmpDatestamps('$now', '$$cal[$i]->{StartTime}') = ", &cmpDatestamps($now, $$cal[$i]->{StartTime}), "<br />\n" if $$params{debug};
  last if &cmpDatestamps($now, $$cal[$i]->{StartTime}) == -1
}
$i--;
print "Stopping at record $i with StartTime = $$cal[$i]->{StartTime}<br />\n" if $$params{debug};

for (my $n = 0; $n<5 && $i<$#$cal; $i++) { # yes, increment $i

  # Sanity check that EndTime is after StartTime 
  print "$i: $$cal[$i]->{StartTime}, $$cal[$i]->{EndTime}<br />\n" if $$params{debug};
  next unless &cmpDatestamps($$cal[$i]->{StartTime}, $$cal[$i]->{EndTime}) == -1;
  print "Found record<br />\n" if $$params{debug};

  $n++;
  $$cal[$i]->{Program} = $cgi->escapeHTML($$cal[$i]->{Program});
  $$cal[$i]->{Promo} = $cgi->escapeHTML($$cal[$i]->{Promo});
  print <<DONE;
    <item>
      <title>$$cal[$i]->{Program}</title>
      <link>http://db.wrct.org/display.cgi?tbl=Program\&amp;ProgramID=$$cal[$i]->{ProgramID}</link>
      <description>$$cal[$i]->{Promo}</description>
    </item>

DONE
}

print <<DONE;
  </channel>
</rss>
DONE
