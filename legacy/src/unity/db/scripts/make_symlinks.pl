#!/usr/bin/perl -w
# Makes a bunch of crazy symlinks and directories to satisfy db.wrct.org's
# odd URI mappings.
sub usage {
	print "Usage:\n$0 /full/path/to/web/site/document/root /full/path/to/source/code\n";
	exit;
}
my ($docroot, $srcpath) = @ARGV;

&usage unless -d $docroot;
&usage unless -d $srcpath;

$docroot=~s/\/$//;
$srcpath=~s/\/$//;

die "Error: no cgi-bin subdirectory in $srcpath" unless -d $srcpath."/cgi-bin";

print "Linking *.cgi in cgi-bin path $srcpath/cgi-bin to equivalents in document root $docroot\n";
opendir(DIR, "$srcpath/cgi-bin") || die "can't opendir $srcpath/cgi-bin: $!";
my @cgis = grep { ( /\.cgi$/ || /\.php$/) && -f "$srcpath/cgi-bin/$_" } readdir(DIR);
closedir DIR;
foreach $cgi (@cgis) {
	my $cmd = "ln -s $srcpath/cgi-bin/$cgi $docroot/$cgi";
	print "Running '$cmd'\n";
	system($cmd);

}

print "Setting up docroot/img/wrct to point to source/img\n";
foreach $cmd(
	"mkdir $docroot/img",
	"ln -s $srcpath/img $docroot/img/wrct", 
	"mkdir $docroot/StyleSheets", "ln -s $srcpath/style $docroot/StyleSheets/wrct",
	"ln -s $srcpath/inc/wrct/main-playing.shtml $docroot/main-playing.shtml"
) {
	print "$cmd\n";
	system($cmd);
}
