use DBI;

my ($dbname, $dbuser, $dbpass);

my $fileprefix="/home/sandbox/etc/".$ENV{SERVER_NAME};

if (-f "${fileprefix}_database") {
	open(F, "${fileprefix}_database") || die("Could not access ${fileprefix}_database");
	$dbname=<F>;
	$dbname=~s/\r|\n//g;
	close(F);
} else {
	$dbname='wrct';
}

if (-f "${fileprefix}_username") {
	open(F, "${fileprefix}_username") || die("Could not access ${fileprefix}_username");
	$dbuser=<F>;
	$dbuser=~s/\r|\n//g;
	close(F);
} else {
	$dbuser='www';
}

if (-f "${fileprefix}_password") {
	open(F, "${fileprefix}_password") || die("Could not access ${fileprefix}_password");
	$dbpass=<F>;
	$dbpass=~s/\r|\n//g;
	close(F);
} else {
	$dbpass='fuckyou';
}

$dbh = DBI->connect('dbi:mysql:'.$dbname,$dbuser,$dbpass);

srand;

1;
