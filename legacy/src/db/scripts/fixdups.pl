#!/usr/bin/perl

use lib '/DBInterface/wrct/perl-lib';
require 'db.pl';

sub usage {
  print <<DONE;
Usage: fixdups.pl Table Compare1 Compare2...
- Tables should be the actual name of the table,
  and TableID should be the primary key.
- Compare1...CompareN is a list of fields that comprise a duplicate.
DONE
  exit(1);
}

sub main {
  my ($tbl,  @fields) = @ARGV;
  &usage unless $tbl and scalar @fields;

  my $sql = ("SELECT t1.${tbl}ID FROM ${tbl}s as t1 INNER JOIN ${tbl}s as t2\n"
	     . "    ON " . join("\n   AND ", map {"(t1.$_ = t2.$_)"} @fields)
	     . "\n   AND (t1.${tbl}ID > t2.${tbl}ID)\n");
  print "$sql\nWARNING: this script does not merge or cascade. Control-C to cancel.\nPlease wait...\n\n";
  my $sth = $dbh->prepare($sql);
  $sth->execute();

  $sql = "DELETE FROM ${tbl}s WHERE ${tbl}ID = ?\n";
  my $sth2 = $dbh->prepare($sql);
  print $sql;

  my $row;
  while($row = $sth->fetchrow_hashref) {
    print "Duplicate with ID ",$$row{"${tbl}ID"},"\n";
    $sth2->execute($$row{"${tbl}ID"});
  }
  $sth2->finish();

}

&main();
