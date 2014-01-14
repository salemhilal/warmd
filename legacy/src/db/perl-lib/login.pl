require "sql.pl";

# Functions for users logging in to the system.
# The Right Way to do this is with apache SSL, which may happen one day.

###################################
# DESCRIPTION:  Trivial encryption of a number
# ARGUMENTS:    $n - the number
# RETURN value: a string which will return $n when passed through decrypt
###################################
sub encrypt {
  my ($n) = @_;
  my $m = int (rand 90000 + 10000);
#  print "modulo = $m\n";
  my $r = int(rand 10000) * $m + $n; # $r mod $m will return $n
#  print "random number = $r\n";
#  print "r mod m = ", ($r % $m), "\n";
  return $r * 100000 + $m;
}

###################################
# DESCRIPTION:  Trivial decryption of a number
# ARGUMENTS:    $s - the crypted string
# RETURN value: the decrypted number
###################################
sub decrypt {
  my ($s) =@_;
  my $r = int($s / 100000);
  my $m = $s % 100000;
  return 0 if ($r == 0 or $m == 0);
  return $r % $m;
}

sub OpenSession {
  my ($username, $opt) = @_;

  my $row = &sqlSelectRow({table=>'Users'}, [ 'UserID' ],
			  { string=>"WRCTUser = ?", values=>[$username] },
			  undef,
			  $$opt{debug});

  #print "stored password: $$row{Password}; compared password: ",  crypt($passwd, $$row{Password}), "<br />\n" if $$opt{debug};
  # zero-length passwords in DB will accept any value
  #return 0 if (not defined $row or ($$row{Password} and
  #          crypt($passwd, $$row{Password}) ne $$row{Password}));

return 0 if (not defined $row);
  return &encrypt($$row{UserID});
}

sub loginSession {
  my ($username, $debug, $tbls) = @_;

  my $wrctusername = $ENV{REMOTE_USER};
  require "user.pl";
  $$tbls{user} = TblInit() unless $$tbls{user};
  return &sqlSelectRow($$tbls{user}, undef,
		       {string=>'WRCTUser = ?', values=>[$wrctusername]},
		       undef, $debug);
}

# takes 2 AuthLevel strings, returns whether the first >= the second
sub AuthGTE {
  my($auth1, $auth2, $debug) = @_;
  print "Checking if authlevel '$auth1' is >= '$auth2'<br />\n" if $debug;
  my %auth = ('None'=>1, 'Trainee'=>2, 'User'=>3, 'Exec'=>4, 'Admin'=>5);

  return $auth{$auth1} >= $auth{$auth2};
}

1;
