#!/usr/bin/perl

# Searches for functions that are declared but not called

$BASEPATH = '/Volumes/War/DBInterface/wrct';
$EXT = [ '.cgi', '.pl' ];

foreach (@$EXT) {
  open FIND, "find $BASEPATH -name \\\*$_ |" or die "Couldn't execute find: $!\n";
  while ($file = <FIND>) {
    chop $file;
    push @files, $file;
  }
  close FIND;
}
#print "Files:\n";
#print join("\n", @files), "\n";

print "Pass 1: compiling names of functions...";
foreach $file (@files) {
  if (open FILE, $file) {

    while (my $line = <FILE>) {
      $functions{$1} = $file if $line =~ /sub\s+(\S+)\s+\{/;
    }

  } else {
    warn "$_: $!\n";
  }
}
print "done\n";

#print "Functions found:\n";
#for (sort keys %functions) {
#  print "$functions{$_}: sub $_\n";
#}

######################################################################

print "Pass 2: checking which functions are used...";
foreach (@files) {
  if (open FILE, $_) {

    while (my $line = <FILE>) {
      while ($line =~ /\&([^\(;\s]+)/g and exists $functions{$1}) {
	$functions{$1} = 0;
      }
    }

  } else {
    warn "$_: $!\n";
  }
}
print "done\n";

print "\nAnd the dead wood is:\n\n";
for (sort keys %functions) {
  print "$functions{$_}: sub $_\n" if $functions{$_};
}
